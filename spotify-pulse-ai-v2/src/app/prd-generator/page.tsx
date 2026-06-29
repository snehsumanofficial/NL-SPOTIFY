"use client";

import { useState, useEffect, Suspense } from "react";
import { FileText, Download, Wand2, Edit3, Save, Check } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

function generateDynamicPRD(opp: any) {
  if (!opp) return "";
  return `
# Product Requirements Document: ${opp.title}

## 1. Problem Statement
The current experience is leading to friction for users. Addressing this opportunity is classified as a Priority: **${opp.priority}**.

## 2. Background
${opp.evidence}

## 3. Goals
- **Primary:** Implement the requested feature and resolve the core pain point.
- **Secondary:** Improve user satisfaction and retention.

## 4. Success Metrics (KPIs)
- **Reach:** ${opp.reach}
- **Impact:** ${opp.impact}
- **Confidence:** ${opp.confidence}
- **Effort:** ${opp.effort}
- **KPI Target:** ${opp.kpi}

## 5. User Stories
- **As a** User, **I want** to use this feature, **so that** my workflow is improved.

## 6. Acceptance Criteria
- [ ] The core functionality is implemented according to specifications.
- [ ] Analytics tracking is added for the primary KPI (${opp.kpi}).
- [ ] QA verification passes across all supported devices.

## 7. MVP Scope
- Backend endpoints and database schema updates.
- Frontend UI implementation and integration.

## 8. Risks
- Potential delays in deployment due to cross-functional dependencies.
- *Mitigation:* Ensure early alignment with design and backend teams.

## 9. Timeline
- **Week 1-2:** Design & Architecture.
- **Week 3-4:** Implementation & Testing.
- **Week 5:** Phased Rollout.
  `;
}


function PRDGeneratorContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const initialOpp = searchParams.get('oppTitle') || "";

  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  const [selectedOppId, setSelectedOppId] = useState<string>("");

  useEffect(() => {
    async function fetchOpps() {
      const { data } = await supabase.from('opportunities').select('*').order('created_at', { ascending: false });
      if (data) {
        setOpportunities(data);
        if (data.length > 0) {
          const matched = data.find(o => o.title === initialOpp);
          setSelectedOppId(matched ? matched.id : data[0].id);
        }
      }
    }
    fetchOpps();
  }, [supabase, initialOpp]);

  const handleGenerate = () => {
    setIsGenerating(true);
    const opp = opportunities.find(o => o.id === selectedOppId);
    const customizedPRD = generateDynamicPRD(opp);
    setTimeout(() => {
      setContent(customizedPRD);
      setIsGenerating(false);
      setHasGenerated(true);
    }, 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 h-full flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#1DB954]" />
            PRD Generator
          </h1>
          <p className="text-zinc-400 mt-1">Transform identified opportunities into complete Product Requirements Documents instantly.</p>
        </div>
        
        {hasGenerated ? (
          <div className="flex gap-3">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isEditing ? "bg-[#1DB954] text-black hover:bg-[#1ed760]" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {isEditing ? <><Save className="w-4 h-4" /> Save</> : <><Edit3 className="w-4 h-4" /> Edit</>}
            </button>
            <div className="h-9 w-px bg-white/10 mx-1"></div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
              <Download className="w-4 h-4 text-[#1DB954]" />
              PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
              <Download className="w-4 h-4 text-blue-400" />
              DOCX
            </button>
          </div>
        ) : null}
      </div>

      {!hasGenerated ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="max-w-md w-full card-glass p-8 rounded-2xl border border-white/10 text-center">
            <div className="w-16 h-16 bg-[#1DB954]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Wand2 className={`w-8 h-8 text-[#1DB954] ${isGenerating ? 'animate-pulse' : ''}`} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Select an Opportunity</h2>
            <p className="text-sm text-zinc-400 mb-8">Choose an AI-identified opportunity to instantly draft a comprehensive PRD.</p>
            
            <select 
              value={selectedOppId}
              onChange={(e) => setSelectedOppId(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#1DB954] mb-6 appearance-none cursor-pointer"
            >
              {opportunities.map(opp => (
                <option key={opp.id} value={opp.id}>{opp.title}</option>
              ))}
            </select>
            
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] disabled:bg-[#1DB954]/50 text-black px-6 py-3 rounded-lg font-bold transition-all"
            >
              {isGenerating ? "Drafting Document..." : "Generate PRD"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-2xl p-12 overflow-y-auto shadow-2xl relative text-black">
          {isEditing ? (
            <textarea
              className="w-full h-full min-h-[600px] resize-none outline-none font-mono text-sm leading-relaxed text-zinc-800 bg-transparent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          ) : (
            <div 
              className="prose max-w-none prose-headings:text-black prose-p:text-zinc-700 prose-li:text-zinc-700"
              dangerouslySetInnerHTML={{ __html: formatMockMarkdown(content) }} 
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function PRDGenerator() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Loading Generator...</div>}>
      <PRDGeneratorContent />
    </Suspense>
  );
}

// Basic markdown parser
function formatMockMarkdown(text: string) {
  return text
    .replace(/^# (.*?)$/gm, '<h1 class="text-3xl font-black mb-6">$1</h1>')
    .replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold mt-8 mb-4 border-b pb-2">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\- \[( )\] (.*?)$/gm, '<div class="flex items-center gap-2 mb-2"><div class="w-4 h-4 border border-zinc-400 rounded-sm"></div><span>$2</span></div>')
    .replace(/^\- (.*?)$/gm, '<li class="ml-4 mb-2">$1</li>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '<br/>');
}
