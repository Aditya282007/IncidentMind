import {
  LayoutDashboard, Shield, Search, Zap, FileText, Settings, Target
} from 'lucide-react';

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
    <aside className="w-48 shrink-0 border-r border-[#1e2d4d] bg-[#080d1f] flex flex-col">
      {/* Op badge */}
      <div className="p-3 border-b border-[#1e2d4d]">
        <div className="flex items-center gap-2 p-2 rounded bg-[#0c1228] border border-[#1e2d4d]">
          <div className="w-7 h-7 rounded border border-cyan-500/40 bg-cyan-500/10 flex items-center justify-center">
            <Shield size={14} className="text-cyan-400" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-white">OP-CENTRAL</div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 live-dot" />
              <span className="text-[9px] text-green-400">Vigilance Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        {sidebarItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavChange(item.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left transition-all ${
              activeNav === item.id
                ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <item.icon size={14} className={activeNav === item.id ? 'text-cyan-400' : 'text-slate-500'} />
            <span className="text-[12px] font-medium">{item.label}</span>
            {item.badge && (
              <span className="ml-auto text-[9px] px-1 py-0.5 rounded bg-red-500/20 text-red-400 font-mono">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Deploy */}
      <div className="p-3 border-t border-[#1e2d4d]">
        <button
          onClick={onDeployAgent}
          className="w-full py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Zap size={12} />
          DEPLOY AGENT
        </button>
      </div>
    </aside>
  );
}
