import { Radio, Bell, User, ChevronDown, Zap, Search, Settings, LogOut, Shield, X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
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
    <header className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center px-4 border-b border-gray-600/50 bg-gray-900/80 backdrop-blur-lg hover:border-gray-600/70 transition-colors duration-200">
      {/* Logo */}
      <div
        className="flex items-center gap-2 mr-8 cursor-pointer hover-lift transition-transform duration-200"
        onClick={() => onNavigate('dashboard')}
      >
        <div className="w-8 h-8 rounded flex items-center justify-center glass-dark border border-gray-600/40">
          <Zap size={16} className="text-cyan-400" />
        </div>
        <span className="font-semibold text-white text-sm tracking-tight font-display">IncidentMind</span>
      </div>

      {/* Nav */}
      <nav className="flex items-center gap-2 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500 ${currentPage === item.id
              ? 'bg-cyan-600/20 text-cyan-400 border-b-2 border-cyan-500/50 hover:bg-cyan-600/30'
              : 'text-gray-300 hover:text-white hover:bg-gray-800/50'}`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Search bar (optional) */}
      {showSearch && (
        <div className="relative mx-6">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder={searchPlaceholder ?? 'Search...'}
            className="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-600 bg-gray-800/50 placeholder-gray-400 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 transition-colors duration-200 hover:bg-gray-800/70"
          />
        </div>
      )}

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Live indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg glass-dark border border-gray-600/30 hover:border-gray-600/50 transition-colors duration-200 hover-lift">
          <Radio size={12} className="text-cyan-400" />
          <span className="text-xs font-mono text-cyan-400 tracking-widest">LIVE</span>
        </div>

        {/* Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setShowNotifs(v => !v); setShowUser(false); }}
            className="relative p-2 rounded-lg hover:bg-gray-800/50 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500"
          >
            <Bell size={16} className="text-gray-300 hover:text-white" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-gray-900">
                {unread}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-full mt-4 w-80 rounded-xl border border-gray-600 bg-gray-900/90 backdrop-blur-lg shadow-xl overflow-hidden ring-1 ring-black ring-opacity-5">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-600/40">
                <div className="flex items-center gap-3">
                  <Bell size={14} className="text-cyan-400" />
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  {unread > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[9px] font-semibold">{unread} new</span>
                  )}
                </div>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors duration-200">Mark all read</button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-gray-600/30">
                {notifList.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-400 text-sm">No notifications</div>
                ) : notifList.map(n => (
                  <div key={n.id} className={`flex items-start gap-4 px-4 py-3 transition-colors duration-200 hover:bg-gray-800/30 ${!n.read ? 'bg-cyan-600/5' : ''}`}>
                    <div className="flex-shrink-0 mt-0.5">{notifIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium truncate ${n.read ? 'text-gray-300' : 'text-white'}`}>{n.title}</span>
                        {!n.read && <span className="h-2 w-2 rounded-full bg-cyan-400" />}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 truncate">{n.desc}</div>
                      <div className="text-xs text-gray-500 mt-1 font-mono">{n.time}</div>
                    </div>
                    <button onClick={() => dismiss(n.id)} className="text-gray-400 hover:text-gray-200 transition-colors duration-200 shrink-0">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-gray-600/20 bg-gray-900/50">
                <button className="w-full text-center text-xs text-cyan-400 hover:text-cyan-300 transition-colors duration-200">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => { setShowUser(v => !v); setShowNotifs(false); }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-600/30 bg-gray-800/50 hover:border-gray-600/50 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500 hover-lift"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
              <User size={16} className="text-cyan-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white font-display">OPERATOR_04</span>
              <span className="text-xs text-gray-400">j.vane@incidentmind.io</span>
            </div>
            <ChevronDown size={12} className={`text-gray-400 transition-transform duration-200 ${showUser ? 'rotate-180' : ''}`} />
          </button>

          {showUser && (
            <div className="absolute right-0 top-full mt-4 w-72 rounded-xl border border-gray-600 bg-gray-900/90 backdrop-blur-lg shadow-xl overflow-hidden ring-1 ring-black ring-opacity-5 z-50">
              <div className="px-4 py-4 border-b border-gray-600/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center">
                    <User size={20} className="text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-white">Julian Vane</div>
                    <div className="text-sm text-gray-400 font-mono">j.vane@incidentmind.io</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <span className="px-3 py-1 rounded bg-cyan-600/20 border border-cyan-600/30 text-cyan-400 text-xs font-semibold">ENTERPRISE</span>
                  <span className="text-sm text-gray-400 font-mono">OPERATOR_04</span>
                </div>
              </div>
              <div className="px-4 py-3 space-y-2">
                <button
                  onClick={() => { onNavigate('settings'); setShowUser(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left text-sm font-medium transition-colors duration-200 hover:bg-gray-800/50 hover:text-white"
                >
                  <Settings size={16} className="text-gray-300 hover:text-white" />
                  Account Settings
                </button>
                <button
                  onClick={() => { onNavigate('settings'); setShowUser(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left text-sm font-medium transition-colors duration-200 hover:bg-gray-800/50 hover:text-white"
                >
                  <Shield size={16} className="text-gray-300 hover:text-white" />
                  Security
                </button>
              </div>
              <div className="px-4 py-3 border-t border-gray-600/20">
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left text-sm font-medium text-red-400 hover:text-red-300 bg-red-600/20 hover:bg-red-600/30 transition-colors duration-200"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}