"use client";

import { useState, useEffect } from "react";
import { UploadCloud, FileType, CheckCircle2, X, AlertCircle, FileText, ChevronRight, Play, Loader2, Search, Filter, MoreVertical, LayoutGrid, List, CheckSquare, Download, Trash2, Tag, Database, Activity, Star, Clock, Globe, Zap, Merge, GitCompare, User, FileOutput, Lightbulb, Users, Link as LinkIcon, ExternalLink, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function UploadReviews() {
  const router = useRouter();
  const supabase = createClient();
  
  // Existing Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "validating" | "success" | "error" | "analyzing">("idle");

  // New Dataset Library State
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewDataset, setPreviewDataset] = useState<any | null>(null);
  const [sortBy, setSortBy] = useState("date");
  const [filterSource, setFilterSource] = useState("All");
  const [analyzingSim, setAnalyzingSim] = useState<{ active: boolean, step: number, progress: number, timeLeft: string }>({ active: false, step: 0, progress: 0, timeLeft: "00:45" });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showSurveyResponses, setShowSurveyResponses] = useState(false);

  const mockSurveyResponses = [
    { id: 1, date: "2026-06-25", method: "Discover Weekly", frustration: "Algorithm feels repetitive", desire: "Better mood-based filters" },
    { id: 2, date: "2026-06-26", method: "TikTok / Social Media", frustration: "Hard to find niche genres", desire: "Social listening with friends" },
    { id: 3, date: "2026-06-27", method: "Friends' Recommendations", frustration: "Playlists get stale quickly", desire: "AI DJ with more control" },
    { id: 4, date: "2026-06-28", method: "Release Radar", frustration: "Too many remixes, not enough originals", desire: "Filter out remixes/covers" },
    { id: 5, date: "2026-06-28", method: "Search / Browse", frustration: "Search is too rigid", desire: "Semantic search (e.g., 'upbeat jazz')" },
    { id: 6, date: "2026-06-28", method: "Radio / Auto-play", frustration: "Plays the same artists over again", desire: "Slider to adjust discovery vs familiar" },
    { id: 7, date: "2026-06-28", method: "Discover Weekly", frustration: "Recommendations don't match my current vibe", desire: "Exclude certain genres temporarily" },
    { id: 8, date: "2026-06-28", method: "Spotify Curated Playlists", frustration: "Playlists are too mainstream", desire: "More indie and underground highlights" },
    { id: 9, date: "2026-06-29", method: "TikTok / Social Media", frustration: "Songs from TikTok are hard to find the full version of", desire: "Direct TikTok integration" },
    { id: 10, date: "2026-06-29", method: "Friends' Recommendations", frustration: "Collaborative playlists get messy", desire: "Threaded comments on collaborative tracks" },
    { id: 11, date: "2026-06-29", method: "Daily Mix", frustration: "Mixes rarely change day-to-day", desire: "More aggressive daily refresh" },
    { id: 12, date: "2026-06-29", method: "Search / Browse", frustration: "Podcasts cluttering music search", desire: "Separate tabs for Music vs Podcasts" },
    { id: 13, date: "2026-06-29", method: "Release Radar", frustration: "Missing small artists I follow", desire: "Notification bell for specific artists" },
    { id: 14, date: "2026-06-29", method: "Discover Weekly", frustration: "One weird song ruins the whole week's algorithm", desire: "An 'Ignore this for recommendations' button" },
    { id: 15, date: "2026-06-29", method: "Friends' Recommendations", frustration: "Can't see what friends are listening to on mobile", desire: "Mobile Friend Activity feed" },
    { id: 16, date: "2026-06-29", method: "TikTok / Social Media", frustration: "Finding covers instead of originals", desire: "Filter out covers" },
    { id: 17, date: "2026-06-29", method: "Discover Weekly", frustration: "Lots of instrumental tracks lately", desire: "Exclude instrumentals toggle" },
    { id: 18, date: "2026-06-29", method: "Radio / Auto-play", frustration: "Autoplay drifts into weird genres", desire: "Lock autoplay to specific genre" },
    { id: 19, date: "2026-06-29", method: "Search / Browse", frustration: "Typo search is really bad sometimes", desire: "Better fuzzy search" },
    { id: 20, date: "2026-06-29", method: "Friends' Recommendations", frustration: "No built-in chat to share songs", desire: "In-app direct messaging for songs" },
    { id: 21, date: "2026-06-29", method: "Spotify Curated Playlists", frustration: "Too much focus on Top 50", desire: "Better local charts" },
    { id: 22, date: "2026-06-29", method: "Release Radar", frustration: "Releases from artists I haven't heard in years", desire: "Only show active favorites" },
    { id: 23, date: "2026-06-29", method: "TikTok / Social Media", frustration: "Takes too many clicks to save a song from socials", desire: "Shazam-like quick add" },
    { id: 24, date: "2026-06-29", method: "Daily Mix", frustration: "Mix 1 and Mix 2 are basically the same", desire: "Ensure daily mixes are diverse" },
    { id: 25, date: "2026-06-29", method: "Discover Weekly", frustration: "Keeps suggesting artists I've blocked", desire: "Respect block list globally" },
    { id: 26, date: "2026-06-29", method: "Search / Browse", frustration: "UI is too cluttered to just find a song", desire: "Minimalist search mode" },
    { id: 27, date: "2026-06-29", method: "Friends' Recommendations", frustration: "Blend playlists update too rarely", desire: "Daily Blend updates" },
    { id: 28, date: "2026-06-29", method: "Radio / Auto-play", frustration: "Live versions of songs playing unexpectedly", desire: "Toggle off live versions" },
    { id: 29, date: "2026-06-29", method: "Release Radar", frustration: "EPs taking over the entire playlist", desire: "Limit 1 song per artist" },
    { id: 30, date: "2026-06-29", method: "Spotify Curated Playlists", frustration: "Cover art isn't representative", desire: "Community voted cover art" },
    { id: 31, date: "2026-06-29", method: "Discover Weekly", frustration: "Too much lo-fi beats", desire: "BPM limiters" },
    { id: 32, date: "2026-06-29", method: "TikTok / Social Media", frustration: "Speed-up versions flooding results", desire: "Hide unofficial speed-up versions" },
    { id: 33, date: "2026-06-29", method: "Search / Browse", frustration: "Can't search by lyrics easily", desire: "Lyrics-first search engine" },
    { id: 34, date: "2026-06-29", method: "Friends' Recommendations", frustration: "Want to see who else listens to this", desire: "Mutual listener indicators" },
    { id: 35, date: "2026-06-29", method: "Daily Mix", frustration: "Too short, ends abruptly", desire: "Infinite daily mix generation" },
    { id: 36, date: "2026-06-29", method: "Release Radar", frustration: "Notifications are easily missed", desire: "Lock screen widgets for new drops" },
    { id: 37, date: "2026-06-29", method: "Discover Weekly", frustration: "Not enough international music", desire: "Global discovery toggle" },
    { id: 38, date: "2026-06-29", method: "Spotify Curated Playlists", frustration: "Track order never changes", desire: "Auto-shuffle by default on certain lists" },
    { id: 39, date: "2026-06-29", method: "Radio / Auto-play", frustration: "Censored versions playing", desire: "Force explicit versions only" },
    { id: 40, date: "2026-06-29", method: "TikTok / Social Media", frustration: "Songs are too short now", desire: "Filter by minimum song length" },
    { id: 41, date: "2026-06-29", method: "Search / Browse", frustration: "Audiobooks mixing with music", desire: "Strict separation of audiobooks" },
    { id: 42, date: "2026-06-29", method: "Friends' Recommendations", frustration: "Can't rate friends' recommendations", desire: "Upvote/Downvote friend picks" },
    { id: 43, date: "2026-06-29", method: "Discover Weekly", frustration: "Needs more energy for gym", desire: "Workout-mode for Discover Weekly" },
  ];

  const analysisSteps = [
    "Reading Reviews",
    "Cleaning Dataset",
    "Extracting Themes",
    "Finding Personas",
    "Discovering Pain Points",
    "Running Root Cause Analysis",
    "Generating Opportunities",
    "Prioritizing Features",
    "Generating Executive Insights",
    "Preparing Dashboard"
  ];

  useEffect(() => {
    fetchDatasets();
  }, [supabase]);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const { data: reviews } = await supabase.from('reviews').select('id, source, rating, created_at, text');
      
      if (reviews) {
        const grouped = reviews.reduce((acc: any, r: any) => {
          const src = r.source || 'Unknown';
          if (!acc[src]) {
            acc[src] = {
              id: src,
              name: `${src} Feedback Export`,
              source: src,
              count: 0,
              uploadDate: r.created_at,
              lastModified: new Date().toISOString(),
              status: "Ready",
              tags: ["v1.0", src.toLowerCase().replace(" ", "-")],
              ratings: [],
              reviews: [],
              language: "English (US)",
              regions: ["US", "IN", "UK"],
              fileType: "CSV",
              fileSize: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
              lastAnalysis: new Date().toISOString(),
              version: "1.0",
              owner: "PM Team"
            };
          }
          acc[src].count += 1;
          if (r.rating) acc[src].ratings.push(r.rating);
          if (acc[src].reviews.length < 20) acc[src].reviews.push(r);
          return acc;
        }, {});

        setDatasets(Object.values(grouped));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Upload Handlers
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
  };
  const handleFileSelect = (selectedFile: File) => { setFile(selectedFile); setStatus("success"); };
  const handleDelete = () => { setFile(null); setStatus("idle"); };
  
  const handleAnalyze = async () => {
    if (!file) return;
    setStatus("analyzing");
    setTimeout(() => {
      setStatus("success");
      router.push('/analytics');
    }, 2000);
  };

  // Library Handlers
  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredDatasets.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredDatasets.map(d => d.id)));
  };

  const handleMergeSelected = () => {
    if (selectedIds.size < 2) {
      alert("Please select at least 2 datasets to merge.");
      return;
    }
    const selected = datasets.filter(d => selectedIds.has(d.id));
    const totalCount = selected.reduce((acc, d) => acc + d.count, 0);
    const newDataset = {
      id: `merged-${Date.now()}`,
      name: `Merged Dataset (${selected.length} sources)`,
      source: "Combined",
      count: totalCount,
      uploadDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      status: "Ready",
      tags: ["merged", "v1.0"],
      ratings: selected.flatMap(d => d.ratings),
      reviews: selected.flatMap(d => d.reviews).slice(0, 20),
      language: "Mixed",
      regions: ["Global"],
      fileType: "CSV",
      fileSize: `${(Math.random() * 10 + 5).toFixed(1)} MB`,
      lastAnalysis: new Date().toISOString(),
      version: "1.0",
      owner: "PM Team"
    };
    
    setDatasets([newDataset, ...datasets]);
    setSelectedIds(new Set());
    alert("Datasets successfully merged!");
  };

  const handleDeleteSelected = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.size} datasets?`)) {
      setDatasets(datasets.filter(d => !selectedIds.has(d.id)));
      setSelectedIds(new Set());
    }
  };

  const startAnalysis = () => {
    setAnalyzingSim({ active: true, step: 0, progress: 0, timeLeft: "00:45" });
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += 2;
      const stepIndex = Math.min(Math.floor((progress / 100) * analysisSteps.length), analysisSteps.length - 1);
      const secondsLeft = Math.max(0, Math.floor(45 - (progress * 0.45)));
      const timeString = `00:${secondsLeft.toString().padStart(2, '0')}`;
      
      setAnalyzingSim({ active: true, step: stepIndex, progress, timeLeft: timeString });
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => router.push('/dashboard'), 500);
      }
    }, 100);
  };

  const filteredDatasets = datasets
    .filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.source.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(d => filterSource === "All" || d.source.toLowerCase().includes(filterSource.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      if (sortBy === "count") return b.count - a.count;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 pb-40">
      {/* 1. Upload Dataset Section (Existing - DO NOT REMOVE) */}
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Upload Reviews</h1>
          <p className="text-zinc-400 mt-1">Ingest customer feedback for AI analysis.</p>
        </div>

        {status === "idle" && (
          <div 
            className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
              isDragging ? "border-[#1DB954] bg-[#1DB954]/5 scale-[1.02]" : "border-white/10 card-glass hover:border-white/20 hover:bg-white/[0.02]"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className={`p-4 rounded-full ${isDragging ? "bg-[#1DB954]/20" : "bg-white/5"} transition-colors`}>
              <UploadCloud className={`w-12 h-12 ${isDragging ? "text-[#1DB954]" : "text-zinc-400"}`} />
            </div>
            <div>
              <h3 className="text-xl font-medium text-white mb-2">Drag & Drop your CSV file here</h3>
              <p className="text-zinc-400 text-sm mb-6">Supports CSV files up to 50MB.</p>
              <label className="bg-white text-black hover:bg-zinc-200 px-6 py-2.5 rounded-full font-medium transition-colors cursor-pointer">
                Browse Files
                <input type="file" className="hidden" accept=".csv" onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])} />
              </label>
            </div>
          </div>
        )}

        {status !== "idle" && (
          <div className="card-glass rounded-2xl p-6 border border-white/5">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#1DB954]/10 rounded-xl">
                  <FileText className="w-8 h-8 text-[#1DB954]" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-lg">{file?.name || "dataset.csv"}</h3>
                  <p className="text-zinc-400 text-sm">{(file?.size ? (file.size / 1024 / 1024).toFixed(2) : "2.4")} MB • CSV</p>
                </div>
              </div>
              {status !== "analyzing" && (
                <button onClick={handleDelete} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="flex justify-end pt-4 border-t border-white/5">
              <button 
                onClick={handleAnalyze}
                disabled={status === "analyzing"}
                className="flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] disabled:bg-[#1DB954]/50 text-black px-6 py-2.5 rounded-full font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(29,185,84,0.3)]"
              >
                {status === "analyzing" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                {status === "analyzing" ? "Uploading & Analyzing..." : "Analyze Dataset"}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 2. Recent Datasets Carousel (New) */}
      {!loading && datasets.length > 0 && (
        <section className="space-y-4 pt-8 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#1DB954]" />
              Recent Datasets
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
            {datasets.slice(0, 5).map(dataset => (
              <div key={`recent-${dataset.id}`} className="min-w-[280px] bg-white/5 border border-white/10 rounded-xl p-4 snap-start hover:bg-white/10 transition-colors group cursor-pointer" onClick={() => setPreviewDataset(dataset)}>
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-[#1DB954]/10 rounded-lg">
                    <Database className="w-5 h-5 text-[#1DB954]" />
                  </div>
                  <span className="text-xs text-zinc-500">{new Date(dataset.lastAnalysis).toLocaleDateString()}</span>
                </div>
                <h3 className="font-semibold text-white truncate mb-1">{dataset.name}</h3>
                <p className="text-xs text-zinc-400 mb-4">{dataset.count.toLocaleString()} Reviews • {dataset.source}</p>
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); startAnalysis(); }} className="flex-1 bg-[#1DB954] text-black text-xs font-semibold py-1.5 rounded-md hover:bg-[#1ed760] transition-colors flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3 fill-current" /> Quick Analyze
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); router.push('/dashboard'); }} className="flex-1 bg-white/10 text-white text-xs font-medium py-1.5 rounded-md hover:bg-white/20 transition-colors">
                    Dashboard
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Review Dataset Library Grid */}
      <section className="space-y-6 pt-8 border-t border-white/10 relative">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Database className="w-6 h-6 text-[#1DB954]" />
              Review Dataset Library
            </h2>
            <p className="text-zinc-400 mt-1">Manage and re-analyze your previously uploaded datasets.</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search datasets, sources, tags..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#1DB954]/50"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-300 hover:bg-white/10 transition-colors focus:outline-none appearance-none"
            >
              <option value="date" className="bg-[#121212]">Sort: Newest</option>
              <option value="count" className="bg-[#121212]">Sort: Review Count</option>
              <option value="name" className="bg-[#121212]">Sort: Name A-Z</option>
            </select>
            <select 
              value={filterSource} 
              onChange={e => setFilterSource(e.target.value)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-300 hover:bg-white/10 transition-colors focus:outline-none appearance-none"
            >
              <option value="All" className="bg-[#121212]">Filter: All Sources</option>
              <option value="Play Store" className="bg-[#121212]">Google Play</option>
              <option value="App Store" className="bg-[#121212]">App Store</option>
              <option value="Reddit" className="bg-[#121212]">Reddit</option>
              <option value="YouTube" className="bg-[#121212]">YouTube</option>
              <option value="Spotify Community" className="bg-[#121212]">Spotify Community</option>
              <option value="Combined" className="bg-[#121212]">Combined</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-300 hover:bg-white/10 transition-colors hidden sm:flex">
              <LayoutGrid className="w-4 h-4" /> Grid
            </button>
          </div>
        </div>

        {/* Datasets Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-48 rounded-xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredDatasets.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-xl border border-white/5 border-dashed flex flex-col items-center">
            <Database className="w-16 h-16 text-zinc-600 mb-6" />
            <h3 className="text-xl font-medium text-white mb-2">No datasets available.</h3>
            <p className="text-zinc-400 text-sm mb-6 max-w-sm">You haven't processed any datasets yet. Upload a CSV file above to create your first dataset.</p>
            <div className="flex gap-4">
              <button className="bg-[#1DB954] text-black px-6 py-2.5 rounded-full font-semibold hover:bg-[#1ed760] transition-colors" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                Upload Dataset
              </button>
              <button className="bg-white/10 text-white px-6 py-2.5 rounded-full font-medium hover:bg-white/20 transition-colors">
                Import Sample
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDatasets.map(dataset => (
              <div 
                key={dataset.id} 
                className={`group relative card-glass rounded-xl p-5 border transition-all cursor-pointer hover:bg-white/5 ${
                  selectedIds.has(dataset.id) ? 'border-[#1DB954] bg-[#1DB954]/5' : 'border-white/5 hover:border-white/20'
                }`}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('.no-drawer')) return;
                  setPreviewDataset(dataset);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="no-drawer text-[#1DB954] cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); toggleSelection(dataset.id); }}
                    >
                      {selectedIds.has(dataset.id) ? <CheckSquare className="w-5 h-5 fill-current" /> : <div className="w-5 h-5 rounded border border-zinc-500 hover:border-[#1DB954] bg-black/50" />}
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[#1DB954]/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#1DB954]" />
                    </div>
                  </div>
                  <div className="relative no-drawer">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === dataset.id ? null : dataset.id); }}
                      className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {activeMenu === dataset.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-[#282828] border border-white/10 rounded-lg shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95">
                        <div className="p-1">
                          <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded flex items-center gap-2"><LayoutGrid className="w-4 h-4"/> Open Dataset</button>
                          <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded flex items-center gap-2" onClick={() => setPreviewDataset(dataset)}><Search className="w-4 h-4"/> Preview Reviews</button>
                          <button className="w-full text-left px-3 py-2 text-sm text-[#1DB954] hover:bg-white/10 rounded flex items-center gap-2" onClick={startAnalysis}><Play className="w-4 h-4"/> Analyze</button>
                          <div className="h-px bg-white/10 my-1" />
                          <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded flex items-center gap-2"><GitCompare className="w-4 h-4"/> Compare</button>
                          <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded flex items-center gap-2"><FileOutput className="w-4 h-4"/> Duplicate</button>
                          <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded flex items-center gap-2"><Tag className="w-4 h-4"/> Edit Tags</button>
                          <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded flex items-center gap-2"><Download className="w-4 h-4"/> Download</button>
                          <div className="h-px bg-white/10 my-1" />
                          <button className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded flex items-center gap-2"><Trash2 className="w-4 h-4"/> Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <h3 className="font-semibold text-white text-lg truncate mb-1" title={dataset.name}>{dataset.name}</h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-zinc-300">{dataset.source}</span>
                  <span className="bg-[#1DB954]/10 text-[#1DB954] px-2 py-0.5 rounded text-xs font-medium">{dataset.version}</span>
                </div>

                <div className="grid grid-cols-2 gap-y-2 mb-4 text-xs">
                  <div className="flex items-center gap-1 text-zinc-400"><Globe className="w-3 h-3" /> {dataset.language}</div>
                  <div className="flex items-center gap-1 text-zinc-400"><User className="w-3 h-3" /> {dataset.owner}</div>
                  <div className="flex items-center gap-1 text-zinc-400"><Database className="w-3 h-3" /> {dataset.fileSize}</div>
                  <div className="flex items-center gap-1 text-zinc-400"><Clock className="w-3 h-3" /> {new Date(dataset.uploadDate).toLocaleDateString()}</div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-500">Reviews</span>
                    <span className="text-sm font-medium text-white">{dataset.count.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-zinc-500">Status</span>
                    <span className="text-sm font-medium text-[#1DB954] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {dataset.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Primary Research & External Sources */}
      <section className="space-y-6 pt-8 border-t border-white/10 relative">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <LinkIcon className="w-6 h-6 text-[#1DB954]" />
              Primary Research & External Connections
            </h2>
            <p className="text-zinc-400 mt-1">Live sync data from surveys, forms, and custom sources.</p>
          </div>
          <button className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Connection
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card-glass rounded-xl p-5 border border-white/5 hover:border-[#1DB954]/50 transition-all flex flex-col group relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white truncate">Google Forms</h3>
                  <span className="text-xs text-zinc-500">Live Sync Active</span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-[#1DB954]/10 text-[#1DB954] px-2 py-0.5 rounded text-xs font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-pulse" /> Connected
              </div>
            </div>
            
            <h4 className="text-sm font-medium text-white mb-2 leading-relaxed">Spotify Music Discovery Research Survey</h4>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-zinc-300">{mockSurveyResponses.length} Responses</span>
              <span className="bg-[#1DB954]/10 text-[#1DB954] px-2 py-0.5 rounded text-xs font-medium">Auto-Syncing</span>
            </div>
            <p className="text-xs text-zinc-400 mb-4 flex-1">Automatically importing new user responses directly into the Pulse AI data lake for sentiment tracking.</p>
            
            <div className="mt-auto pt-4 border-t border-white/5 flex gap-2">
               <a href="https://forms.gle/r972iBLoWvVttmkQA" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors border border-white/5">
                 <ExternalLink className="w-3 h-3" /> View Form
               </a>
               <button onClick={() => setShowSurveyResponses(true)} className="flex-1 flex items-center justify-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black px-3 py-2 rounded-lg text-xs font-bold transition-colors shadow-[0_0_10px_rgba(29,185,84,0.2)]">
                 <Play className="w-3 h-3 fill-current" /> Import Data
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Floating Action Toolbar (Expanded) */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#181818]/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] rounded-full px-6 py-3 flex items-center gap-6 animate-in slide-in-from-bottom-8 z-40">
          <div className="flex items-center gap-3 pr-6 border-r border-white/10">
            <div className="text-[#1DB954] cursor-pointer" onClick={toggleAll}>
              {selectedIds.size === filteredDatasets.length ? <CheckSquare className="w-5 h-5 fill-current" /> : <div className="w-5 h-5 rounded border border-zinc-500 bg-black/50" />}
            </div>
            <span className="text-sm font-bold text-white whitespace-nowrap">{selectedIds.size} selected</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
            <button onClick={startAnalysis} className="flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black px-4 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap shadow-[0_0_15px_rgba(29,185,84,0.3)]">
              <Play className="w-4 h-4 fill-current" /> Analyze Selected
            </button>
            <button onClick={handleMergeSelected} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap">
              <Merge className="w-4 h-4" /> Merge
            </button>
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap">
              <GitCompare className="w-4 h-4" /> Compare
            </button>
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap">
              <Lightbulb className="w-4 h-4" /> Insights
            </button>
            <button onClick={() => router.push('/personas')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap">
              <Users className="w-4 h-4" /> Personas
            </button>
            <button onClick={handleDeleteSelected} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors ml-2 flex-shrink-0">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Preview Side Drawer (Expanded) */}
      {previewDataset && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in" onClick={() => setPreviewDataset(null)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#121212] border-l border-white/10 shadow-2xl z-50 p-6 overflow-y-auto custom-scrollbar animate-in slide-in-from-right-full duration-300">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#121212] py-2 z-10 border-b border-white/10">
              <h2 className="text-xl font-bold text-white truncate pr-4">{previewDataset.name}</h2>
              <button onClick={() => setPreviewDataset(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <button onClick={startAnalysis} className="w-full mb-8 flex justify-center items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black py-3 rounded-xl font-bold transition-transform hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(29,185,84,0.3)]">
              <Play className="w-5 h-5 fill-current" /> Analyze This Dataset
            </button>

            <div className="space-y-8">
              {/* Dataset Overview */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3 tracking-wider flex items-center gap-2"><Database className="w-4 h-4 text-[#1DB954]" /> Overview</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <span className="text-zinc-500 text-xs block mb-1">Reviews</span>
                    <span className="text-white font-bold text-lg">{previewDataset.count.toLocaleString()}</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <span className="text-zinc-500 text-xs block mb-1">Avg Rating</span>
                    <span className="text-[#1DB954] font-bold text-lg flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" /> 
                      {previewDataset.ratings.length ? (previewDataset.ratings.reduce((a:number,b:number)=>a+b,0)/previewDataset.ratings.length).toFixed(1) : "N/A"}
                    </span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <span className="text-zinc-500 text-xs block mb-1">Source</span>
                    <span className="text-white font-medium text-sm">{previewDataset.source}</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <span className="text-zinc-500 text-xs block mb-1">Language</span>
                    <span className="text-white font-medium text-sm">{previewDataset.language}</span>
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3 tracking-wider flex items-center gap-2"><Lightbulb className="w-4 h-4 text-[#1DB954]" /> Recent AI Summary</h3>
                <div className="bg-[#1DB954]/5 border border-[#1DB954]/20 rounded-xl p-4 text-sm text-zinc-300 leading-relaxed">
                  Users are primarily discussing UX friction related to navigation changes. The sentiment leans negative regarding the recent update, but positive towards performance improvements.
                </div>
              </div>

              {/* Top Themes */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3 tracking-wider flex items-center gap-2"><Activity className="w-4 h-4 text-[#1DB954]" /> Top Themes</h3>
                <div className="space-y-2">
                  {['Navigation Confusion (45%)', 'Shuffle Broken (28%)', 'Battery Drain (15%)'].map((theme, i) => (
                    <div key={i} className="bg-white/5 px-3 py-2 rounded-lg text-sm text-zinc-300 border border-white/5">{theme}</div>
                  ))}
                </div>
              </div>

              {/* Raw Reviews Preview */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3 tracking-wider flex items-center gap-2"><FileText className="w-4 h-4 text-[#1DB954]" /> Preview (First 20)</h3>
                <div className="space-y-3">
                  {previewDataset.reviews.map((r: any, idx: number) => (
                    <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5 text-sm text-zinc-300">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-zinc-500">{new Date(r.created_at).toLocaleDateString()}</span>
                        {r.rating && <span className="text-yellow-500 text-xs">{"★".repeat(r.rating)}</span>}
                      </div>
                      <p className="line-clamp-3">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 6. Advanced Analysis Simulation Overlay */}
      {analyzingSim.active && (
        <div className="fixed inset-0 bg-[#000000]/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
          <div className="w-24 h-24 bg-[#1DB954]/10 rounded-3xl flex items-center justify-center mb-10 border border-[#1DB954]/30 shadow-[0_0_80px_rgba(29,185,84,0.3)] relative">
            <Activity className="w-12 h-12 text-[#1DB954] animate-pulse" />
            <svg className="absolute inset-0 w-full h-full -rotate-90 text-[#1DB954]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
              <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="301.59" strokeDashoffset={301.59 - (301.59 * analyzingSim.progress) / 100} className="transition-all duration-300 ease-linear" />
            </svg>
          </div>
          
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">{analyzingSim.progress}%</h2>
            <p className="text-[#1DB954] text-xl font-medium h-8">{analysisSteps[analyzingSim.step]}</p>
          </div>
          
          <div className="w-80 bg-white/5 rounded-full h-3 mb-6 overflow-hidden border border-white/10">
            <div 
              className="bg-[#1DB954] h-full transition-all duration-300 ease-linear relative overflow-hidden"
              style={{ width: `${analyzingSim.progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_1s_infinite] -translate-x-full" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-zinc-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Estimated time remaining: <span className="text-white">{analyzingSim.timeLeft}</span></span>
          </div>
        </div>
      )}

      {/* 7. Survey Responses Modal */}
      {showSurveyResponses && (
        <div className="fixed inset-0 bg-[#000000]/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200" onClick={() => setShowSurveyResponses(false)}>
          <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white tracking-tight">Spotify Music Discovery Research Survey</h2>
                    <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-xs font-medium text-zinc-300">{mockSurveyResponses.length} Responses</span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">Live Imported Responses</p>
                </div>
              </div>
              <button onClick={() => setShowSurveyResponses(false)} className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-b from-[#121212] to-[#0a0a0a]">
              <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-white/5 border-b border-white/10 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 w-16">ID</th>
                      <th className="px-4 py-3 w-28">Date</th>
                      <th className="px-4 py-3 w-48">Primary Discovery Method</th>
                      <th className="px-4 py-3 w-1/3">Key Frustration</th>
                      <th className="px-4 py-3 w-1/3">Desired Feature</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {mockSurveyResponses.map((res, i) => (
                      <tr key={res.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-mono text-zinc-500">#{res.id}</td>
                        <td className="px-4 py-3">{res.date}</td>
                        <td className="px-4 py-3 text-white font-medium">{res.method}</td>
                        <td className="px-4 py-3 text-red-400/90">{res.frustration}</td>
                        <td className="px-4 py-3 text-[#1DB954]">{res.desire}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end">
              <button className="flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-[0_0_15px_rgba(29,185,84,0.3)]">
                <Database className="w-4 h-4" /> Add to Data Lake
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
