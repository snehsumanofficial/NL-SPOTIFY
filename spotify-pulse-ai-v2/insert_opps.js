const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const opportunities = [
    {
      title: "Discovery-First Smart Shuffle Mode",
      priority: "P0",
      evidence: "68% of users report 'Smart Shuffle' loops the same 20 artists, directly opposing the strategic goal of new music discovery.",
      reach: "85%",
      impact: "High",
      confidence: "91%",
      effort: "Med",
      kpi: "+15% New Artist Discovery Rate",
      created_at: new Date().toISOString()
    },
    {
      title: "Contextual 'Branching' from Repeat Playlists",
      priority: "P1",
      evidence: "Users default to familiar playlists due to discovery friction. A 1-click 'Play similar unseen tracks' button removes this barrier.",
      reach: "60%",
      impact: "High",
      confidence: "84%",
      effort: "Low",
      kpi: "+22% Playlist Diversification",
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
    },
    {
      title: "Conversational 'Vibe' Search Agent",
      priority: "P1",
      evidence: "Reviews indicate users struggle to map their exact mood to existing generic genres. AI natural language search bridges this gap.",
      reach: "45%",
      impact: "Med",
      confidence: "75%",
      effort: "High",
      kpi: "+30% Search-to-Listen Conversion",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    {
      title: "Anti-Fatigue Recommendation Filter",
      priority: "P2",
      evidence: "Users explicitly complain about 'recommendation fatigue' when the algorithm over-indexes on their historical listening data.",
      reach: "90%",
      impact: "Med",
      confidence: "88%",
      effort: "Low",
      kpi: "-10% Skip Rate on Daily Mixes",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
    }
  ];

  console.log('Inserting opportunities...');
  const { data, error } = await supabase.from('opportunities').insert(opportunities);
  
  if (error) {
    console.error('Error inserting:', error);
  } else {
    console.log('Successfully inserted opportunities!');
  }
}

run();
