const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Pune%407066977@db.qqkfzgxrutsrscylmqiu.supabase.co:5432/postgres';

const setupSQL = `
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    source TEXT,
    date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
    theme TEXT,
    sub_theme TEXT,
    sentiment TEXT,
    emotion TEXT,
    persona TEXT,
    pain_point TEXT,
    user_need TEXT,
    root_cause TEXT,
    feature_request TEXT,
    business_impact TEXT,
    confidence INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    evidence TEXT,
    reach TEXT,
    impact TEXT,
    confidence TEXT,
    effort TEXT,
    priority TEXT,
    kpi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read reviews" ON public.reviews;
CREATE POLICY "Allow authenticated users to read reviews" ON public.reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to insert reviews" ON public.reviews;
CREATE POLICY "Allow authenticated users to insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to read analysis" ON public.analysis;
CREATE POLICY "Allow authenticated users to read analysis" ON public.analysis FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to insert analysis" ON public.analysis;
CREATE POLICY "Allow authenticated users to insert analysis" ON public.analysis FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to read opportunities" ON public.opportunities;
CREATE POLICY "Allow authenticated users to read opportunities" ON public.opportunities FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to insert opportunities" ON public.opportunities;
CREATE POLICY "Allow authenticated users to insert opportunities" ON public.opportunities FOR INSERT WITH CHECK (true);
`;

async function run() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to Supabase DB directly.');
    await client.query(setupSQL);
    console.log('Successfully created tables and policies.');
  } catch (err) {
    console.error('Error connecting or executing SQL:', err);
  } finally {
    await client.end();
  }
}

run();
