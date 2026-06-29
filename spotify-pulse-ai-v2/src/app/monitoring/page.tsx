"use client";

import { useState } from "react";
import { Bell, Plus, CheckCircle2, ShieldAlert, Activity, Save } from "lucide-react";

const INITIAL_ALERTS = [
  { id: 1, name: "App Crash Spike", condition: "Count > 50 in 1 hour", active: true, channel: "Slack #product-alerts" },
  { id: 2, name: "Battery Drain Reports", condition: "Sentiment drops below 2.0", active: true, channel: "Email (engineering@spotify.com)" },
  { id: 3, name: "Smart Shuffle Backlash", condition: "Keyword volume > 100", active: false, channel: "Slack #growth-team" },
];

export default function MonitoringPage() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [isAdding, setIsAdding] = useState(false);
  
  const toggleAlert = (id: number) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-[#1DB954]" /> Automated Alerts
          </h1>
          <p className="text-zinc-400 mt-2">Configure logic triggers to monitor product health in real-time.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-[#1DB954] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#1ed760] transition-colors shadow-[0_0_15px_rgba(29,185,84,0.3)]"
        >
          <Plus className="w-4 h-4" /> New Alert Rule
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#181818] border border-[#1DB954]/30 rounded-xl p-6 shadow-xl animate-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-white mb-4">Create New Alert Rule</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Alert Name</label>
              <input type="text" placeholder="e.g. Offline Mode Failure" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#1DB954] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Trigger Condition</label>
              <select className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#1DB954] focus:outline-none appearance-none">
                <option>Keyword Volume Exceeds...</option>
                <option>Sentiment Drops Below...</option>
                <option>App Crash Mentions Exceeds...</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Threshold</label>
              <input type="number" placeholder="Value" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#1DB954] focus:outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Rule
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/5 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-zinc-400" />
          <h2 className="text-lg font-semibold text-white">Active Monitors</h2>
        </div>
        
        <div className="divide-y divide-white/5">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg mt-1 ${alert.active ? 'bg-[#1DB954]/10 text-[#1DB954]' : 'bg-zinc-800 text-zinc-500'}`}>
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-semibold text-lg ${alert.active ? 'text-white' : 'text-zinc-500'}`}>{alert.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-zinc-400">
                    <span className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded border border-white/5">
                      <span className="font-mono text-zinc-300">IF</span> {alert.condition}
                    </span>
                    <span>→</span>
                    <span className="text-zinc-300">{alert.channel}</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => toggleAlert(alert.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  alert.active 
                    ? 'bg-[#1DB954]/10 text-[#1DB954] hover:bg-[#1DB954]/20' 
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {alert.active ? (
                  <><CheckCircle2 className="w-4 h-4" /> Active</>
                ) : (
                  <>Paused</>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
