"use client";
import React, { useState } from "react";
import { Search, BrainCircuit, Users, Target, Frown, Headphones, Repeat, Lightbulb } from "lucide-react";

const INSIGHTS = [
  {
    id: 1,
    question: "Why do users struggle to discover new music?",
    icon: BrainCircuit,
    answer: "Users frequently experience 'algorithmic echo chambers' where the platform only recommends slight variations of what they already know. Furthermore, the paradox of choice—having millions of songs without contextual explanation (like 'why you might like this')—leads to decision fatigue. Users want to explore, but lack the guided stepping stones to safely transition from familiar to unfamiliar genres."
  },
  {
    id: 2,
    question: "What are the most common frustrations with recommendations?",
    icon: Frown,
    answer: "The most consistent frustration is repetitive playlists (e.g., Discover Weekly feeling stale). Users also heavily complain about the inability to separate 'active discovery' from 'passive background listening'. If they listen to sleep sounds once, their core recommendations get flooded with ambient noise. High friction in tuning the algorithm (no easy 'reset' or 'dislike' button) exacerbates this."
  },
  {
    id: 3,
    question: "What listening behaviors are users trying to achieve?",
    icon: Headphones,
    answer: "Qualitative data shows three core behaviors: 1) Mood Management (seeking specific emotional states like focus, hype, or calm), 2) Nostalgia Mining (returning to familiar eras for comfort), and 3) Active Curation (hunting for hidden gems to build a unique identity). Most algorithmic features currently over-index on passive consumption rather than active curation."
  },
  {
    id: 4,
    question: "What causes users to repeatedly listen to the same content?",
    icon: Repeat,
    answer: "Low cognitive load and emotional predictability. Music acts as a psychological anchor. When users are stressed, working, or tired, exploring new music requires mental effort (evaluating if a song is 'good'). Familiar music provides guaranteed dopamine with zero risk. Users often stick to the same content because the cost of a 'bad recommendation' interrupting their flow is too high."
  },
  {
    id: 5,
    question: "Which user segments experience different discovery challenges?",
    icon: Users,
    answer: "Casual Listeners struggle with the initial hurdle of finding anything outside top-40 hits—they need high-context, guided onboarding. Audiophiles/Enthusiasts, on the other hand, complain that the algorithm is 'too safe' and fails to dig deep into niche sub-genres. Gen Z users prioritize social discovery (what friends or TikTok are listening to), whereas older segments prefer editorial or historical curation."
  },
  {
    id: 6,
    question: "What unmet needs emerge consistently across reviews?",
    icon: Target,
    answer: "Users consistently ask for three things: 1) 'Contextual Transparency' (knowing WHY a song was recommended). 2) 'Algorithmic Controls' (a slider to adjust how adventurous recommendations are, or toggles to temporarily hide specific genres). 3) 'Human-like Curation' (features that feel like a friend recommending a song with a specific story attached, rather than a cold statistical match)."
  }
];

export default function InsightsPage() {
  const [search, setSearch] = useState("");

  const filteredInsights = INSIGHTS.filter(
    (item) => 
      item.question.toLowerCase().includes(search.toLowerCase()) || 
      item.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center">
            <Lightbulb className="w-8 h-8 text-[#1DB954] mr-3" /> Qualitative Insights
          </h1>
          <p className="text-zinc-400 mt-1">Synthesized answers to core user research questions based on collected feedback.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="Search insights..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-full text-sm text-white focus:outline-none focus:border-[#1DB954] w-64 transition-colors" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInsights.map((insight) => {
          const Icon = insight.icon;
          return (
            <div key={insight.id} className="card-glass border border-white/5 rounded-xl p-6 hover:border-white/10 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-[#1DB954] opacity-0 group-hover:opacity-5 rounded-full blur-3xl transition-opacity"></div>
              
              <div className="flex items-start mb-4">
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl mr-4 group-hover:border-[#1DB954]/50 transition-colors">
                  <Icon className="w-6 h-6 text-[#1DB954]" />
                </div>
                <h3 className="text-xl font-bold text-white leading-tight pt-1 group-hover:text-[#1DB954] transition-colors">
                  {insight.question}
                </h3>
              </div>
              
              <div className="bg-black/20 rounded-xl p-5 border border-white/5">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {insight.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredInsights.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          <p>No insights found matching "{search}"</p>
        </div>
      )}
    </div>
  );
}
