require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function run() {
  console.log('Fetching reviews without embeddings...');
  
  // Fetch up to 1500 reviews that have no embedding
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('id, text')
    .is('embedding', null)
    .limit(1500);

  if (error) {
    console.error('Error fetching reviews:', error);
    return;
  }

  console.log(`Found ${reviews.length} reviews to process.`);

  // Process in batches of 100 to avoid OpenAI rate limits / token limits
  const batchSize = 100;
  for (let i = 0; i < reviews.length; i += batchSize) {
    const batch = reviews.slice(i, i + batchSize);
    console.log(`Processing batch ${i / batchSize + 1} / ${Math.ceil(reviews.length / batchSize)}`);

    try {
      const texts = batch.map(r => r.text);
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts,
      });

      // Update Supabase
      const updates = batch.map((r, index) => {
        return supabase
          .from('reviews')
          .update({ embedding: embeddingResponse.data[index].embedding })
          .eq('id', r.id);
      });

      await Promise.all(updates);
      console.log(`Successfully embedded and saved ${batch.length} reviews.`);
    } catch (e) {
      console.error('Error processing batch:', e.message);
    }
  }
  
  console.log('Finished backfilling embeddings!');
}

run();
