"use client";

import { useState, useEffect } from "react";
import { FileBarChart, Download, Calendar, ArrowRight, FileText, Image as ImageIcon, Table, Loader2, CheckCircle2, X } from "lucide-react";

const reportTypes = [
  {
    id: "exec",
    title: "Executive Summary",
    description: "High-level overview of product health, top user complaints, and AI-identified business impact.",
    icon: FileBarChart,
    color: "from-blue-500/20 to-purple-500/20",
    border: "border-blue-500/30",
    textColor: "text-blue-400"
  },
  {
    id: "weekly",
    title: "Weekly PM Report",
    description: "Deep dive into feature-specific feedback, emerging trends, and bug clusters for the week.",
    icon: Calendar,
    color: "from-[#1DB954]/20 to-emerald-500/20",
    border: "border-[#1DB954]/30",
    textColor: "text-[#1DB954]"
  },
  {
    id: "roadmap",
    title: "Roadmap Report",
    description: "Prioritized list of opportunities scored by RICE, with supporting user evidence attached.",
    icon: ArrowRight,
    color: "from-orange-500/20 to-red-500/20",
    border: "border-orange-500/30",
    textColor: "text-orange-400"
  }
];

export default function Reports() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentReport, setCurrentReport] = useState<{title: string, format: string} | null>(null);
  const [isDone, setIsDone] = useState(false);

  const startGeneration = (title: string, format: string = "PDF") => {
    setCurrentReport({ title, format });
    setIsGenerating(true);
    setProgress(0);
    setIsDone(false);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15 + 5;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => setIsDone(true), 500);
      }
      setProgress(Math.min(currentProgress, 100));
    }, 300);
  };

  const closeOverlay = () => {
    setIsGenerating(false);
    setTimeout(() => {
      setCurrentReport(null);
      setIsDone(false);
      setProgress(0);
    }, 300);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 relative">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <FileBarChart className="w-8 h-8 text-[#1DB954]" />
          Automated Reports
        </h1>
        <p className="text-zinc-400 mt-1">Generate presentation-ready reports for stakeholders with one click.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <div key={report.id} className="card-glass rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all flex flex-col group hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#1DB954]/5">
            <div className={`p-8 bg-gradient-to-br ${report.color} flex-1 flex flex-col items-start`}>
              <div className={`p-3 rounded-xl bg-black/40 border ${report.border} mb-6`}>
                <report.icon className={`w-8 h-8 ${report.textColor}`} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{report.title}</h2>
              <p className="text-sm text-zinc-300 leading-relaxed mb-8">{report.description}</p>
              
              <div className="mt-auto w-full">
                <button 
                  onClick={() => startGeneration(report.title, "PDF")}
                  className="w-full flex items-center justify-center gap-2 bg-black/40 hover:bg-black/60 border border-white/10 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  Generate Report
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-black/40 border-t border-white/5 flex gap-2 justify-center">
              <ExportButton icon={FileText} label="PDF" onClick={() => startGeneration(report.title, "PDF")} />
              <ExportButton icon={ImageIcon} label="PPTX" onClick={() => startGeneration(report.title, "PPTX")} />
              <ExportButton icon={Table} label="CSV" onClick={() => startGeneration(report.title, "CSV")} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 card-glass p-8 rounded-2xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-6">Recent Generations</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer border border-white/5 group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[#1DB954]/10 rounded-lg">
                  <FileText className="w-5 h-5 text-[#1DB954]" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white group-hover:text-[#1DB954] transition-colors">Q2 Discovery Health Executive Summary</h4>
                  <p className="text-xs text-zinc-500">Generated {i} day{i > 1 ? 's' : ''} ago by Product Manager</p>
                </div>
              </div>
              <button 
                onClick={() => startGeneration("Q2 Discovery Health Executive Summary", "PDF")}
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Generation Overlay Modal */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={isDone ? closeOverlay : undefined} />
          
          <div className="relative bg-[#181818] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl p-8 w-full max-w-md animate-in zoom-in-95 duration-300">
            {isDone && (
              <button onClick={closeOverlay} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="flex flex-col items-center text-center">
              <div className="mb-6 relative">
                {!isDone ? (
                  <div className="w-16 h-16 rounded-full bg-[#1DB954]/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[#1DB954] animate-spin" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#1DB954]/20 flex items-center justify-center animate-in zoom-in spin-in-12 duration-500">
                    <CheckCircle2 className="w-10 h-10 text-[#1DB954]" />
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">
                {!isDone ? "Synthesizing Data..." : "Report Ready!"}
              </h3>
              
              <p className="text-sm text-zinc-400 mb-8 max-w-[250px]">
                {!isDone 
                  ? `Compiling user reviews and RICE scores into your ${currentReport?.format} ${currentReport?.title}.` 
                  : `Your ${currentReport?.format} report has been generated successfully and is ready to download.`}
              </p>

              {!isDone ? (
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-xs text-zinc-500 font-medium">
                    <span>Processing {Math.floor(progress * 154)} reviews</span>
                    <span>{Math.floor(progress)}%</span>
                  </div>
                  <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden border border-white/5">
                    <div 
                      className="bg-[#1DB954] h-full rounded-full transition-all duration-300 ease-out relative"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_1s_infinite]" />
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={closeOverlay}
                  className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(29,185,84,0.3)]"
                >
                  <Download className="w-5 h-5" />
                  Download {currentReport?.format}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExportButton({ icon: Icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white text-xs font-medium transition-colors"
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
