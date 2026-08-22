import { useState, useEffect } from 'react';
import {
  Play, Activity, Radio, Zap, Shield, Eye, Search,
  Wrench, MessageSquare, ArrowRight, Server, Database,
  Lock, ChevronRight, BarChart2, CheckCircle, AlertTriangle
} from 'lucide-react';
import { SCENARIOS } from '../data/scenarios';
import type { IncidentScenario } from '../types/incident';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? 'http://localhost:3001';

type Page = 'dashboard' | 'incidents' | 'history' | 'reports' | 'analytics' | 'settings';

interface DashboardProps {
  onNavigate: (page: Page, scenarioId?: string) => void;
}

interface RecentIncident {
  incidentId: string;
  title: string;
  severity: string;
  status: string;
  service: string;
  triggeredAt: string;
  mttrSeconds?: number;
}

const AGENT_CHAIN = [
  { name: 'Orchestrator', icon: Shield, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', role: 'Controller' },
  { name: 'Watcher',      icon: Eye,    color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   role: 'Sensor' },
  { name: 'Diagnoser',    icon: Search, color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  role: 'Analyst' },
  { name: 'Patcher',      icon: Wrench, color: 'text-teal-400',   bg: 'bg-teal-500/10',   border: 'border-teal-500/30',   role: 'Fixer' },
  { name: 'Communicator', icon: MessageSquare, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', role: 'Notifier' },
];

const SEVERITY_CFG = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/25', dot: 'bg-red-500' },
  high:     { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/25', dot: 'bg-amber-500' },
  medium:   { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/25', dot: 'bg-blue-500' },
};

const SCENARIO_ICONS: Record<string, React.ReactNode> = {
  'incident-001': <Server size={18} className="text-red-400" />,
  'incident-002': <Database size={18} className="text-amber-400" />,
  'incident-003': <Lock size={18} className="text-purple-400" />,
};

function CompactScenarioCard({ scenario, onLaunch }: { scenario: IncidentScenario; onLaunch: () => void }) {
  const sev = SEVERITY_CFG[scenario.severity];
  return (
    <div className="border border-[#1e2d4d] rounded-xl bg-[#0c1228] hover:border-cyan-500/25 transition-all duration-200 group flex flex-col">
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-lg bg-[#080d1f] border border-[#1e2d4d] flex items-center justify-center">
            {SCENARIO_ICONS[scenario.id]}
          </div>
          <span className={`flex items-center gap-1 text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded border ${sev.color} ${sev.bg} ${sev.border}`}>
            <span className={`w-1 h-1 rounded-full ${sev.dot}`} />
            {scenario.severity}
          </span>
        </div>
        <div className="text-[9px] font-mono text-slate-600 mb-0.5">{scenario.id.toUpperCase()}</div>
        <h3 className="text-sm font-bold text-white mb-1.5 leading-snug">{scenario.title}</h3>
        <p className="text-[10px] text-slate-500 leading-relaxed">{scenario.description}</p>
      </div>
      <div className="px-4 py-2.5 border-t border-[#1e2d4d] flex items-center justify-between">
        <div className="flex gap-1.5">
          {scenario.tags.slice(0, 2).map(t => (
            <span key={t} className="text-[8px] px-1.5 py-0.5 rounded bg-[#080d1f] border border-[#1a2540] text-slate-600 font-mono">{t}</span>
          ))}
        </div>
        <button
          onClick={onLaunch}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#05081a] text-[10px] font-bold transition-all hover:scale-105"
        >
          <Play size={9} />
          Launch
        </button>
      </div>
    </div>
  );
}

const statusColor: Record<string, string> = {
  Resolved: 'text-green-400',
  OPEN: 'text-amber-400',
  RESOLVED: 'text-green-400',
  IN_PROGRESS: 'text-blue-400',
  Active: 'text-amber-400',
  Investigating: 'text-blue-400',
};

function formatMttr(seconds?: number): string {
  if (!seconds) return '--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  }
  return `${mins}m ${secs}s`;
}

function getStatusLabel(status: string): string {
  const s = status.toUpperCase();
  if (s === 'RESOLVED') return 'Resolved';
  if (s === 'OPEN') return 'Active';
  if (s === 'IN_PROGRESS') return 'Investigating';
  return status;
}

function getSeverityLabel(severity: string): string {
  const s = severity.toLowerCase();
  if (s === 'critical') return 'critical';
  if (s === 'high') return 'high';
  if (s === 'medium') return 'medium';
  if (s === 'low') return 'low';
  return severity;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [tick, setTick] = useState(0);
  const [activeAgentIdx, setActiveAgentIdx] = useState(0);
  const [recentIncidents, setRecentIncidents] = useState<RecentIncident[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    const t1 = setInterval(() => setTick(n => n + 1), 2000);
    const t2 = setInterval(() => setActiveAgentIdx(i => (i + 1) % AGENT_CHAIN.length), 1800);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  // Fetch recent incidents from backend
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/history?page=1&limit=3`);
        if (response.ok) {
          const data = await response.json();
          setRecentIncidents(data.incidents || []);
        }
      } catch (err) {
        console.error('Failed to fetch recent incidents:', err);
      } finally {
        setLoadingRecent(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="min-h-screen bg-[#05081a] bg-grid pt-12 pb-14">
      <div className="max-w-6xl mx-auto px-6">

        {/* Hero */}
        <div className="pt-8 pb-6">
          <div className="flex items-start justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={12} className="text-cyan-400" />
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Autonomous Response Active</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 live-dot" />
              </div>
              <h1 className="text-3xl font-bold text-white leading-tight mb-2">
                Autonomous AI{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
                  Incident Response
                </span>
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xl mb-5">
                When production breaks at 3 AM, IncidentMind's agents detect it, diagnose it, draft a fix, and notify your team — before a human even wakes up.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate('incidents')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#05081a] text-xs font-bold transition-all hover:scale-105 shadow-lg shadow-cyan-500/20"
                >
                  <Zap size={12} />
                  Open War Room
                </button>
                <button
                  onClick={() => onNavigate('analytics')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-500/30 text-cyan-400 text-xs font-medium hover:bg-cyan-500/10 transition-colors"
                >
                  View Analytics
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2">
              {[
                { label: 'Uptime', val: '99.1%', color: 'text-green-400' },
                { label: 'Active', val: '3', color: 'text-amber-400' },
                { label: 'Critical', val: '1', color: 'text-red-400' },
              ].map((s, i, arr) => (
                <div key={s.label} className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.val}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</div>
                  </div>
                  {i < arr.length - 1 && <div className="w-px h-10 bg-[#1e2d4d]" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agent Chain Visualizer */}
        <div className="mb-6 border border-[#1e2d4d] rounded-xl bg-[#0c1228] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-cyan-400" />
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Agent Chain</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Sequential context passing — no shared state</span>
          </div>
          <div className="flex items-stretch gap-0">
            {AGENT_CHAIN.map((agent, i) => {
              const isActive = i === activeAgentIdx;
              const isDone = i < activeAgentIdx;
              return (
                <div key={agent.name} className="flex items-center flex-1">
                  <div className={`flex-1 rounded-xl border p-3 transition-all duration-500 ${
                    isActive ? `${agent.bg} ${agent.border} shadow-lg` :
                    isDone ? 'bg-[#080d1f] border-green-500/15' :
                    'bg-[#080d1f] border-[#1a2540]'
                  }`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 border ${
                      isActive ? `${agent.bg} ${agent.border}` :
                      isDone ? 'bg-green-500/10 border-green-500/20' :
                      'bg-[#0c1228] border-[#1e2d4d]'
                    }`}>
                      {isDone
                        ? <CheckCircle size={13} className="text-green-400" />
                        : <agent.icon size={13} className={isActive ? agent.color : 'text-slate-600'} />
                      }
                    </div>
                    <div className={`text-[11px] font-semibold mb-0.5 ${isActive ? agent.color : isDone ? 'text-slate-400' : 'text-slate-600'}`}>{agent.name}</div>
                    <div className="text-[9px] text-slate-600">{agent.role}</div>
                    {isActive && (
                      <div className="mt-1.5 h-0.5 rounded-full bg-[#1e2d4d] overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 animate-pulse" style={{ width: `${55 + (tick % 5) * 8}%` }} />
                      </div>
                    )}
                  </div>
                  {i < AGENT_CHAIN.length - 1 && (
                    <ArrowRight size={12} className={`mx-2 shrink-0 ${isDone ? 'text-cyan-500/50' : 'text-slate-700'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Two-column: Scenarios + History */}
        <div className="grid grid-cols-3 gap-5">

          {/* Scenario launcher (2/3 width) */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-cyan-400" />
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Incident Scenarios</span>
              </div>
              <button
                onClick={() => onNavigate('incidents')}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                Open War Room <ChevronRight size={10} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {SCENARIOS.map(sc => (
                <CompactScenarioCard
                  key={sc.id}
                  scenario={sc}
                  onLaunch={() => onNavigate('incidents', sc.id)}
                />
              ))}
            </div>
          </div>

          {/* Right: Recent + Status */}
          <div className="space-y-4">
            {/* Recent incidents */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Radio size={12} className="text-cyan-400" />
                  <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Recent</span>
                </div>
                <button
                  onClick={() => onNavigate('history')}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  All <ChevronRight size={10} />
                </button>
              </div>
              <div className="space-y-1.5">
                {loadingRecent ? (
                  <div className="space-y-1.5">
                    {[1,2,3].map(i => (
                      <div key={i} className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-2.5 animate-pulse">
                        <div className="h-3 w-1/4 bg-[#1e2d4d] rounded mb-1" />
                        <div className="h-4 w-3/4 bg-[#1e2d4d] rounded" />
                        <div className="flex items-center justify-between mt-1">
                          <div className="h-2 w-1/3 bg-[#1e2d4d] rounded" />
                          <div className="h-2 w-1/4 bg-[#1e2d4d] rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentIncidents.length === 0 ? (
                  <div className="text-center py-4 text-slate-500 text-sm">No recent incidents</div>
                ) : (
                  recentIncidents.map(inc => (
                    <div key={inc.incidentId} className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-2.5 hover:border-cyan-500/20 cursor-pointer transition-colors" onClick={() => onNavigate('history')}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-mono text-slate-500">#{inc.incidentId}</span>
                        <span className={`text-[9px] font-medium ${statusColor[getStatusLabel(inc.status)]}`}>{getStatusLabel(inc.status)}</span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-medium leading-snug">{inc.title}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-[8px] uppercase font-semibold ${SEVERITY_CFG[getSeverityLabel(inc.severity) as keyof typeof SEVERITY_CFG]?.color || 'text-slate-500'}`}>{getSeverityLabel(inc.severity)}</span>
                        <span className="text-[9px] font-mono text-slate-600">{formatMttr(inc.mttrSeconds)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* System status */}
            <div className="border border-[#1e2d4d] rounded-xl bg-[#0c1228] p-3">
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 size={12} className="text-cyan-400" />
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">System Status</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Agent Accuracy', val: '98.4%', color: 'from-cyan-500 to-teal-400', pct: 98 },
                  { label: 'Success Rate', val: '94.1%', color: 'from-green-500 to-teal-400', pct: 94 },
                  { label: 'Avg MTTR', val: '14m 32s', color: 'from-blue-500 to-cyan-400', pct: 75 },
                ].map(m => (
                  <div key={m.label}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-500">{m.label}</span>
                      <span className="text-slate-300 font-mono font-semibold">{m.val}</span>
                    </div>
                    <div className="h-1 rounded-full bg-[#1e2d4d] overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${m.color}`} style={{ width: `${m.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* One-line pitch */}
        <div className="mt-6 border border-cyan-500/15 rounded-xl bg-cyan-500/5 px-5 py-3.5 flex items-center gap-4">
          <AlertTriangle size={16} className="text-cyan-400 shrink-0" />
          <p className="text-sm text-slate-400 italic">
            "When your production system breaks at 3 AM, IncidentMind's agents detect it, diagnose it, draft a fix, and notify your team — before a human even wakes up."
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 h-8 flex items-center px-4 border-t border-[#1e2d4d] bg-[#05081a] z-40">
        <div className="flex items-center gap-4 text-[10px] font-mono text-slate-600 w-full">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />AGENTS ONLINE</span>
          <div className="w-px h-4 bg-[#1e2d4d]" />
          <span>5 AGENTS ACTIVE</span>
          <div className="w-px h-4 bg-[#1e2d4d]" />
          <span>SSE TRANSPORT READY</span>
          <div className="w-px h-4 bg-[#1e2d4d]" />
          <span className="text-cyan-400/60">BACKEND: {(import.meta.env.VITE_BACKEND_URL as string | undefined) ?? 'http://localhost:3001'}</span>
          <div className="flex-1" />
          <span>© 2026 IncidentMind AI Operations</span>
          <span>·</span>
          <span>Claude API Powered</span>
        </div>
      </div>
    </div>
  );
}
