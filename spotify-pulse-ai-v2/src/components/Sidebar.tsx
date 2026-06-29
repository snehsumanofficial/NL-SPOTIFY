"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  UploadCloud, 
  BarChart2, 
  Bot, 
  Users,
  Lightbulb, 
  FileText, 
  PieChart, 
  Settings,
  Sun,
  Moon,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const routes = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Competitors", path: "/competitors", icon: Globe },
  { name: "Upload Reviews", path: "/upload-reviews", icon: UploadCloud },
  { name: "Analytics", path: "/analytics", icon: BarChart2 },
  { name: "AI Product Copilot", path: "/ai-copilot", icon: Bot },
  { name: "Personas", path: "/personas", icon: Users },
  { name: "Opportunity Hub", path: "/opportunity-hub", icon: Lightbulb },
  { name: "PRD Generator", path: "/prd-generator", icon: FileText },
  { name: "Reports", path: "/reports", icon: PieChart },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
  }, [isLightMode]);

  return (
    <aside className="w-64 h-full glass border-r flex flex-col flex-shrink-0">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#1DB954] flex-shrink-0 preserve-colors" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.84-.12-.96-.54-.12-.42.12-.84.54-.96 4.56-1.02 8.52-.6 11.64 1.32.42.24.48.66.36 1.08zm1.44-3.18c-.3.48-.9.6-1.38.3-3.24-2.04-8.16-2.64-11.94-1.44-.54.18-1.08-.12-1.26-.66-.18-.54.12-1.08.66-1.26 4.32-1.38 9.72-.72 13.5 1.62.54.3.66.9.42 1.44zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.66.18-1.38-.18-1.56-.84-.18-.66.18-1.38.84-1.56 4.32-1.32 11.28-1.02 16.08 1.86.6.36.78 1.14.42 1.74-.36.6-1.14.78-1.74.42z" />
          </svg>
          <h1 className="font-bold text-xl tracking-tight text-white whitespace-nowrap">VOC Pulse AI</h1>
        </div>
        <button 
          onClick={() => setIsLightMode(!isLightMode)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
        >
          {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {routes.map((route) => {
          const isActive = pathname === route.path || (pathname === '/' && route.path === '/dashboard');
          const Icon = route.icon;
          
          return (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-[#1DB954]/10 text-[#1DB954]" 
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
              )}
            >
              <Icon className="w-5 h-5" />
              {route.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex-shrink-0 overflow-hidden">
            <img src="https://ui-avatars.com/api/?name=PM&background=1DB954&color=fff" alt="User" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">Product Manager</p>
            <p className="text-xs text-zinc-500 truncate">Spotify Pro</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
