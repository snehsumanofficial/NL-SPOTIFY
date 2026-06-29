const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Pune%407066977@db.qqkfzgxrutsrscylmqiu.supabase.co:5432/postgres';

const setupSQL = `
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS embedding vector(1536);

CREATE OR REPLACE FUNCTION match_reviews (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  text text,
  rating integer,
  source text,
  date date,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    reviews.id,
    reviews.text,
    reviews.rating,
    reviews.source,
    reviews.date,
    1 - (reviews.embedding <=> query_embedding) AS similarity
  FROM public.reviews
  WHERE reviews.embedding IS NOT NULL AND 1 - (reviews.embedding <=> query_embedding) > match_threshold
  ORDER BY reviews.embedding <=> query_embedding
  LIMIT match_count;
$$;
`;

async function run() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to Supabase DB directly.');
    await client.query(setupSQL);
    console.log('Successfully configured pgvector and match_reviews function.');
  } catch (err) {
    console.error('Error connecting or executing SQL:', err);
  } finally {
    await client.end();
  }
}

run();
