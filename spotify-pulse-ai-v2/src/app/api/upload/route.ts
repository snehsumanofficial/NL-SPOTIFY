import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import Papa from 'papaparse';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    
    // Parse CSV
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    const reviews = parsed.data as any[];
    
    // Limit to 10 for demo purposes to avoid huge OpenAI bills
    const sampleReviews = reviews.slice(0, 10);

    for (const review of sampleReviews) {
      const rawText = review.text || review.Review || review.content || 'No text';
      
      let embeddingVector = null;
      try {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: rawText
          })
        });
        const embeddingData = await response.json();
        if (embeddingData.data && embeddingData.data[0]) {
          embeddingVector = embeddingData.data[0].embedding;
        }
      } catch (embErr) {
        console.error('Error generating embedding:', embErr);
      }

      // 1. Insert into Supabase Reviews table
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .insert({
          text: rawText,
          rating: parseInt(review.rating || review.Rating || review.score) || null,
          source: review.source || review.Source || 'CSV Upload',
          date: review.date || review.Date || new Date().toISOString(),
          embedding: embeddingVector
        })
        .select()
        .single();

      if (reviewError) {
        console.error('Error inserting review:', reviewError);
        continue;
      }

      // 2. Call OpenAI for Analysis
      try {
        const { object } = await generateObject({
          model: openai('gpt-4o-mini'),
          schema: z.object({
            theme: z.string(),
            sub_theme: z.string(),
            sentiment: z.enum(['Positive', 'Neutral', 'Negative', 'Mixed']),
            emotion: z.string(),
            persona: z.string(),
            pain_point: z.string(),
            user_need: z.string(),
            root_cause: z.string(),
            feature_request: z.string(),
            business_impact: z.enum(['Low', 'Medium', 'High']),
            confidence: z.number().min(0).max(100),
          }),
          prompt: `Analyze the following user review for a music streaming app (like Spotify). Extract the requested fields. Review: "${reviewData.text}"`,
        });

        // 3. Insert into Supabase Analysis table
        await supabase
          .from('analysis')
          .insert({
            review_id: reviewData.id,
            ...object
          });
          
      } catch (aiError) {
        console.error('Error generating analysis:', aiError);
      }
    }

    return NextResponse.json({ success: true, count: sampleReviews.length });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
