"use client";

import { useRef, useEffect, useState } from "react";
import { Send, Bot, User, Sparkles, StopCircle, RefreshCw, Mic } from "lucide-react";

const suggestedPrompts = [
  "Why are users unhappy with Discover Weekly?",
  "Why do users complain about Shuffle?",
  "Compare Reddit vs Google Play complaints.",
  "What are the top pain points?",
  "What features should Spotify prioritize?",
  "Generate a PRD.",
  "Generate user personas.",
  "What is the biggest churn risk?"
];

export default function AICopilot() {
  const [messages, setMessages] = useState<Array<{role: string, content: string, metadata?: any}>>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
    setTimeout(() => {
      submitMessage(prompt);
    }, 50);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    submitMessage(inputValue);
  };

  const startListening = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Recognition. Try using Chrome.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setInputValue(text);
      // Optionally auto submit:
      // setTimeout(() => submitMessage(text), 300);
    };
    recognition.onerror = (event: any) => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const submitMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error(response.statusText);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      setMessages([...newMessages, { role: 'assistant', content: '', metadata: null }]);

      let done = false;
      let aiText = '';

      while (!done && reader) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const textChunk = JSON.parse(line.substring(2));
                aiText += textChunk;
              } catch (e) {}
            } else if (line.startsWith('8:')) {
              try {
                const metaChunk = JSON.parse(line.substring(2));
                setMessages(current => {
                  const updated = [...current];
                  const lastMsg = updated[updated.length - 1];
                  if (lastMsg && lastMsg.role === 'assistant') {
                    lastMsg.metadata = metaChunk;
                  }
                  return updated;
                });
              } catch (e) {}
            } else if (line.trim().length > 0 && !line.startsWith('e:') && !line.startsWith('d:')) {
              aiText += line + (lines.length > 1 ? '\n' : '');
            }
          }

          setMessages(current => {
            const updated = [...current];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
              lastMsg.content = aiText;
            }
            return updated;
          });
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Chat error:", error);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#121212]/80 backdrop-blur-xl sticky top-0 z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Bot className="w-8 h-8 text-[#1DB954]" />
            AI Product Copilot
          </h1>
          <p className="text-zinc-400 mt-1">Ask questions about your users, feedback, and product opportunities.</p>
        </div>
        <button 
          onClick={() => { stop(); setMessages([]); }}
          className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 transition-colors tooltip"
          title="Clear Chat"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
            <div className="w-16 h-16 rounded-2xl bg-[#1DB954]/20 flex items-center justify-center mb-6 border border-[#1DB954]/30 shadow-[0_0_30px_rgba(29,185,84,0.15)]">
              <Sparkles className="w-8 h-8 text-[#1DB954]" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-8">How can I help you build better?</h2>
            
            <div className="grid grid-cols-2 gap-4 max-w-2xl w-full">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className="p-4 text-left rounded-xl card-glass border border-white/5 hover:border-[#1DB954]/50 hover:bg-[#1DB954]/5 transition-all group"
                >
                  <p className="text-sm font-medium text-zinc-300 group-hover:text-white">{prompt}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              {msg.role !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#1DB954]/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-[#1DB954]" />
                </div>
              )}
              
              <div className={`max-w-[80%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl p-5 ${
                  msg.role === 'user' 
                    ? 'bg-zinc-800 text-white rounded-tr-sm' 
                    : 'card-glass border border-white/10 rounded-tl-sm text-zinc-300 prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 w-full'
                }`}>
                  {msg.role !== 'user' ? (
                    <div dangerouslySetInnerHTML={{ __html: formatMockMarkdown(msg.content) }} />
                  ) : (
                    msg.content
                  )}
                  {isLoading && i === messages.length - 1 && msg.role !== 'user' && (
                    <span className="inline-block w-2 h-4 ml-1 bg-[#1DB954] animate-pulse" />
                  )}
                </div>

                {/* Evidence Panel (Metadata) */}
                {msg.metadata && msg.metadata.type === 'evidence_metadata' && (
                  <div className="w-full mt-2 rounded-xl bg-black/40 border border-[#1DB954]/20 p-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#1DB954]" />
                        <h4 className="text-sm font-semibold text-white">Evidence Panel</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400">Confidence:</span>
                        <span className="text-xs font-bold text-[#1DB954] bg-[#1DB954]/10 px-2 py-0.5 rounded-full">{msg.metadata.confidence}%</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Reviews Used</p>
                        <p className="text-sm text-zinc-300 font-medium">{msg.metadata.reviews?.length || 0} matching reviews</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Source Distribution</p>
                        <div className="flex gap-2 flex-wrap">
                          {Object.entries(msg.metadata.sources || {}).map(([source, count]: any) => (
                            <span key={source} className="text-xs bg-white/5 px-2 py-0.5 rounded-md text-zinc-400">
                              {source}: {count}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {msg.metadata.reviews && msg.metadata.reviews.length > 0 && (
                      <div>
                        <p className="text-xs text-zinc-500 mb-2">Raw Reviews (Top 3)</p>
                        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                          {msg.metadata.reviews.slice(0, 3).map((r: any, idx: number) => (
                            <div key={idx} className="bg-white/5 p-3 rounded-lg text-xs text-zinc-400 border border-white/5 hover:border-[#1DB954]/30 transition-colors cursor-default">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-zinc-300">{r.source}</span>
                                {r.rating && <span className="text-yellow-500">{"★".repeat(r.rating)}</span>}
                              </div>
                              <p className="line-clamp-2">{r.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden">
                  <img src="https://ui-avatars.com/api/?name=PM&background=333&color=fff" alt="User" />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-6 bg-[#121212]/90 backdrop-blur-lg border-t border-white/5">
        <form className="max-w-4xl mx-auto relative flex items-center" onSubmit={handleFormSubmit}>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Copilot about your product data..."
            disabled={isLoading || isListening}
            className="w-full bg-black/40 border border-white/10 rounded-full pl-6 pr-24 py-4 text-white focus:outline-none focus:border-[#1DB954]/50 focus:ring-1 focus:ring-[#1DB954]/50 transition-all disabled:opacity-50"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <button
              type="button"
              onClick={startListening}
              disabled={isLoading || isListening}
              className={`p-2.5 rounded-full transition-colors ${
                isListening 
                  ? 'bg-red-500/20 text-red-500 animate-pulse' 
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <button 
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              onClick={(e) => {
                if (isLoading) {
                  e.preventDefault();
                  stop();
                }
              }}
              className="p-2.5 bg-[#1DB954] text-black rounded-full hover:bg-[#1ed760] disabled:opacity-50 disabled:hover:bg-[#1DB954] transition-colors"
            >
              {isLoading ? <StopCircle className="w-5 h-5" /> : <Send className="w-5 h-5 -ml-0.5" />}
            </button>
          </div>
        </form>
        <p className="text-center text-xs text-zinc-500 mt-3">
          AI Copilot can make mistakes. Consider verifying important metrics.
        </p>
      </div>
    </div>
  );
}

// Basic markdown parser
function formatMockMarkdown(text: string) {
  let html = text
    .replace(/## (.*?)\n/g, '<h2 class="text-xl font-bold text-white mt-6 mb-3 border-b border-white/10 pb-2">$1</h2>')
    .replace(/# (.*?)\n/g, '<h1 class="text-2xl font-bold text-white mt-4 mb-4">$1</h1>')
    .replace(/### (.*?)\n/g, '<h3 class="text-lg font-semibold text-white mt-5 mb-2">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/> (.*?)\n/g, '<blockquote class="border-l-2 border-[#1DB954] pl-4 italic text-zinc-400 my-4 bg-[#1DB954]/5 py-2 rounded-r-lg">$1</blockquote>')
    .replace(/- (.*?)\n/g, '<li class="ml-4 mb-1">$1</li>')
    .replace(/1\. (.*?)\n/g, '<li class="ml-4 mb-2 list-decimal">$1</li>')
    .replace(/2\. (.*?)\n/g, '<li class="ml-4 mb-2 list-decimal">$1</li>')
    .replace(/\n\n/g, '<br/>');
  
  return html;
}
