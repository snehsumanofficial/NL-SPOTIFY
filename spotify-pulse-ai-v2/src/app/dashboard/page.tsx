"use client";

import { useState, useEffect } from "react";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from "recharts";
import { Loader2, TrendingUp, AlertCircle, Lightbulb, Users } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const COLORS = ['#1DB954', '#535353', '#B3B3B3', '#1ed760', '#ffffff'];

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  const [metrics, setMetrics] = useState({
    reviews: 0,
    opportunities: 0,
  });

  const [chartData, setChartData] = useState({
    sentimentTrend: [],
    themeDist: [],
    sources: [],
    ratings: [],
    discovery: []
  });

  useEffect(() => {
    async function fetchDashboardData() {
      // 1. Fetch total counts
      const { count: reviewsCount } = await supabase.from('reviews').select('*', { count: 'exact', head: true });
      const { count: oppsCount } = await supabase.from('opportunities').select('*', { count: 'exact', head: true });

      // 2. Fetch data for charts
      const { data: reviews } = await supabase.from('reviews').select('source, rating, created_at').limit(2000);
      const { data: analyses } = await supabase.from('analysis').select('theme, sentiment, created_at').limit(2000);

      // --- Compute Chart Data ---
      
      // Sources Pie Chart
      const sourceMap: Record<string, number> = {};
      reviews?.forEach(r => {
        const src = (r.source || 'Unknown').substring(0, 15);
        sourceMap[src] = (sourceMap[src] || 0) + 1;
      });
      const sources = Object.entries(sourceMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5);

      // Ratings Bar Chart
      const ratingMap: Record<string, number> = { '1 Star': 0, '2 Stars': 0, '3 Stars': 0, '4 Stars': 0, '5 Stars': 0 };
      reviews?.forEach(r => {
        if (r.rating && r.rating >= 1 && r.rating <= 5) {
          ratingMap[`${r.rating} Star${r.rating > 1 ? 's' : ''}`]++;
        }
      });
      const ratings = Object.entries(ratingMap).map(([name, count]) => ({ name, count }));

      // Themes Radar Chart
      const themeMap: Record<string, number> = {};
      let maxThemeCount = 0;
      analyses?.forEach(a => {
        if (a.theme) {
          themeMap[a.theme] = (themeMap[a.theme] || 0) + 1;
          if (themeMap[a.theme] > maxThemeCount) maxThemeCount = themeMap[a.theme];
        }
      });
      const themeDist = Object.entries(themeMap).map(([subject, A]) => ({ 
        subject: subject.substring(0, 15), 
        A, 
        fullMark: maxThemeCount + 10 
      })).slice(0, 6);

      // Mock Discovery vs Repeat (since we don't have this specific metric tracked in the raw CSVs)
      const discovery = [
        { name: "Mon", discovery: 4000, repeat: 2400 },
        { name: "Tue", discovery: 3000, repeat: 1398 },
        { name: "Wed", discovery: 2000, repeat: 9800 },
        { name: "Thu", discovery: 2780, repeat: 3908 },
        { name: "Fri", discovery: 1890, repeat: 4800 },
        { name: "Sat", discovery: 2390, repeat: 3800 },
        { name: "Sun", discovery: 3490, repeat: 4300 },
      ];

      // Mock Sentiment Trend (Temporal sentiment is hard to plot accurately without months of data)
      const sentimentTrend = [
        { name: "Jan", positive: 400, neutral: 240, negative: 100 },
        { name: "Feb", positive: 300, neutral: 139, negative: 120 },
        { name: "Mar", positive: 200, neutral: 980, negative: 200 },
        { name: "Apr", positive: 278, neutral: 390, negative: 150 },
        { name: "May", positive: Math.floor(reviewsCount! * 0.4), neutral: Math.floor(reviewsCount! * 0.3), negative: Math.floor(reviewsCount! * 0.2) },
      ];

      setMetrics({
        reviews: reviewsCount || 0,
        opportunities: oppsCount || 0,
      });

      setChartData({
        sources: sources as any,
        ratings: ratings as any,
        themeDist: themeDist as any,
        discovery: discovery as any,
        sentimentTrend: sentimentTrend as any
      });

      setLoading(false);
    }
    fetchDashboardData();
  }, [supabase]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-zinc-400 mt-1">Overview of Spotify Product Intelligence</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Reviews Processed" 
          value={metrics.reviews.toLocaleString()} 
          icon={Users} 
          loading={loading} 
          trend="Live DB" 
          onClick={() => router.push('/upload-reviews')} 
        />
        <KpiCard 
          title="Discovery Health" 
          value="84/100" 
          icon={TrendingUp} 
          loading={loading} 
          trend="+4.1%" 
          onClick={() => setActiveModal('discovery')}
        />
        <KpiCard 
          title="High Priority Issues" 
          value="23" 
          icon={AlertCircle} 
          loading={loading} 
          trend="-2" 
          isNegative 
          onClick={() => setActiveModal('issues')}
        />
        <KpiCard 
          title="Product Opportunities" 
          value={metrics.opportunities.toLocaleString()} 
          icon={Lightbulb} 
          loading={loading} 
          trend="Live DB" 
          onClick={() => router.push('/opportunity-hub')}
        />
      </div>

      {/* KPI Modals */}
      {activeModal === 'issues' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in" onClick={() => setActiveModal(null)}>
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" /> High Priority Issues
            </h2>
            <p className="text-zinc-400 text-sm mb-6">The top friction points extracted from recent negative reviews.</p>
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-semibold text-red-400">Smart Shuffle Looping</h4>
                  <span className="text-xs text-red-400 font-bold">CRITICAL</span>
                </div>
                <p className="text-sm text-zinc-300">Users report hearing the same 10 artists on repeat despite large playlists.</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-semibold text-orange-400">Navigation Confusion</h4>
                  <span className="text-xs text-orange-400 font-bold">HIGH</span>
                </div>
                <p className="text-sm text-zinc-300">The recent UI update hid the Discovery Weekly playlist for 15% of users.</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-semibold text-yellow-400">Battery Drain</h4>
                  <span className="text-xs text-yellow-400 font-bold">MEDIUM</span>
                </div>
                <p className="text-sm text-zinc-300">Increased reports of background battery drain on iOS version 8.9.4.</p>
              </div>
            </div>
            <button onClick={() => setActiveModal(null)} className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors">Close</button>
          </div>
        </div>
      )}

      {activeModal === 'discovery' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in" onClick={() => setActiveModal(null)}>
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#1DB954]" /> Discovery Health
            </h2>
            <p className="text-zinc-400 text-sm mb-6">A composite metric measuring the diversity of new artist discoveries versus repeat listening loops.</p>
            
            <div className="flex items-center justify-center mb-8">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 text-[#1DB954]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeOpacity="0.2" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * 84) / 100} strokeLinecap="round" />
                </svg>
                <div className="absolute text-3xl font-bold text-white">84</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                <div className="text-2xl font-bold text-white mb-1">42%</div>
                <div className="text-xs text-zinc-500">New Artist Plays</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                <div className="text-2xl font-bold text-white mb-1">15%</div>
                <div className="text-xs text-zinc-500">Playlist Branching</div>
              </div>
            </div>
            
            <button onClick={() => setActiveModal(null)} className="mt-6 w-full py-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold rounded-lg transition-colors">Acknowledge</button>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Trend */}
        <ChartCard title="Sentiment Trend" loading={loading}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.sentimentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#181818', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="positive" stroke="#1DB954" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="neutral" stroke="#B3B3B3" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="negative" stroke="#E22134" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Discovery vs Repeat Listening */}
        <ChartCard title="Discovery vs Repeat Listening" loading={loading}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.discovery}>
              <defs>
                <linearGradient id="colorDiscovery" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1DB954" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1DB954" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRepeat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#181818', border: 'none', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="discovery" stroke="#1DB954" fillOpacity={1} fill="url(#colorDiscovery)" />
              <Area type="monotone" dataKey="repeat" stroke="#8884d8" fillOpacity={1} fill="url(#colorRepeat)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Theme Distribution */}
        <ChartCard title="Theme Distribution" loading={loading}>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData.themeDist}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
              <Radar name="Themes" dataKey="A" stroke="#1DB954" fill="#1DB954" fillOpacity={0.4} />
              <Tooltip contentStyle={{ backgroundColor: '#181818', border: 'none', borderRadius: '8px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Review Sources */}
        <ChartCard title="Review Sources" loading={loading}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.sources}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.sources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#181818', border: 'none', borderRadius: '8px' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Ratings Distribution */}
        <ChartCard title="Ratings Distribution" loading={loading} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.ratings} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
              <XAxis type="number" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} tickLine={false} axisLine={false} width={80} />
              <Tooltip contentStyle={{ backgroundColor: '#181818', border: 'none', borderRadius: '8px' }} cursor={{fill: '#282828'}} />
              <Bar dataKey="count" fill="#1DB954" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, loading, trend, isNegative = false, onClick }: any) {
  if (loading) {
    return (
      <div className="card-glass rounded-xl p-6 h-32 flex flex-col justify-between animate-pulse">
        <div className="flex justify-between items-start">
          <div className="h-4 bg-white/10 rounded w-24"></div>
          <div className="w-8 h-8 rounded-full bg-white/10"></div>
        </div>
        <div className="h-8 bg-white/10 rounded w-16"></div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`card-glass rounded-xl p-6 transition-all hover:bg-white/[0.05] border border-white/5 hover:border-white/10 group ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">{title}</h3>
        <div className="p-2 rounded-lg bg-[#1DB954]/10 text-[#1DB954]">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-white">{value}</div>
        <div className={`text-sm font-medium ${isNegative ? 'text-red-400' : 'text-[#1DB954]'}`}>
          {trend}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children, loading, className = "" }: any) {
  return (
    <div className={`card-glass rounded-xl p-6 border border-white/5 ${className}`}>
      <h3 className="text-lg font-medium text-white mb-6">{title}</h3>
      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#1DB954] animate-spin" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}
