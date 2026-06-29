"use client";

import { useState, useEffect } from "react";
import { Search, Filter, ChevronRight, X, User, ThumbsDown, Target, Zap, Activity, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function Analytics() {
  const supabase = createClient();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);

  useEffect(() => {
    async function fetchData() {
      // Fetch analysis joined with reviews
      const { data, error } = await supabase
        .from('analysis')
        .select(`
          *,
          reviews (
            text,
            rating,
            source
          )
        `)
        .order('created_at', { ascending: false });

      if (data) {
        setReviews(data);
      }
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  return (
    <div className="flex h-full relative">
      {/* Main Table Area */}
      <div className={`flex-1 p-8 flex flex-col transition-all duration-300 ${selectedReview ? 'mr-96' : ''}`}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">AI Review Analyzer</h1>
            <p className="text-zinc-400 mt-1">Deep semantic analysis of user feedback powered by OpenAI.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search semantic themes..." 
                className="pl-9 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#1DB954] w-64 transition-colors"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        <div className="flex-1 card-glass border border-white/5 rounded-xl overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#1DB954] animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-zinc-400 bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">Review Snapshot</th>
                    <th className="px-6 py-4 font-medium">Theme</th>
                    <th className="px-6 py-4 font-medium">Sentiment</th>
                    <th className="px-6 py-4 font-medium">Persona</th>
                    <th className="px-6 py-4 font-medium">Pain Point</th>
                    <th className="px-6 py-4 font-medium text-right">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                        No analysis data found. Upload a CSV to get started.
                      </td>
                    </tr>
                  ) : (
                    reviews.map((review) => (
                      <tr 
                        key={review.id} 
                        onClick={() => setSelectedReview(review)}
                        className="hover:bg-white/5 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4 text-zinc-300 max-w-xs truncate">{review.reviews?.text || "N/A"}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-medium text-zinc-300 border border-white/5">
                            {review.theme || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            review.sentiment === 'Positive' ? 'bg-[#1DB954]/10 text-[#1DB954] border border-[#1DB954]/20' :
                            review.sentiment === 'Negative' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}>
                            {review.sentiment || "Neutral"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-400">{review.persona || "N/A"}</td>
                        <td className="px-6 py-4 text-zinc-400 truncate max-w-[150px]">{review.pain_point || "N/A"}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 text-[#1DB954]">
                            <Zap className="w-3 h-3" />
                            {review.confidence || 0}%
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-96 glass border-l border-white/10 shadow-2xl transition-transform duration-300 transform ${
          selectedReview ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedReview && (
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-start bg-black/20">
              <div>
                <h3 className="font-semibold text-lg text-white">Review Analysis</h3>
                <p className="text-sm text-zinc-400">Source: {selectedReview.reviews?.source}</p>
              </div>
              <button 
                onClick={() => setSelectedReview(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3">Original Text</h4>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-zinc-300 text-sm italic leading-relaxed">
                  "{selectedReview.reviews?.text}"
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Metric label="Theme" value={selectedReview.theme} />
                <Metric label="Sub Theme" value={selectedReview.sub_theme} />
                <Metric label="Emotion" value={selectedReview.emotion} />
                <Metric label="Business Impact" value={selectedReview.business_impact} />
              </div>

              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold border-b border-white/10 pb-2">Deep Insights</h4>
                <InsightRow icon={User} label="User Need" value={selectedReview.user_need} />
                <InsightRow icon={Target} label="Root Cause" value={selectedReview.root_cause} />
                <InsightRow icon={Activity} label="Feature Request" value={selectedReview.feature_request} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-3 rounded-lg bg-black/20 border border-white/5">
      <div className="text-xs text-zinc-500 mb-1">{label}</div>
      <div className="text-sm font-medium text-white">{value || "N/A"}</div>
    </div>
  );
}

function InsightRow({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-2 rounded-lg bg-[#1DB954]/10 text-[#1DB954] mt-0.5">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-xs font-medium text-zinc-400 mb-1">{label}</div>
        <div className="text-sm text-zinc-200">{value || "N/A"}</div>
      </div>
    </div>
  );
}
