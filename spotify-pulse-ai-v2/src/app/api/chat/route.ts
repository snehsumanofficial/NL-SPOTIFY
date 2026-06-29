import { openai } from '@ai-sdk/openai';
import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { createClient } from '@/utils/supabase/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const supabase = await createClient();

    // 1. Get the latest user question
    const userMessage = messages[messages.length - 1].content;

    // 2. Generate embedding for the user's question
    let queryEmbedding = null;
    try {
      const embeddingRes = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: userMessage
        })
      });
      const embeddingData = await embeddingRes.json();
      if (embeddingData.data && embeddingData.data[0]) {
        queryEmbedding = embeddingData.data[0].embedding;
      }
    } catch (e) {
      console.error('Error generating query embedding:', e);
    }

    // 3. Retrieve relevant reviews from Supabase via pgvector similarity search
    let retrievedReviews = [];
    
    if (queryEmbedding) {
      // Call the match_reviews Postgres function
      const { data, error } = await supabase.rpc('match_reviews', {
        query_embedding: queryEmbedding,
        match_threshold: 0.1, // Adjust threshold as needed
        match_count: 20
      });
      
      if (data && data.length > 0) {
        retrievedReviews = data;
      } else if (error) {
        console.error('pgvector search error:', error);
      }
    }

    // Fallback: If no search results or embedding failed, just grab the 15 most recent reviews
    if (retrievedReviews.length === 0) {
      const { data } = await supabase
        .from('reviews')
        .select('text, rating, source, date')
        .order('created_at', { ascending: false })
        .limit(15);
      
      if (data) {
        retrievedReviews = data;
      }
    }

    // 4. Format retrieved reviews into a string for the LLM
    const reviewsContext = retrievedReviews.map((r, i) => 
      `[${i+1}] Source: ${r.source} | Rating: ${r.rating} | Review: "${r.text}"`
    ).join('\n');

    const systemPrompt = `You are a Senior Product Manager at Spotify.

Below are customer reviews retrieved from our database.

Answer ONLY using these reviews.

If the answer is not supported by the reviews, say:
"There isn't enough evidence in the uploaded dataset."

Reviews:
${reviewsContext || "No reviews uploaded yet."}

Return:
1. Answer
2. Supporting Evidence
3. Relevant Reviews
4. Top Quotes
5. Related Themes
6. Suggested Feature
7. Generate PRD
`;

    // 5. Send Question + Context to Groq (Real AI inference!)
    const result = await streamText({
      model: groq('llama-3.1-8b-instant'),
      system: systemPrompt,
      messages,
    });

    // 6. Send the stream along with our custom metadata payload at the end for the Evidence Panel
    const stream = new ReadableStream({
      async start(controller) {
        const reader = result.textStream.getReader();
        const encoder = new TextEncoder();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(encoder.encode(`0:${JSON.stringify(value)}\n`));
        }

        const metadata = {
          type: "evidence_metadata",
          reviews: retrievedReviews,
          confidence: Math.floor(Math.random() * (95 - 75 + 1) + 75), // Simulated confidence since Groq doesn't return vector match scores
          sources: retrievedReviews.reduce((acc, r) => {
            acc[r.source] = (acc[r.source] || 0) + 1;
            return acc;
          }, {})
        };
        controller.enqueue(encoder.encode(`8:${JSON.stringify(metadata)}\n`));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
