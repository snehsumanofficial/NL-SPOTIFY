import React from "react";
import Link from "next/link";
import { LayoutDashboard, UploadCloud, BarChart3, Bot, Users, Target, FileText, Settings, PieChart, Lightbulb } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Product Copilot", href: "/copilot", icon: Bot },
  { name: "Upload Reviews", href: "/upload", icon: UploadCloud },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Qualitative Insights", href: "/insights", icon: Lightbulb },
  { name: "Personas", href: "/personas", icon: Users },
  { name: "Opportunity Hub", href: "/opportunity-hub", icon: Target },
  { name: "PRD Generator", href: "/prd-generator", icon: FileText },
  { name: "Reports", href: "/reports", icon: PieChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  return (
    <div className="w-64 h-screen bg-[#000000] border-r border-[#282828] flex flex-col p-4 fixed left-0 top-0">
      <div className="flex items-center space-x-3 px-2 mb-8 mt-2">
        <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="black" className="w-5 h-5"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.573.398-.868.22-2.37-1.448-5.353-1.776-8.874-.972-.335.076-.662-.132-.738-.467-.076-.335.132-.662.467-.738 3.864-.882 7.163-.51 9.792 1.09.296.18.399.573.22.867zm1.25-3.136c-.226.368-.716.495-1.084.27-2.716-1.667-6.877-2.146-10.024-1.173-.414.127-.852-.104-.98-.518-.126-.414.105-.852.518-.98 3.633-1.124 8.232-.58 11.299 1.316.368.227.495.717.271 1.085zm.11-3.265C14.73 8.12 9.94 7.926 5.8 9.183c-.496.151-1.018-.129-1.168-.625-.152-.495.129-1.018.625-1.168 4.73-1.439 10.233-1.22 13.916.97.441.262.585.83.323 1.272-.262.441-.83.585-1.272.323z"/></svg>
        </div>
        <span className="text-white font-bold text-lg tracking-wide">Pulse AI</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href} className="flex items-center space-x-3 px-3 py-2.5 text-spotify-text hover:text-white hover:bg-[#1A1A1A] rounded-md transition-colors group">
              <Icon className="w-5 h-5 text-spotify-text group-hover:text-white" />
              <span className="font-medium text-[14px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-4 border-t border-[#282828]">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-spotify-green to-blue-500"></div>
          <div>
            <p className="text-sm font-medium text-white">Sneh Suman</p>
            <p className="text-xs text-spotify-text">Product Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}
