"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, FileText, Eye, Bookmark, TrendingUp, AlertTriangle, Loader2, X, Star, MessageSquare } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function OpportunityHub() {
  const supabase = createClient();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Evidence Drawer State
  const [activeEvidenceOpp, setActiveEvidenceOpp] = useState<any>(null);
  const [evidenceReviews, setEvidenceReviews] = useState<any[]>([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [sortBy, setSortBy] = useState("rice");
  const [filterPriority, setFilterPriority] = useState("All");

  useEffect(() => {
    async function fetchOpps() {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setOpportunities(data);
      }
      setLoading(false);
    }
    fetchOpps();
  }, [supabase]);

  const openEvidence = async (opp: any) => {
    setActiveEvidenceOpp(opp);
    setEvidenceLoading(true);
    setEvidenceReviews([]);

    // Determine search keyword based on opportunity title
    let keyword = "";
    const titleLower = opp.title.toLowerCase();
    if (titleLower.includes("shuffle")) keyword = "shuffle";
    else if (titleLower.includes("branching") || titleLower.includes("playlist")) keyword = "playlist";
    else if (titleLower.includes("vibe") || titleLower.includes("search")) keyword = "find";
    else if (titleLower.includes("fatigue") || titleLower.includes("recommend")) keyword = "same";
    else keyword = "music"; // fallback

    try {
      const { data } = await supabase
        .from('reviews')
        .select('text, rating, created_at, source')
        .ilike('text', `%${keyword}%`)
        .limit(10);
      
      if (data) setEvidenceReviews(data);
    } catch (e) {
      console.error("Error fetching evidence:", e);
    } finally {
      setEvidenceLoading(false);
    }
  };

  const handlePRDClick = (opp: any) => {
    router.push(`/prd-generator?oppTitle=${encodeURIComponent(opp.title)}`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-32">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Opportunity Hub</h1>
          <p className="text-zinc-400 mt-1">AI-identified product opportunities sorted by RICE score.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search opportunities..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#1DB954] w-64 transition-colors"
            />
          </div>
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors text-white focus:outline-none appearance-none"
          >
            <option value="rice" className="bg-[#121212]">Sort by RICE Score</option>
            <option value="reach" className="bg-[#121212]">Sort by Reach</option>
            <option value="impact" className="bg-[#121212]">Sort by Impact</option>
          </select>
          <select 
            value={filterPriority} 
            onChange={e => setFilterPriority(e.target.value)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors text-white focus:outline-none appearance-none"
          >
            <option value="All" className="bg-[#121212]">All Priorities</option>
            <option value="P0" className="bg-[#121212]">P0 Only</option>
            <option value="P1" className="bg-[#121212]">P1 Only</option>
            <option value="P2" className="bg-[#121212]">P2 Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-[#1DB954] animate-spin" />
        </div>
      ) : opportunities.length === 0 ? (
        <div className="card-glass border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-zinc-400 mb-4">No opportunities identified yet.</p>
          <button className="bg-[#1DB954] text-black px-6 py-2.5 rounded-full font-semibold transition-all hover:scale-105 active:scale-95">
            Run AI Discovery
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities
            .filter(opp => opp.title?.toLowerCase().includes(search.toLowerCase()))
            .filter(opp => filterPriority === "All" || opp.priority === filterPriority)
            .sort((a, b) => {
              if (sortBy === "rice") {
                return (b.rice_score || 0) - (a.rice_score || 0);
              }
              if (sortBy === "reach") {
                const parseReach = (val: any) => parseInt(String(val).replace(/\D/g, '')) || 0;
                return parseReach(b.reach) - parseReach(a.reach);
              }
              if (sortBy === "impact") {
                const impactMap: any = { "high": 3, "med": 2, "medium": 2, "low": 1 };
                const getImpact = (val: any) => impactMap[String(val).toLowerCase()] || 0;
                return getImpact(b.impact) - getImpact(a.impact);
              }
              return 0;
            })
            .map((opp) => (
            <div key={opp.id} className="card-glass border border-white/10 rounded-2xl overflow-hidden group hover:border-[#1DB954]/50 transition-all hover:shadow-[0_0_30px_rgba(29,185,84,0.1)] flex flex-col h-full">
              <div className="p-6 border-b border-white/5 relative flex-1">
                <div className="absolute top-4 right-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    opp.priority === 'P0' ? 'bg-red-500/20 text-red-400' :
                    opp.priority === 'P1' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {opp.priority}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 pr-10">{opp.title}</h3>
                <p className="text-sm text-zinc-400 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                  {opp.evidence}
                </p>
              </div>
              
              <div className="p-6 grid grid-cols-2 gap-4">
                <MetricBox label="Reach" value={opp.reach} />
                <MetricBox label="Impact" value={opp.impact} />
                <MetricBox label="Confidence" value={opp.confidence} isHighlight />
                <MetricBox label="Effort" value={opp.effort} />
                <div className="col-span-2 p-3 bg-black/20 rounded-lg border border-white/5 flex justify-between items-center">
                  <span className="text-xs text-zinc-500">Target KPI</span>
                  <span className="text-sm font-semibold text-white flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-[#1DB954]" />
                    {opp.kpi}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-white/5 border-t border-white/5 flex gap-2">
                <button 
                  onClick={() => handlePRDClick(opp)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1DB954] text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#1ed760] transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Generate PRD
                </button>
                <button 
                  onClick={() => openEvidence(opp)}
                  className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors border border-white/10"
                >
                  <Eye className="w-4 h-4" />
                  View Evidence
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evidence Side Drawer */}
      {activeEvidenceOpp && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in" onClick={() => setActiveEvidenceOpp(null)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#121212] border-l border-white/10 shadow-2xl z-50 p-6 overflow-y-auto custom-scrollbar animate-in slide-in-from-right-full duration-300">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#121212] py-2 z-10 border-b border-white/10">
              <h2 className="text-xl font-bold text-white truncate pr-4">Supporting Evidence</h2>
              <button onClick={() => setActiveEvidenceOpp(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#1DB954] mb-2">{activeEvidenceOpp.title}</h3>
              <p className="text-sm text-zinc-400 bg-white/5 p-4 rounded-xl border border-white/5">{activeEvidenceOpp.evidence}</p>
            </div>

            <h3 className="text-sm font-bold text-white mb-4 tracking-wider flex items-center gap-2 uppercase">
              <MessageSquare className="w-4 h-4 text-[#1DB954]" /> 
              Raw Customer Reviews
            </h3>

            {evidenceLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#1DB954] animate-spin" />
              </div>
            ) : evidenceReviews.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 border border-dashed border-white/10 rounded-xl">
                No matching raw reviews found in database.
              </div>
            ) : (
              <div className="space-y-4">
                {evidenceReviews.map((rev, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10 text-sm text-zinc-200 shadow-md">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-[#1DB954]/20 text-[#1DB954] px-2 py-0.5 rounded font-medium">{rev.source}</span>
                        <span className="text-xs text-zinc-500">{new Date(rev.created_at).toLocaleDateString()}</span>
                      </div>
                      {rev.rating && (
                        <span className="text-yellow-500 text-xs flex">
                          {Array(rev.rating).fill(0).map((_,i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                        </span>
                      )}
                    </div>
                    <p className="leading-relaxed italic">"{rev.text}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MetricBox({ label, value, isHighlight = false }: { label: string, value: string, isHighlight?: boolean }) {
  return (
    <div>
      <div className="text-xs text-zinc-500 mb-1">{label}</div>
      <div className={`text-sm font-bold ${isHighlight ? 'text-[#1DB954]' : 'text-white'}`}>
        {value || "N/A"}
      </div>
    </div>
  );
}
