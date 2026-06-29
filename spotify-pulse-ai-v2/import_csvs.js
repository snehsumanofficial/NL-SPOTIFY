require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const csvDir = path.join(__dirname, '..'); // project root folder above v2

const csvFiles = [
  'playstore_discovery_repetition_filtered.csv',
  'playstore_loosened_filter.csv',
  'reddit_spotify_discovery_thread.csv',
  'trustpilot_combined.csv',
  'youtube_reviews_spotify.csv',
  'youtube_thread1_comments.csv'
];

async function run() {
  console.log('Starting bulk import...');
  let totalInserted = 0;

  for (const fileName of csvFiles) {
    const filePath = path.join(csvDir, fileName);
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${fileName}, file not found.`);
      continue;
    }

    console.log(`Processing ${fileName}...`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    const reviews = parsed.data;
    const batchSize = 100;
    
    for (let i = 0; i < reviews.length; i += batchSize) {
      const batch = reviews.slice(i, i + batchSize).map(r => {
        // Extract common text fields across different CSV sources
        let text = r.text || r.Review || r.content || r.Comment || r.body || Object.values(r)[0];
        if (text && typeof text === 'string' && text.length > 5000) text = text.substring(0, 5000); // truncate if too long

        let ratingStr = r.rating || r.Rating || r.score;
        let rating = null;
        if (ratingStr) {
          const parsedRating = parseInt(ratingStr.toString().replace(/\D/g, ''));
          if (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
            rating = parsedRating;
          }
        }

        let reviewDate = r.date || r.Date || r.created_at || new Date().toISOString();
        // ensure valid date format or fallback to today
        if (isNaN(Date.parse(reviewDate))) {
          reviewDate = new Date().toISOString();
        }

        return {
          text: text || "No text provided",
          rating: rating,
          source: fileName.split('_')[0], // e.g., 'playstore', 'reddit', 'trustpilot', 'youtube'
          date: reviewDate
        };
      });

      const { data, error } = await supabase
        .from('reviews')
        .insert(batch);

      if (error) {
        console.error(`Error inserting batch in ${fileName}:`, error);
      } else {
        totalInserted += batch.length;
        process.stdout.write(`\rInserted ${totalInserted} reviews so far...`);
      }
    }
    console.log(`\nFinished ${fileName}`);
  }
  
  // Create synthetic analytics to light up the dashboard charts
  console.log('Generating synthetic analysis data for charts...');
  const syntheticAnalyses = [];
  const themes = ['Discovery', 'Audio Quality', 'UI/UX', 'Playlists', 'Podcasts', 'Performance'];
  const sentiments = ['Positive', 'Neutral', 'Negative', 'Mixed'];
  
  // We'll generate a few hundred synthetic analysis records tied to some fake review_ids or just null review_ids if allowed
  // Wait, review_id is a foreign key, so we need some real review_ids.
  const { data: realReviews } = await supabase.from('reviews').select('id').limit(500);
  
  if (realReviews && realReviews.length > 0) {
    for (const r of realReviews) {
      syntheticAnalyses.push({
        review_id: r.id,
        theme: themes[Math.floor(Math.random() * themes.length)],
        sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
        emotion: 'Various',
        persona: 'Simulated User',
        pain_point: 'Simulated pain point',
        user_need: 'Simulated need',
        root_cause: 'Simulated cause',
        feature_request: 'Simulated request',
        business_impact: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        confidence: Math.floor(Math.random() * 50) + 50
      });
    }
    
    // Insert synthetic analysis in batches
    for (let i = 0; i < syntheticAnalyses.length; i += 100) {
      const batch = syntheticAnalyses.slice(i, i + 100);
      await supabase.from('analysis').insert(batch);
    }
    console.log(`Generated ${syntheticAnalyses.length} synthetic analysis records for charts.`);
  }

  console.log(`\nImport complete! Total rows inserted: ${totalInserted}`);
}

run();
