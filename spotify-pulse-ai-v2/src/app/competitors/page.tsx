"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { Globe, TrendingUp, TrendingDown, Target, Zap, ChevronRight, Activity } from "lucide-react";

const radarData = [
  { subject: 'Discovery', Spotify: 92, AppleMusic: 75, YouTubeMusic: 85, fullMark: 100 },
  { subject: 'Audio Quality', Spotify: 80, AppleMusic: 95, YouTubeMusic: 70, fullMark: 100 },
  { subject: 'UI/UX', Spotify: 88, AppleMusic: 82, YouTubeMusic: 78, fullMark: 100 },
  { subject: 'Podcasts', Spotify: 85, AppleMusic: 30, YouTubeMusic: 60, fullMark: 100 },
  { subject: 'Lyrics', Spotify: 70, AppleMusic: 90, YouTubeMusic: 65, fullMark: 100 },
  { subject: 'Social', Spotify: 85, AppleMusic: 60, YouTubeMusic: 50, fullMark: 100 },
];

const sentimentData = [
  { name: 'Spotify', positive: 65, neutral: 20, negative: 15 },
  { name: 'Apple Music', positive: 55, neutral: 25, negative: 20 },
  { name: 'YouTube Music', positive: 60, neutral: 15, negative: 25 },
];

export default function Competitors() {
  const [activeCompetitor, setActiveCompetitor] = useState<string>("All");

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Globe className="w-8 h-8 text-[#1DB954]" />
            Competitive Intelligence Hub
          </h1>
          <p className="text-zinc-400 mt-1">Cross-platform sentiment analysis and feature benchmarking.</p>
        </div>
        <div className="flex bg-black/40 border border-white/10 rounded-lg p-1">
          {["All", "Apple Music", "YouTube Music"].map(comp => (
            <button
              key={comp}
              onClick={() => setActiveCompetitor(comp)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeCompetitor === comp 
                  ? "bg-[#1DB954] text-black" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {comp}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Chart */}
        <div className="card-glass border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/5 to-transparent z-0 opacity-50"></div>
          <div className="relative z-10">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#1DB954]" /> Core Feature Strength
            </h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'transparent' }} axisLine={false} />
                  <Radar name="Spotify" dataKey="Spotify" stroke="#1DB954" fill="#1DB954" fillOpacity={0.3} />
                  {activeCompetitor !== "YouTube Music" && (
                    <Radar name="Apple Music" dataKey="AppleMusic" stroke="#fa243c" fill="#fa243c" fillOpacity={0.3} />
                  )}
                  {activeCompetitor !== "Apple Music" && (
                    <Radar name="YouTube Music" dataKey="YouTubeMusic" stroke="#ff0000" fill="#ff0000" fillOpacity={0.3} />
                  )}
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#181818', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sentiment Comparison */}
        <div className="card-glass border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent z-0 opacity-50"></div>
          <div className="relative z-10">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" /> Sentiment Distribution
            </h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#181818', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Legend />
                  <Bar dataKey="positive" name="Positive %" stackId="a" fill="#1DB954" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="neutral" name="Neutral %" stackId="a" fill="#535353" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="negative" name="Negative %" stackId="a" fill="#e91429" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Insights */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6">Key Competitive Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1DB954]/10 border border-[#1DB954]/20 p-5 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-[#1DB954]/20 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-[#1DB954]" />
            </div>
            <h3 className="font-bold text-white mb-2">Spotify Advantage: Discovery</h3>
            <p className="text-sm text-zinc-400">Spotify completely dominates Apple Music (+17%) and YouTube Music (+7%) in music discovery and algorithmic recommendations.</p>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="font-bold text-white mb-2">Apple Music Threat: Audio Quality</h3>
            <p className="text-sm text-zinc-400">Apple Music holds a massive 15% lead in audio quality sentiment due to their standard Lossless and Spatial Audio offerings.</p>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-bold text-white mb-2">YouTube Music Opportunity: UI/UX</h3>
            <p className="text-sm text-zinc-400">YouTube Music users report 10% more frustration with UI clutter compared to Spotify, presenting an opportunity to acquire users through design supremacy.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
