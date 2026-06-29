const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function getCsvs(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.git') && !filePath.includes('.next') && !filePath.includes('.gemini')) {
      results = results.concat(getCsvs(filePath));
    } else if (filePath.endsWith('.csv')) {
      results.push(filePath);
    }
  }
  return results;
}

async function run() {
  console.log('Fetching existing reviews from DB to avoid duplicates...');
  const { data: existing } = await supabase.from('reviews').select('text');
  const seenTexts = new Set(existing ? existing.map(r => r.text.trim().toLowerCase()) : []);
  console.log(`DB has ${seenTexts.size} existing reviews.`);

  const allCsvs = getCsvs('c:/Users/Sneh Suman/OneDrive/Desktop/Spotify Graduation Project');
  console.log(`Found ${allCsvs.length} CSV files.`);

  let newReviews = [];

  for (const file of allCsvs) {
    const content = fs.readFileSync(file, 'utf8');
    const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
    
    // Determine source from filename
    let source = 'Unknown';
    if (file.toLowerCase().includes('playstore') || file.toLowerCase().includes('play_store')) source = 'Google Play';
    else if (file.toLowerCase().includes('app_store') || file.toLowerCase().includes('appstore')) source = 'App Store';
    else if (file.toLowerCase().includes('reddit')) source = 'Reddit';
    else if (file.toLowerCase().includes('youtube')) source = 'YouTube';
    else if (file.toLowerCase().includes('trustpilot')) source = 'Trustpilot';
    else if (file.toLowerCase().includes('community')) source = 'Community';
    else if (file.toLowerCase().includes('social')) source = 'Social Media';
    else source = path.basename(file).split('_')[0];

    for (const row of parsed.data) {
      // Find the text column (could be named differently)
      let text = row['review'] || row['Review'] || row['text'] || row['Text'] || row['content'] || row['Content'] || row['comment'] || row['Comment'] || Object.values(row)[0];
      if (!text || typeof text !== 'string' || text.length < 5) continue;
      
      const cleanText = text.trim();
      const lowerText = cleanText.toLowerCase();

      if (!seenTexts.has(lowerText)) {
        seenTexts.add(lowerText);

        // Find rating if exists
        let rating = 5; // default
        let rStr = row['rating'] || row['Rating'] || row['score'] || row['Score'] || row['stars'] || row['Stars'];
        if (rStr) {
          let parsedRating = parseInt(rStr);
          if (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) rating = parsedRating;
        }

        newReviews.push({
          text: cleanText,
          source: source,
          rating: rating,
          created_at: new Date().toISOString()
        });
      }
    }
  }

  console.log(`Extracted ${newReviews.length} NEW unique reviews across all CSVs.`);

  if (newReviews.length > 0) {
    console.log('Inserting into Supabase in batches of 500...');
    for (let i = 0; i < newReviews.length; i += 500) {
      const batch = newReviews.slice(i, i + 500);
      const { error } = await supabase.from('reviews').insert(batch);
      if (error) {
        console.error('Error inserting batch:', error.message);
      } else {
        console.log(`Successfully inserted batch ${i / 500 + 1}`);
      }
    }
    console.log('Import complete!');
  } else {
    console.log('No new unique reviews found to import.');
  }
}

run();
