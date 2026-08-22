import { Radio, Bell, User, ChevronDown, Zap, Search, Settings, LogOut, Shield, X, AlertTriangle, CheckCircle, Info, Command } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

type Page = 'dashboard' | 'incidents' | 'history' | 'reports' | 'analytics' | 'settings';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
}

const navItems: { id: Page; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'incidents', label: 'Incidents' },
  { id: 'history', label: 'History' },
  { id: 'reports', label: 'Reports' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'Settings' },
];

const notifications = [
  { id: 1, type: 'critical', title: 'CPU spike detected', desc: 'auth-service exceeded 94% threshold', time: '2m ago', read: false },
  { id: 2, type: 'resolved', title: 'Incident INC-2024-003 resolved', desc: 'Memory leak patched by autonomous agent', time: '18m ago', read: false },
  { id: 3, type: 'info', title: 'Weekly report ready', desc: 'June intelligence summary is available', time: '1h ago', read: true },
  { id: 4, type: 'warning', title: 'DB pool at 87% capacity', desc: 'postgres-primary approaching limit', time: '3h ago', read: true },
];

function useOutsideClick(ref: React.RefObject<HTMLElement | null>, callback: () => void) {
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) callback();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [ref, callback]);
}

export default function Header({ currentPage, onNavigate, showSearch, searchPlaceholder }: HeaderProps) {
  const [searchVal, setSearchVal] = useState('');
  const [showUser, setShowUser] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifList, setNotifList] = useState(notifications);

  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useOutsideClick(userRef, () => setShowUser(false));
  useOutsideClick(notifRef, () => setShowNotifs(false));

  const unread = notifList.filter(n => !n.read).length;
  const markAllRead = () => setNotifList(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id: number) => setNotifList(prev => prev.filter(n => n.id !== id));

  const notifIcon = (type: string) => {
    if (type === 'critical') return <AlertTriangle size={12} className="text-red-400" />;
    if (type === 'resolved') return <CheckCircle size={12} className="text-green-400" />;
    if (type === 'warning') return <AlertTriangle size={12} className="text-amber-400" />;
    return <Info size={12} className="text-blue-400" />;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-5 border-b border-[#1e2d4d] bg-[#05081a]/90 backdrop-blur-xl shadow-lg shadow-black/10">
      {/* Brand */}
      <div
        className="flex items-center gap-2.5 mr-7 cursor-pointer shrink-0 group"
        onClick={() => onNavigate('dashboard')}
      >
        <div className="relative w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-500/10 border border-cyan-400/30 group-hover:border-cyan-400/60 group-hover:bg-cyan-400/15 transition-all">
          <Zap size={15} className="text-cyan-400" />
          <span className="absolute -right-0.5 -bottom-0.5 w-2 h-2 rounded-full bg-green-400 border-2 border-[#05081a] live-dot" />
        </div>
        <div className="leading-none">
          <div className="font-semibold text-white text-sm tracking-tight">IncidentMind</div>
          <div className="text-[8px] text-slate-600 font-mono tracking-[0.18em] mt-1">AI OPERATIONS</div>
        </div>
      </div>

      {/* Primary navigation */}
      <nav className="flex items-center gap-1 flex-1 min-w-0">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`px-3 py-2 text-[11px] font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${
              currentPage === item.id
                ? 'text-cyan-300 bg-cyan-400/10 border border-cyan-400/20 shadow-sm shadow-cyan-500/5'
                : 'text-slate-400 border border-transparent hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Optional search */}
      {showSearch && (
        <div className="relative mx-3 hidden md:block">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder={searchPlaceholder ?? 'Search...'}
            className="pl-7 pr-3 py-2 rounded-lg bg-[#0c1228]/90 border border-[#1e2d4d] text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 w-48 transition-all"
          />
        </div>
      )}

      {/* Right controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* System status */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-green-500/5 border border-green-500/15">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 live-dot" />
          <span className="text-[9px] font-semibold tracking-wider text-green-400">SYSTEM OPERATIONAL</span>
        </div>

        {/* Live stream */}
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#0c1228] border border-[#1e2d4d]" title="Real-time event stream">
          <Radio size={10} className="text-cyan-400" />
          <span className="text-[9px] font-mono text-cyan-400 tracking-widest">LIVE</span>
        </div>

        {/* Bell */}
        <div ref={notifRef} className="relative">
          <button
            aria-label="Open notifications"
            onClick={() => { setShowNotifs(v => !v); setShowUser(false); }}
            className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Bell size={15} className="text-slate-400" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center ring-2 ring-[#05081a]">
                {unread}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-[#1e2d4d] bg-[#080d1f] shadow-2xl shadow-black/40 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2d4d]">
                <div className="flex items-center gap-2">
                  <Bell size={12} className="text-cyan-400" />
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  {unread > 0 && <span className="px-1.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-400 text-[9px] font-semibold">{unread} new</span>}
                </div>
                {unread > 0 && <button onClick={markAllRead} className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors">Mark all read</button>}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#1e2d4d]">
                {notifList.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-500 text-[11px]">No notifications</div>
                ) : notifList.map(n => (
                  <div key={n.id} className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/5 ${!n.read ? 'bg-cyan-500/3' : ''}`}>
                    <div className="mt-0.5 shrink-0">{notifIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] font-medium truncate ${n.read ? 'text-slate-400' : 'text-white'}`}>{n.title}</span>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">{n.desc}</div>
                      <div className="text-[9px] text-slate-600 mt-0.5 font-mono">{n.time}</div>
                    </div>
                    <button aria-label="Dismiss notification" onClick={() => dismiss(n.id)} className="text-slate-700 hover:text-slate-400 transition-colors shrink-0"><X size={11} /></button>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-[#1e2d4d] bg-[#05081a]">
                <button className="w-full text-center text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div ref={userRef} className="relative">
          <button
            aria-label="Open operator menu"
            onClick={() => { setShowUser(v => !v); setShowNotifs(false); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-[#1e2d4d] bg-[#0c1228] hover:border-cyan-500/30 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
              <User size={11} className="text-cyan-400" />
            </div>
            <span className="text-[10px] text-slate-300 font-mono hidden xl:inline">OPERATOR_04</span>
            <ChevronDown size={10} className={`text-slate-500 transition-transform ${showUser ? 'rotate-180' : ''}`} />
          </button>

          {showUser && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[#1e2d4d] bg-[#080d1f] shadow-2xl shadow-black/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1e2d4d]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center"><User size={14} className="text-cyan-400" /></div>
                  <div><div className="text-[11px] font-semibold text-white">Julian Vane</div><div className="text-[9px] text-slate-500 font-mono">j.vane@incidentmind.io</div></div>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-semibold">ENTERPRISE</span>
                  <span className="text-[9px] text-slate-600 font-mono">OPERATOR_04</span>
                </div>
              </div>
              <div className="p-1.5 space-y-0.5">
                <button onClick={() => { onNavigate('settings'); setShowUser(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[11px] text-slate-400 hover:text-white hover:bg-white/5 transition-colors"><Settings size={12} className="text-slate-500" />Account Settings</button>
                <button onClick={() => { onNavigate('settings'); setShowUser(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[11px] text-slate-400 hover:text-white hover:bg-white/5 transition-colors"><Shield size={12} className="text-slate-500" />Security</button>
              </div>
              <div className="p-1.5 border-t border-[#1e2d4d]">
                <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"><LogOut size={12} />Sign Out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
