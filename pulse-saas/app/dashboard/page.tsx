"use client";
import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { ArrowUpRight, ArrowDownRight, Activity, Users, AlertTriangle, Lightbulb, X, FileText, Target, ChevronRight } from "lucide-react";

const COLORS = ['#1DB954', '#F39C12', '#E74C3C', '#3498DB', '#9B59B6', '#1ABC9C'];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [activeKpi, setActiveKpi] = useState<string | null>(null);
  const [appData, setAppData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(data => {
        setAppData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load dashboard data:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !appData) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-spotify-green border-t-transparent rounded-full animate-spin"></div>
        <p className="text-spotify-text animate-pulse font-medium">Crunching raw user signals from live data...</p>
      </div>
    );
  }

  const totalThemes = appData.theme_data.reduce((acc: number, curr: any) => acc + curr.value, 0);

  const kpis = [
    { title: "Reviews Processed", val: appData.total_reviews.toLocaleString(), inc: "+12.5%", icon: Activity, up: true, desc: "Total user feedback signals successfully parsed and embedded." },
    { title: "Negative Sentiment", val: appData.sentiment_distribution.Negative.toLocaleString(), inc: "-4.2%", icon: Users, up: false, desc: "Reviews classified with negative emotion or frustration." },
    { title: "High Priority Issues", val: "14", inc: "+2", icon: AlertTriangle, up: false, desc: "Critical bugs or UX flaws mentioned by multiple users." },
    { title: "Product Opportunities", val: "8", inc: "New", icon: Lightbulb, up: true, desc: "Actionable feature requests derived from user needs." }
  ];

  // Mock detail data for the drawer
  const getKpiDetails = (title: string) => {
    switch(title) {
      case "Reviews Processed":
        return [
          { title: "Spotify Community Forum Export", detail: "845 reviews", date: "Today" },
          { title: "Google Play Store Scrape", detail: "1,202 reviews", date: "Yesterday" },
          { title: "Reddit /r/spotify", detail: "174 reviews", date: "3 days ago" }
        ];
      case "Negative Sentiment":
        return [
          { title: "Algorithm Repetition", detail: "142 negative mentions", date: "High Volume" },
          { title: "App Crashing on Android", detail: "89 negative mentions", date: "Spiking" },
          { title: "Podcast UI Clutter", detail: "67 negative mentions", date: "Consistent" }
        ];
      case "High Priority Issues":
        return [
          { title: "Android App Crash on Startup", detail: "Critical - Mentioned 45 times in last 24h", date: "P0" },
          { title: "Discover Weekly not updating", detail: "High - Mentioned 32 times", date: "P1" },
          { title: "Downloaded songs deleting themselves", detail: "High - Mentioned 28 times", date: "P1" }
        ];
      case "Product Opportunities":
        return [
          { title: "Explicit 'Exclude Genre' Button", detail: "Requested by 150+ users", date: "High Impact" },
          { title: "Separate Podcast App/Tab", detail: "Requested by 400+ users", date: "Medium Effort" },
          { title: "Collaborative Playlist Folders", detail: "Requested by 80+ users", date: "Low Effort" }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700 relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Overview Dashboard</h1>
          <p className="text-spotify-text text-sm">Real-time product intelligence from {appData.total_reviews.toLocaleString()} processed reviews.</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div 
            key={i} 
            onClick={() => setActiveKpi(kpi.title)}
            className="bg-spotify-card border border-[#2A2A2A] rounded-xl p-5 shadow-lg relative overflow-hidden group cursor-pointer hover:border-spotify-green transition-all transform hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-spotify-green opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity"></div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-spotify-text text-xs uppercase tracking-wider font-semibold">{kpi.title}</span>
              <kpi.icon className="w-4 h-4 text-spotify-text group-hover:text-spotify-green transition-colors" />
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white group-hover:text-spotify-green transition-colors">{kpi.val}</span>
              <div className={`flex items-center text-xs font-medium ${kpi.up ? 'text-spotify-green' : 'text-red-500'}`}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {kpi.inc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sentiment Trend */}
        <div className="md:col-span-2 bg-spotify-card border border-[#2A2A2A] rounded-xl p-5 shadow-lg">
          <h3 className="text-white font-semibold mb-6">Sentiment Trend (Simulated Time Series)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={appData.sentiment_trend}>
                <XAxis dataKey="name" stroke="#555" tick={{fill: '#B3B3B3', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#555" tick={{fill: '#B3B3B3', fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{backgroundColor: '#181818', borderColor: '#2A2A2A', borderRadius: '8px'}} />
                <Line type="monotone" dataKey="pos" stroke="#1DB954" strokeWidth={3} dot={false} name="Positive" />
                <Line type="monotone" dataKey="neg" stroke="#E22134" strokeWidth={3} dot={false} name="Negative" />
                <Line type="monotone" dataKey="neu" stroke="#F1C40F" strokeWidth={3} dot={false} name="Neutral" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Theme Distribution */}
        <div className="bg-spotify-card border border-[#2A2A2A] rounded-xl p-5 shadow-lg">
          <h3 className="text-white font-semibold mb-6">Top Themes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={appData.theme_data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {appData.theme_data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#181818', borderColor: '#2A2A2A', borderRadius: '8px', color: 'white'}} itemStyle={{color: 'white'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {appData.theme_data.slice(0,4).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center truncate mr-2">
                  <div className="w-2 h-2 rounded-full mr-2 shrink-0" style={{backgroundColor: COLORS[i]}}></div>
                  <span className="text-spotify-text truncate max-w-[120px]">{item.name}</span>
                </div>
                <span className="text-white font-medium shrink-0">{((item.value / totalThemes) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Side Drawer */}
      {activeKpi && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setActiveKpi(null)} />
          <div className="fixed top-0 right-0 h-full w-[450px] bg-spotify-card border-l border-[#2A2A2A] z-50 p-6 overflow-y-auto animate-in slide-in-from-right duration-300 shadow-2xl">
            <div className="flex justify-between items-start mb-6 border-b border-[#333] pb-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{activeKpi}</h3>
                <p className="text-spotify-text text-sm">
                  {kpis.find(k => k.title === activeKpi)?.desc}
                </p>
              </div>
              <button onClick={() => setActiveKpi(null)} className="text-spotify-text hover:text-white bg-[#282828] p-2 rounded-full hover:bg-[#333] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-spotify-text uppercase tracking-wider mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2" /> Breakdown Details
              </h4>
              
              {getKpiDetails(activeKpi).map((item, idx) => (
                <div key={idx} className="bg-[#1F1F1F] p-4 rounded-xl border border-[#333] hover:border-[#555] transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                    <h5 className="text-white font-medium group-hover:text-spotify-green transition-colors">{item.title}</h5>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#282828] text-spotify-text">
                      {item.date}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#888]">{item.detail}</p>
                    <ChevronRight className="w-4 h-4 text-[#444] group-hover:text-spotify-green transition-colors" />
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-8 bg-[#282828] hover:bg-[#333] text-white font-medium py-3 rounded-full flex items-center justify-center border border-[#444] transition-colors">
              <Target className="w-4 h-4 mr-2" /> Open Full Report
            </button>
          </div>
        </>
      )}
    </div>
  );
}
