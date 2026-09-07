import {
  LayoutDashboard, Shield, Search, Zap, FileText, Settings, Target
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export type SidebarNav = 'overview' | 'insights' | 'forensics' | 'automations' | 'logs' | 'preferences' | 'attention';

interface OperatorSidebarProps {
  activeNav: SidebarNav;
  onNavChange: (nav: SidebarNav) => void;
  onDeployAgent?: () => void;
}

const sidebarItems: {
  id: SidebarNav;
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
  badge?: string;
}[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'insights', label: 'Deep Insights', icon: Shield },
  { id: 'forensics', label: 'Forensics', icon: Search },
  { id: 'automations', label: 'Automations', icon: Zap },
  { id: 'logs', label: 'Logs', icon: FileText },
  { id: 'preferences', label: 'Preferences', icon: Settings },
  { id: 'attention', label: 'Attention Savings', icon: Target },
];

export default function OperatorSidebar({ activeNav, onNavChange, onDeployAgent }: OperatorSidebarProps) {
  return (
    <aside className="w-64 shrink-0 flex flex-col bg-gray-900/90 backdrop-blur-lg border-r border-gray-600/40">
      {/* Op badge */}
      <div className="px-4 py-3 border-b border-gray-600/20">
        <div className="flex items-center gap-3 p-3 rounded-lg glass-dark border border-gray-600/30">
          <div className="w-10 h-10 rounded flex items-center justify-center glass-dark border border-cyan-500/40">
            <Shield size={18} className="text-cyan-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">OP-CENTRAL</div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 live-dot" />
              <span className="text-xs text-green-400 font-mono">Vigilance Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-2">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-left rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500 hover-lift ${activeNav === item.id
              ? 'bg-cyan-600/20 text-cyan-400 border-l-2 border-cyan-500/50'
              : 'text-gray-300 hover:text-white hover:bg-gray-800/30'}`}
          >
            <item.icon size={16} className={activeNav === item.id ? 'text-cyan-400' : 'text-gray-400 hover:text-white'} />
            <span className="text-base font-medium">{item.label}</span>
            {item.badge && (
              <span className="ml-auto px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-mono">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Deploy */}
      <div className="px-4 py-4 border-t border-gray-600/20">
        <button
          onClick={onDeployAgent}
          className="w-full flex items-center justify-center gap-3 px-4 py-2 text-sm font-medium rounded-lg border border-transparent bg-cyan-600 text-white hover:bg-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500 transition-colors duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Zap size={16} className="ml-2" />
          DEPLOY AGENT
        </button>
      </div>
    </aside>
  );
}