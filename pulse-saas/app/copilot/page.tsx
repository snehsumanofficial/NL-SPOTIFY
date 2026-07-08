"use client";
import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2, FileText, ChevronDown, ChevronRight, Activity, Target, Zap, ShieldCheck } from "lucide-react";

export default function CopilotPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I am Spotify Pulse AI. I am your evidence-based Product Intelligence Assistant.\n\nI answer product questions strictly using retrieved customer feedback. What would you like to know?",
      evidence: null
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<number[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const toggleReview = (id: number) => {
    setExpandedReviews(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: "user", content: input, evidence: null }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { role: "assistant", content: data.response, evidence: data.evidence }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: `Error: ${data.detail || "Failed to fetch response."}`, evidence: null }]);
      }
    } catch (error) {
      console.error("Failed to fetch copilot response:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Error: Could not connect to the API backend. Is it running?", evidence: null }]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = [
    "Why are users unhappy with Discover Weekly?",
    "Compare Reddit vs Google Play complaints.",
    "What features should Spotify prioritize?"
  ];

  return (
    <div className="flex flex-col h-[85vh] bg-spotify-card border border-[#2A2A2A] rounded-xl overflow-hidden shadow-2xl animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="bg-[#181818] border-b border-[#2A2A2A] p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-[#1DB954]/10 rounded-full flex items-center justify-center mr-3 border border-spotify-green/30">
            <Bot className="w-6 h-6 text-spotify-green" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">Product Intelligence Copilot</h2>
            <p className="text-spotify-text text-xs flex items-center">
              <ShieldCheck className="w-3 h-3 mr-1 text-spotify-green" /> Grounded in 2,221 uploaded reviews
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl p-5 ${
              msg.role === "user" 
                ? "bg-spotify-green text-black rounded-tr-sm" 
                : "bg-[#282828] text-white border border-[#333] rounded-tl-sm"
            }`}>
              <div className="flex items-center mb-2 opacity-70">
                {msg.role === "user" ? <User className="w-4 h-4 mr-2" /> : <Bot className="w-4 h-4 mr-2" />}
                <span className="text-xs font-semibold uppercase tracking-wider">{msg.role === "user" ? "You" : "Pulse AI"}</span>
              </div>
              
              {/* Content Formatting */}
              <div className="text-sm whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none">
                {msg.content.split('\n').map((line, idx) => {
                  if (line.startsWith('### ')) return <h3 key={idx} className="text-lg font-bold text-white mt-4 mb-2">{line.replace('### ', '')}</h3>;
                  if (line.startsWith('> ')) return <blockquote key={idx} className="border-l-2 border-spotify-green pl-3 my-2 text-gray-300 italic">{line.replace('> ', '')}</blockquote>;
                  if (line.startsWith('* ')) return <li key={idx} className="ml-4 list-disc marker:text-spotify-green my-1">{line.replace('* ', '')}</li>;
                  if (line.trim() === '') return <br key={idx} />;
                  return <p key={idx} className="mb-2">{line}</p>;
                })}
              </div>

              {/* Evidence Panel (RAG) */}
              {msg.evidence && (
                <div className="mt-6 pt-6 border-t border-[#444]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-spotify-text uppercase tracking-wider flex items-center">
                      <FileText className="w-4 h-4 mr-2" /> Evidence Panel
                    </h4>
                    <span className="bg-[#1DB954]/20 text-spotify-green text-xs font-bold px-3 py-1 rounded-full flex items-center">
                      <Target className="w-3 h-3 mr-1" /> {msg.evidence.confidence}% Confidence
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-[#1F1F1F] rounded-lg p-3 border border-[#333]">
                      <p className="text-[10px] text-spotify-text uppercase mb-1">Reviews Retrieved</p>
                      <p className="text-white font-semibold text-lg">{msg.evidence.totalUsed}</p>
                    </div>
                    <div className="bg-[#1F1F1F] rounded-lg p-3 border border-[#333]">
                      <p className="text-[10px] text-spotify-text uppercase mb-1">Top Source</p>
                      <p className="text-white font-semibold text-sm truncate">{Object.keys(msg.evidence.sources)[0]}</p>
                    </div>
                    <div className="bg-[#1F1F1F] rounded-lg p-3 border border-[#333]">
                      <p className="text-[10px] text-spotify-text uppercase mb-1">Top Theme</p>
                      <p className="text-white font-semibold text-sm truncate">{msg.evidence.themes[0]}</p>
                    </div>
                  </div>

                  <h5 className="text-xs font-semibold text-white mb-3">Retrieved Source Documents:</h5>
                  <div className="space-y-2">
                    {msg.evidence.reviews.map((review: any) => (
                      <div key={review.id} className="bg-[#1F1F1F] rounded-lg border border-[#333] overflow-hidden transition-all">
                        <button 
                          onClick={() => toggleReview(review.id)}
                          className="w-full flex items-center justify-between p-3 text-left hover:bg-[#252525] transition-colors"
                        >
                          <div className="flex items-center">
                            {expandedReviews.includes(review.id) ? <ChevronDown className="w-4 h-4 text-spotify-text mr-2" /> : <ChevronRight className="w-4 h-4 text-spotify-text mr-2" />}
                            <span className="text-xs text-white truncate max-w-[300px]">{review.text.substring(0, 50)}...</span>
                          </div>
                          <span className="text-[10px] bg-[#333] text-spotify-text px-2 py-0.5 rounded">{review.source}</span>
                        </button>
                        
                        {expandedReviews.includes(review.id) && (
                          <div className="p-4 bg-[#181818] border-t border-[#333] text-sm text-gray-300">
                            <div className="flex items-center mb-3">
                              <span className="text-[10px] uppercase tracking-wider font-bold bg-red-500/20 text-red-400 px-2 py-1 rounded mr-2">{review.sentiment}</span>
                            </div>
                            {review.text}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#282828] text-spotify-text border border-[#333] rounded-2xl rounded-tl-sm p-4 flex items-center space-x-3">
              <Loader2 className="w-4 h-4 animate-spin text-spotify-green" />
              <span className="text-xs font-medium">Running vector similarity search on 2,221 reviews...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#181818] border-t border-[#2A2A2A]">
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((s, i) => (
              <button 
                key={i} 
                onClick={() => setInput(s)}
                className="bg-[#282828] hover:bg-[#333] text-spotify-text hover:text-white text-xs py-2 px-4 rounded-full transition-colors border border-[#333]"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question about the uploaded datasets..."
            className="w-full bg-[#282828] text-white border border-[#333] rounded-full pl-5 pr-12 py-4 focus:outline-none focus:border-spotify-green transition-colors text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 bg-spotify-green hover:bg-[#1ed760] disabled:bg-[#333] disabled:text-gray-500 text-black p-2.5 rounded-full transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10px] text-spotify-text mt-3">
          AI Copilot generates responses purely from the retrieved context. It does not use external knowledge.
        </p>
      </div>
    </div>
  );
}
