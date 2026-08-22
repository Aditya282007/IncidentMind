import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, RotateCcw, X, ArrowDown, Copy, CheckCircle,
  AlertTriangle, Clock, Zap, ChevronRight, Shield,
  Eye, Search, Wrench, MessageSquare, Activity,
  Server, Database, Lock, Radio, ExternalLink,
  BookOpen, FileText, Terminal, ArrowUpRight,
  BarChart2, Link2, Target
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

import type {
  IncidentScenario, AgentName, AgentState,
  WatcherResult, DiagnoserResult, PatcherResult, CommunicatorResult,
  AgentResult, SSEEvent
} from '../types/incident';
import { SCENARIOS } from '../data/scenarios';

type Page = 'dashboard' | 'incidents' | 'history' | 'reports' | 'analytics' | 'settings' | 'incident-detail';
type UIPhase = 'selecting' | 'connecting' | 'running' | 'complete';

interface ActiveIncidentProps {
  onNavigate: (page: Page) => void;
  initialScenarioId?: string;
}

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? 'http://localhost:3001';

const AGENT_ORDER: AgentName[] = ['Orchestrator', 'Watcher', 'Diagnoser', 'AttentionRouter', 'Patcher', 'Communicator'];

const AGENT_META: Record<AgentName, {
  icon: React.FC<{ size?: number; className?: string }>;
  color: string;
  border: string;
  bg: string;
  glow: string;
  role: string;
  description: string;
}> = {
  Orchestrator: {
    icon: Shield,
    color: 'text-purple-400',
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/10',
    glow: 'shadow-purple-500/20',
    role: 'Controller',
    description: 'Receives trigger, sequences agents, maintains incident context',
  },
  Watcher: {
    icon: Eye,
    color: 'text-blue-400',
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/10',
    glow: 'shadow-blue-500/20',
    role: 'Sensor',
    description: 'Polls metrics/logs, detects anomalies, fires alert',
  },
  Diagnoser: {
    icon: Search,
    color: 'text-amber-400',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
    glow: 'shadow-amber-500/20',
    role: 'Analyst',
    description: 'Gets anomaly context, finds root cause via LLM',
  },
  AttentionRouter: {
    icon: Target,
    color: 'text-cyan-400',
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-500/10',
    glow: 'shadow-cyan-500/20',
    role: 'Router',
    description: 'Scores incident, routes to AUTO/WATCH/ESCALATE',
  },
  Patcher: {
    icon: Wrench,
    color: 'text-teal-400',
    border: 'border-teal-500/40',
    bg: 'bg-teal-500/10',
    glow: 'shadow-teal-500/20',
    role: 'Fixer',
    description: 'Takes diagnosis, generates fix commands or patch',
  },
  Communicator: {
    icon: MessageSquare,
    color: 'text-orange-400',
    border: 'border-orange-500/40',
    bg: 'bg-orange-500/10',
    glow: 'shadow-orange-500/20',
    role: 'Notifier',
    description: 'Drafts Slack message, incident report, runbook entry',
  },
};

const SEVERITY_CFG = {
  critical: { label: 'CRITICAL', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/25', dot: 'bg-red-500' },
  high:     { label: 'HIGH',     color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/25', dot: 'bg-amber-500' },
  medium:   { label: 'MEDIUM',   color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/25', dot: 'bg-blue-500' },
};

function copyToClipboard(text: string) {
  navigator.clipboard?.writeText(text).catch(() => {});
}

function RiskBadge({ level }: { level: string }) {
  const cfg = level === 'low'
    ? { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/25' }
    : level === 'medium'
    ? { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/25' }
    : { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/25' };
  return (
    <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      {level} risk
    </span>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 90 ? 'from-green-500 to-teal-400' : pct >= 70 ? 'from-amber-500 to-yellow-400' : 'from-red-500 to-orange-400';
  return (
    <div>
      <div className="flex justify-between text-[9px] mb-1">
        <span className="text-slate-500 uppercase tracking-wider">Confidence</span>
        <span className="text-slate-300 font-mono font-semibold">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#1e2d4d] overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CommandBlock({ commands }: { commands: string[] }) {
  const [copied, setCopied] = useState(false);
  const all = commands.join('\n');
  const handleCopy = () => {
    copyToClipboard(all);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="relative rounded-lg bg-[#03060f] border border-[#1e2d4d] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1e2d4d]">
        <span className="text-[9px] text-slate-600 font-mono uppercase tracking-wider">bash</span>
        <button onClick={handleCopy} className="flex items-center gap-1 text-[9px] text-slate-500 hover:text-cyan-400 transition-colors">
          {copied ? <CheckCircle size={10} className="text-green-400" /> : <Copy size={10} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="p-3 space-y-1">
        {commands.map((cmd, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-slate-600 font-mono text-[10px] shrink-0 mt-0.5">$</span>
            <code className="text-[10px] font-mono text-green-400 break-all leading-relaxed">{cmd}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlackPreview({ message }: { message: string }) {
  const formatted = message
    .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-[#1e2d4d] px-1 rounded text-[10px] font-mono text-cyan-300">$1</code>')
    .replace(/\n/g, '<br/>');
  return (
    <div className="rounded-lg bg-[#1a1d21] border border-[#2d3748] p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-4 h-4 rounded-sm bg-[#611f69] flex items-center justify-center">
          <span className="text-white text-[8px] font-bold">#</span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Slack #incidents</span>
        <span className="ml-auto text-[9px] text-slate-600">just now</span>
      </div>
      <div
        className="text-[11px] text-slate-300 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    </div>
  );
}

interface RetrievedContext {
  pastIncidents?: Array<{ content: string; metadata: Record<string, any> }>;
  runbooks?: Array<{ content: string; metadata: Record<string, any> }>;
  patchCommands?: Array<{ content: string; metadata: Record<string, any> }>;
}

function ContextRetrievedPanel({ context, agent }: { context?: RetrievedContext; agent: string }) {
  if (!context || (!context.pastIncidents?.length && !context.runbooks?.length && !context.patchCommands?.length)) {
    return null;
  }

  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/15 transition-colors"
      >
        <BookOpen size={12} className="text-amber-400" />
        <span className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider">Context Retrieved</span>
        <span className="ml-auto text-[9px] text-slate-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          RAG
        </span>
        <ChevronRight size={10} className={`text-slate-500 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-amber-500/15 pt-2">
          {context.pastIncidents && context.pastIncidents.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[9px] font-medium text-amber-400 uppercase tracking-wider">
                <FileText size={9} />
                Past Incidents ({context.pastIncidents.length})
              </div>
              {context.pastIncidents.map((item, idx) => (
                <div key={idx} className="ml-2 rounded bg-[#080d1f] border border-[#1e2d4d] p-2">
                  <div className="flex items-center gap-1.5 text-[9px] mb-1">
                    <span className="text-slate-500 font-mono">#{idx + 1}</span>
                    <span className="text-slate-400 font-mono">{item.metadata?.filename || 'unknown'}</span>
                    <span className="ml-auto text-slate-600">{item.metadata?.category || ''}</span>
                  </div>
                  <p className="text-[10px] text-slate-300 line-clamp-2">{item.content.slice(0, 200)}</p>
                </div>
              ))}
            </div>
          )}

          {context.runbooks && context.runbooks.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[9px] font-medium text-teal-400 uppercase tracking-wider">
                <BookOpen size={9} />
                Runbooks ({context.runbooks.length})
              </div>
              {context.runbooks.map((item, idx) => (
                <div key={idx} className="ml-2 rounded bg-[#080d1f] border border-[#1e2d4d] p-2">
                  <div className="flex items-center gap-1.5 text-[9px] mb-1">
                    <span className="text-slate-500 font-mono">#{idx + 1}</span>
                    <span className="text-slate-400 font-mono">{item.metadata?.filename || 'unknown'}</span>
                  </div>
                  <p className="text-[10px] text-slate-300 line-clamp-2">{item.content.slice(0, 200)}</p>
                </div>
              ))}
            </div>
          )}

          {context.patchCommands && context.patchCommands.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[9px] font-medium text-green-400 uppercase tracking-wider">
                <Terminal size={9} />
                Patch Commands ({context.patchCommands.length})
              </div>
              {context.patchCommands.map((item, idx) => (
                <div key={idx} className="ml-2 rounded bg-[#080d1f] border border-[#1e2d4d] p-2">
                  <div className="flex items-center gap-1.5 text-[9px] mb-1">
                    <span className="text-slate-500 font-mono">#{idx + 1}</span>
                    <span className="text-slate-400 font-mono">{item.metadata?.filename || 'unknown'}</span>
                  </div>
                  <p className="text-[10px] font-mono text-green-300 line-clamp-2">{item.content.slice(0, 200)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Metrics Chart Component - Live CPU + Error Rate Sparklines
interface MetricsDataPoint {
  time: string;
  cpu: number;
  errorRate: number;
}

function MetricsChart({ scenario, uiPhase, elapsedTotal }: { scenario: IncidentScenario | null; uiPhase: UIPhase; elapsedTotal: number }) {
  const [data, setData] = useState<MetricsDataPoint[]>([]);
  const [anomalyTriggered, setAnomalyTriggered] = useState(false);
  const triggerTimeRef = useRef<number | null>(null);

  // Generate baseline data
  useEffect(() => {
    if (!scenario) return;
    
    const baseline: MetricsDataPoint[] = [];
    const now = Date.now();
    for (let i = 29; i >= 0; i--) {
      const time = new Date(now - i * 2000);
      baseline.push({
        time: time.toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
        cpu: Math.max(5, Math.min(95, scenario.metrics.cpu + (Math.random() - 0.5) * 10)),
        errorRate: Math.max(0, Math.min(20, scenario.metrics.errorRate + (Math.random() - 0.5) * 2))
      });
    }
    setData(baseline);
    setAnomalyTriggered(false);
    triggerTimeRef.current = null;
  }, [scenario]);

  // Simulate live metric ticks via SSE (every 2 seconds)
  useEffect(() => {
    if (uiPhase !== 'running' || !scenario) return;
    
    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev];
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
        
        // Check if anomaly should trigger (at ~4 seconds elapsed)
        if (!anomalyTriggered && elapsedTotal >= 4) {
          setAnomalyTriggered(true);
          triggerTimeRef.current = Date.now();
        }
        
        // Generate new data point
        let cpu, errorRate;
        if (anomalyTriggered) {
          // Spike phase: CPU jumps to 94%, error rate to 8.2%
          const spikeProgress = Math.min(1, (Date.now() - (triggerTimeRef.current || Date.now())) / 3000);
          cpu = scenario.metrics.cpu * (1 - spikeProgress) + 94 * spikeProgress + (Math.random() - 0.5) * 3;
          errorRate = scenario.metrics.errorRate * (1 - spikeProgress) + 8.2 * spikeProgress + (Math.random() - 0.5) * 0.5;
        } else {
          // Baseline with small variance
          cpu = Math.max(10, Math.min(60, scenario.metrics.cpu * 0.5 + (Math.random() - 0.5) * 8));
          errorRate = Math.max(0, Math.min(5, scenario.metrics.errorRate * 0.3 + (Math.random() - 0.5) * 0.5));
        }
        
        // Resolution phase: return to baseline after incident complete
        if (uiPhase === 'complete') {
          const resolveProgress = Math.min(1, elapsedTotal / 10);
          cpu = 94 * (1 - resolveProgress) + scenario.metrics.cpu * 0.5 * resolveProgress + (Math.random() - 0.5) * 5;
          errorRate = 8.2 * (1 - resolveProgress) + scenario.metrics.errorRate * 0.3 * resolveProgress + (Math.random() - 0.5) * 0.3;
        }
        
        newData.push({ time: timeStr, cpu: Math.max(0, Math.min(100, cpu)), errorRate: Math.max(0, Math.min(20, errorRate)) });
        if (newData.length > 30) newData.shift();
        return newData;
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [uiPhase, elapsedTotal, scenario, anomalyTriggered]);

  if (!scenario || data.length === 0) return null;

  const isSpike = anomalyTriggered;
  const isResolving = uiPhase === 'complete';

  return (
    <div className="rounded-xl border border-[#1e2d4d] bg-[#0c1228] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart2 size={14} className="text-cyan-400" />
          <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Live Metrics</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isSpike ? 'bg-red-400 animate-pulse' : isResolving ? 'bg-green-400' : 'bg-cyan-400'}`} />
          <span className={`text-[9px] font-mono ${isSpike ? 'text-red-400' : isResolving ? 'text-green-400' : 'text-cyan-400'}`}>
            {isSpike ? 'SPIKE' : isResolving ? 'RESOLVING' : 'LIVE'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span>CPU: <span className="font-mono text-red-300">{data[data.length - 1]?.cpu.toFixed(1) || '0'}%</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Errors: <span className="font-mono text-amber-300">{data[data.length - 1]?.errorRate.toFixed(1) || '0'}%</span></span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4d" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#64748b" 
            fontSize={8} 
            tick={{ fill: '#64748b' }}
            interval="preserveStartEnd"
            tickCount={5}
          />
          <YAxis 
            yAxisId="left"
            domain={[0, 100]}
            stroke="#64748b" 
            fontSize={8} 
            tick={{ fill: '#64748b' }}
            tickCount={4}
            orientation="left"
          />
          <YAxis 
            yAxisId="right"
            domain={[0, 20]}
            stroke="#64748b" 
            fontSize={8} 
            tick={{ fill: '#64748b' }}
            tickCount={4}
            orientation="right"
            hide={true}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0c1228', 
              border: '1px solid #1e2d4d',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
            labelStyle={{ color: '#e8e6de', fontSize: '9px', fontFamily: 'monospace' }}
            itemStyle={{ fontSize: '9px', fontFamily: 'monospace' }}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="cpu"
            stroke="#ef4444"
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#cpuGradient)"
            isAnimationActive={!isResolving}
            animationDuration={300}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="errorRate"
            stroke="#f59e0b"
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#errorGradient)"
            isAnimationActive={!isResolving}
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function WatcherCard({ result }: { result: WatcherResult }) {
  return (
    <div className="space-y-3">
      <ConfidenceBar value={result.confidence} />
      <div>
        <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Anomaly Description</div>
        <p className="text-[11px] text-slate-300 leading-relaxed">{result.description}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5">Severity</div>
          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
            result.severity === 'critical' ? 'text-red-400 bg-red-500/10 border-red-500/25' : 'text-amber-400 bg-amber-500/10 border-amber-500/25'
          }`}>{result.severity}</span>
        </div>
        <div>
          <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5">Anomaly Detected</div>
          <div className="flex items-center gap-1.5">
            <CheckCircle size={12} className="text-green-400" />
            <span className="text-[11px] text-green-400 font-medium">Confirmed</span>
          </div>
        </div>
      </div>
      <div>
        <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5">Affected Components</div>
        <div className="flex flex-wrap gap-1.5">
          {result.affectedComponents.map(c => (
            <span key={c} className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiagnoserCard({ result }: { result: DiagnoserResult }) {
  return (
    <div className="space-y-3">
      <ConfidenceBar value={result.confidence} />
      <div className="rounded-lg bg-amber-500/5 border border-amber-500/15 p-3">
        <div className="text-[9px] text-amber-400/70 uppercase tracking-wider mb-1">Root Cause</div>
        <p className="text-[11px] text-amber-300 leading-relaxed font-medium">{result.rootCause}</p>
      </div>
      <div>
        <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5">Contributing Factors</div>
        <ul className="space-y-1">
          {result.contributingFactors.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-[10px] text-slate-400">
              <span className="text-amber-500 mt-0.5 shrink-0">›</span>
              {f}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Likely Impact</div>
        <p className="text-[10px] text-slate-400 leading-relaxed">{result.likelyImpact}</p>
      </div>
    </div>
  );
}

function PatcherCard({ result }: { result: PatcherResult }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <RiskBadge level={result.riskLevel} />
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono">{result.fixType}</span>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-slate-400">
          <Clock size={10} />
          {result.estimatedTime}
        </span>
      </div>
      <div>
        <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Recommended Fix</div>
        <p className="text-[11px] text-slate-300 leading-relaxed">{result.recommendedFix}</p>
      </div>
      <div>
        <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5">Commands</div>
        <CommandBlock commands={result.commands} />
      </div>
      <div className="rounded bg-[#080d1f] border border-[#1e2d4d] p-2.5">
        <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Rollback Plan</div>
        <p className="text-[10px] text-slate-400 leading-relaxed">{result.rollbackPlan}</p>
      </div>
    </div>
  );
}

function CommunicatorCard({ result, notificationRouting }: { result: CommunicatorResult; notificationRouting?: any }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded border ${
          result.priority === 'critical' ? 'text-red-400 bg-red-500/10 border-red-500/25' : 'text-amber-400 bg-amber-500/10 border-amber-500/25'
        }`}>{result.priority}</span>
        <div className="flex items-center gap-1.5 ml-auto">
          {result.notificationChannels.map(ch => (
            <span key={ch} className="text-[9px] text-slate-500 px-1.5 py-0.5 rounded bg-[#0c1228] border border-[#1e2d4d] font-mono">{ch}</span>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5">Slack Preview</div>
        <SlackPreview message={result.slackMessage} />
      </div>
      {notificationRouting && (
        <NotificationRoutingCard routing={notificationRouting} />
      )}
    </div>
  );
}

function NotificationRoutingCard({ routing }: { routing: { channelsSent: string[]; channelsSuppressed: string[]; suppressedReason: string | null } }) {
  const allChannels = ['slack', 'pagerduty', 'github', 'email'];
  return (
    <div className="rounded-lg bg-amber-500/5 border border-amber-500/15 p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[9px] text-amber-400/70 uppercase tracking-wider">Notification Routing</span>
        {routing.suppressedReason && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/25 text-amber-400">
            {routing.suppressedReason.replace('_', ' ').toUpperCase()}
          </span>
        )}
      </div>
      <div className="space-y-1">
        {allChannels.map(ch => {
          const sent = routing.channelsSent.includes(ch);
          const suppressed = routing.channelsSuppressed.includes(ch);
          const label = ch.charAt(0).toUpperCase() + ch.slice(1);
          return (
            <div key={ch} className="flex items-center justify-between text-[10px]">
              <span className={`flex items-center gap-1.5 ${sent ? 'text-green-400' : suppressed ? 'text-red-400' : 'text-slate-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sent ? 'bg-green-400' : suppressed ? 'bg-red-400' : 'bg-slate-600'}`} />
                {label}
              </span>
              <span className={`text-[9px] font-mono ${sent ? 'text-green-400' : 'text-red-400'}`}>
                {sent ? 'Sent' : 'Suppressed'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AttentionRouterCard({ result }: { result: any }) {
  const level = result?.attentionLevel || 'AUTO';
  const score = result?.attentionScore || 0;
  const reason = result?.attentionReason || '';
  
  const levelConfig = level === 'ESCALATE' 
    ? { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/25', dot: 'bg-red-500' }
    : level === 'WATCH'
    ? { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/25', dot: 'bg-amber-500' }
    : { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/25', dot: 'bg-green-500' };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${levelConfig.color} ${levelConfig.bg} ${levelConfig.border}`}>
          <span className={`w-2 h-2 rounded-full ${levelConfig.dot}`} />
          <span className="text-xs font-bold">{level}</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[9px] text-slate-500">Score</span>
          <span className={`text-sm font-bold font-mono ${levelConfig.color}`}>{score}</span>
        </div>
      </div>
      <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/15 p-3">
        <div className="text-[9px] text-cyan-400/70 uppercase tracking-wider mb-1">Routing Reason</div>
        <p className="text-[11px] text-slate-300 leading-relaxed font-mono">{reason}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded bg-[#080d1f] border border-[#1e2d4d] p-2">
          <div className="text-[9px] text-slate-500 uppercase tracking-wider">Slack</div>
          <div className={`text-[11px] font-bold ${level === 'AUTO' ? 'text-slate-500' : 'text-cyan-400'}`}>
            {level === 'AUTO' ? 'Suppressed' : 'Sent'}
          </div>
        </div>
        <div className="rounded bg-[#080d1f] border border-[#1e2d4d] p-2">
          <div className="text-[9px] text-slate-500 uppercase tracking-wider">PagerDuty</div>
          <div className={`text-[11px] font-bold ${level === 'ESCALATE' ? 'text-red-400' : 'text-slate-500'}`}>
            {level === 'ESCALATE' ? 'Sent' : 'Suppressed'}
          </div>
        </div>
        <div className="rounded bg-[#080d1f] border border-[#1e2d4d] p-2">
          <div className="text-[9px] text-slate-500 uppercase tracking-wider">GitHub PR</div>
          <div className={`text-[11px] font-bold ${level !== 'AUTO' ? 'text-teal-400' : 'text-slate-500'}`}>
            {level !== 'AUTO' ? 'Created' : 'Suppressed'}
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentResultCard({
  agent,
  state,
  isLatest,
  notificationRouting,
}: {
  agent: AgentName;
  state: AgentState;
  isLatest: boolean;
  notificationRouting?: { channelsSent: string[]; channelsSuppressed: string[]; suppressedReason: string | null };
}) {
  const meta = AGENT_META[agent];
  const [expanded, setExpanded] = useState(true);

  if (state.status === 'idle') return null;

  const elapsed = state.completedAt && state.startedAt
    ? ((state.completedAt - state.startedAt) / 1000).toFixed(1)
    : null;

  return (
    <div className={`rounded-xl border transition-all duration-500 overflow-hidden ${
      state.status === 'active'
        ? `${meta.border} ${meta.bg} shadow-lg ${meta.glow}`
        : 'border-[#1e2d4d] bg-[#0c1228]'
    } ${isLatest && state.status === 'active' ? 'ring-1 ring-offset-1 ring-offset-[#05081a]' : ''}`}
    style={isLatest && state.status === 'active' ? { ringColor: 'rgba(255,255,255,0.05)' } : undefined}
    >
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
          state.status === 'active' ? `${meta.bg} ${meta.border}` :
          state.status === 'complete' ? 'bg-green-500/10 border-green-500/25' : 'bg-[#0f1629] border-[#1e2d4d]'
        }`}>
          {state.status === 'complete'
            ? <CheckCircle size={15} className="text-green-400" />
            : <meta.icon size={14} className={state.status === 'active' ? meta.color : 'text-slate-500'} />
          }
        </div>
        <div className="flex-1 text-left">
          <div className={`text-xs font-semibold ${state.status === 'active' ? meta.color : state.status === 'complete' ? 'text-white' : 'text-slate-500'}`}>
            {agent}
          </div>
          <div className="text-[9px] text-slate-500">{meta.role}</div>
        </div>
        <div className="flex items-center gap-2">
          {state.status === 'active' && (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ backgroundColor: meta.color.replace('text-', '') === 'text-' ? '#22d3ee' : '#22d3ee' }} />
              <span className={`text-[9px] font-mono ${meta.color}`}>ACTIVE</span>
            </div>
          )}
          {elapsed && <span className="text-[9px] font-mono text-slate-600">{elapsed}s</span>}
          <ChevronRight size={12} className={`text-slate-600 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {expanded && state.result && (
        <div className="px-4 pb-4 border-t border-[#1e2d4d]">
          <div className="pt-3">
            {agent === 'Watcher' && <WatcherCard result={state.result as WatcherResult} />}
            {agent === 'Diagnoser' && (
              <>
                <DiagnoserCard result={state.result as DiagnoserResult} />
                <ContextRetrievedPanel 
                  context={(state.result as DiagnoserResult).retrievedContext} 
                  agent="Diagnoser" 
                />
              </>
            )}
            {agent === 'Patcher' && (
              <>
                <PatcherCard result={state.result as PatcherResult} />
                <ContextRetrievedPanel 
                  context={(state.result as PatcherResult).retrievedContext} 
                  agent="Patcher" 
                />
              </>
            )}
            {agent === 'Communicator' && (
              <>
                <CommunicatorCard 
                  result={state.result as CommunicatorResult} 
                  notificationRouting={notificationRouting}
                />
                <ContextRetrievedPanel 
                  context={(state.result as CommunicatorResult).retrievedContext} 
                  agent="Communicator" 
                />
              </>
            )}
            {agent === 'Orchestrator' && (
              <p className="text-[11px] text-slate-400">
                Sequence initiated. Routing incident context to Watcher for anomaly detection.
              </p>
            )}
            {agent === 'AttentionRouter' && (
              <AttentionRouterCard result={state.result as any} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ScenarioCard({
  scenario,
  onSelect,
}: {
  scenario: IncidentScenario;
  onSelect: () => void;
}) {
  const sev = SEVERITY_CFG[scenario.severity];
  const icons: Record<string, React.ReactNode> = {
    'incident-001': <Server size={20} className="text-red-400" />,
    'incident-002': <Database size={20} className="text-amber-400" />,
    'incident-003': <Lock size={20} className="text-purple-400" />,
  };
  const metricColors = [
    { label: 'CPU', value: `${scenario.metrics.cpu}%`, color: scenario.metrics.cpu > 85 ? 'text-red-400' : 'text-amber-400' },
    { label: 'Latency', value: `${scenario.metrics.latency}ms`, color: scenario.metrics.latency > 500 ? 'text-red-400' : 'text-amber-400' },
    { label: 'Errors', value: `${scenario.metrics.errorRate}%`, color: scenario.metrics.errorRate > 5 ? 'text-red-400' : 'text-amber-400' },
    { label: 'Memory', value: `${scenario.metrics.memory}%`, color: scenario.metrics.memory > 85 ? 'text-red-400' : 'text-amber-400' },
  ];

  return (
    <div className="group border border-[#1e2d4d] rounded-2xl bg-[#0c1228] hover:border-cyan-500/30 transition-all duration-200 overflow-hidden flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#080d1f] border border-[#1e2d4d] flex items-center justify-center">
            {icons[scenario.id]}
          </div>
          <span className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase px-2 py-1 rounded-full border ${sev.color} ${sev.bg} ${sev.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
            {sev.label}
          </span>
        </div>
        <div className="font-mono text-[10px] text-slate-500 mb-1">{scenario.id.toUpperCase()}</div>
        <h3 className="text-base font-bold text-white mb-2 leading-snug">{scenario.title}</h3>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{scenario.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {scenario.tags.map(t => (
            <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#080d1f] border border-[#1e2d4d] text-slate-500">{t}</span>
          ))}
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-4 gap-2">
          {metricColors.map(m => (
            <div key={m.label} className="text-center rounded bg-[#080d1f] border border-[#1e2d4d] p-1.5">
              <div className={`text-xs font-bold font-mono ${m.color}`}>{m.value}</div>
              <div className="text-[8px] text-slate-600 uppercase tracking-wider">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Component & trigger */}
      <div className="px-5 py-3 border-t border-[#1e2d4d] flex items-center justify-between">
        <span className="text-[10px] font-mono text-cyan-400/70">{scenario.component}</span>
        <button
          onClick={onSelect}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#05081a] text-xs font-bold transition-all duration-150 hover:scale-105 shadow-lg shadow-cyan-500/20"
        >
          <Play size={11} />
          Simulate
        </button>
      </div>
    </div>
  );
}

const SIMULATION_DELAYS: Record<string, number> = {
  'Orchestrator_start': 100,
  'Orchestrator_complete': 800,
  'Watcher_start': 1000,
  'Watcher_complete': 3500,
  'Diagnoser_start': 4000,
  'Diagnoser_complete': 7000,
  'AttentionRouter_start': 7100,
  'AttentionRouter_complete': 7400,
  'Patcher_start': 7500,
  'Patcher_complete': 11000,
  'Communicator_start': 11500,
  'Communicator_complete': 14000,
  'analysis_complete': 14500,
};

const STREAMING_TEXTS: Record<AgentName, string[]> = {
  Orchestrator: [
    'Incident context received.',
    'Validating incident schema...',
    'Routing to Watcher agent...',
  ],
  Watcher: [
    'Polling metrics from target components...',
    'Cross-referencing baseline thresholds...',
    'Anomaly signature confirmed. Building telemetry bundle...',
    'Calculating confidence score from signal correlation...',
  ],
  Diagnoser: [
    'Analyzing telemetry bundle from Watcher...',
    'Running root cause inference via Claude API...',
    'Mapping contributing factors from system state...',
    'Generating impact assessment...',
    'Compiling investigation checklist...',
  ],
  AttentionRouter: [
    'Scoring incident attention level...',
    'Checking historical recurrence patterns...',
    'Evaluating service auto-resolution rate...',
    'Applying attention policy rules...',
    'Routing decision: AUTO / WATCH / ESCALATE',
  ],
  Patcher: [
    'Receiving diagnosis from Diagnoser...',
    'Selecting optimal remediation strategy...',
    'Generating fix commands for target environment...',
    'Calculating risk level and rollback options...',
    'Validating command syntax for execution environment...',
  ],
  Communicator: [
    'Composing Slack incident notification...',
    'Generating structured incident report...',
    'Drafting runbook entry for knowledge base...',
    'Routing to notification channels...',
  ],
};

function useStreamingText(agentName: AgentName | null, isActive: boolean) {
  const [text, setText] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lineIdx = useRef(0);

  useEffect(() => {
    if (!agentName || !isActive) {
      setText('');
      lineIdx.current = 0;
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    const lines = STREAMING_TEXTS[agentName] ?? [];
    lineIdx.current = 0;
    setText(lines[0] ?? '');

    intervalRef.current = setInterval(() => {
      lineIdx.current = (lineIdx.current + 1) % lines.length;
      setText(lines[lineIdx.current]);
    }, 1200);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [agentName, isActive]);

  return text;
}

export default function ActiveIncident({ onNavigate, initialScenarioId }: ActiveIncidentProps) {
  const [uiPhase, setUiPhase] = useState<UIPhase>(initialScenarioId ? 'connecting' : 'selecting');
  const [scenario, setScenario] = useState<IncidentScenario | null>(
    initialScenarioId ? SCENARIOS.find(s => s.id === initialScenarioId) ?? null : null
  );
  const [agents, setAgents] = useState<Record<AgentName, AgentState>>(
    Object.fromEntries(AGENT_ORDER.map(a => [a, { status: 'idle' }])) as Record<AgentName, AgentState>
  );
  const [activeAgent, setActiveAgent] = useState<AgentName | null>(null);
  const [elapsedTotal, setElapsedTotal] = useState(0);
  const [connectionMode, setConnectionMode] = useState<'backend' | 'simulation'>('simulation');
  const [focusMode, setFocusMode] = useState(false);
  const [attentionDecision, setAttentionDecision] = useState<{ level: string; score: number; reason: string } | null>(null);
  const [notificationRouting, setNotificationRouting] = useState<{ channelsSent: string[]; channelsSuppressed: string[]; suppressedReason: string | null } | null>(null);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startTime = useRef<number>(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  const streamingText = useStreamingText(activeAgent, uiPhase === 'running');

  const clearAllTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (tickRef.current) clearInterval(tickRef.current);
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
  }, []);

  const resetState = useCallback(() => {
    clearAllTimers();
    setAgents(Object.fromEntries(AGENT_ORDER.map(a => [a, { status: 'idle' }])) as Record<AgentName, AgentState>);
    setActiveAgent(null);
    setElapsedTotal(0);
    setUiPhase('selecting');
    setScenario(null);
  }, [clearAllTimers]);

  const processEvent = useCallback((evt: SSEEvent) => {
    if (evt.type === 'agent_start') {
      const agent = evt.agent;
      setActiveAgent(agent);
      setAgents(prev => ({
        ...prev,
        [agent]: { status: 'active', startedAt: Date.now() },
      }));
      setTimeout(() => {
        cardsRef.current?.scrollTo({ top: cardsRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    } else if (evt.type === 'agent_complete') {
      const agent = evt.agent;
      const result = (evt as { type: 'agent_complete'; agent: AgentName; result: AgentResultExtended }).result;
      setAgents(prev => ({
        ...prev,
        [agent]: { ...prev[agent], status: 'complete', result, completedAt: Date.now() },
      }));
    } else if (evt.type === 'analysis_complete') {
      setActiveAgent(null);
      setUiPhase('complete');
      if (tickRef.current) clearInterval(tickRef.current);
    } else if (evt.type === 'attention_routed') {
      setAttentionDecision({
        level: evt.attentionLevel,
        score: evt.attentionScore,
        reason: evt.reason
      });
    } else if (evt.type === 'notification_routed') {
      setNotificationRouting({
        channelsSent: evt.channelsSent,
        channelsSuppressed: evt.channelsSuppressed,
        suppressedReason: evt.suppressedReason
      });
    }
  }, []);

  const runSimulation = useCallback((sc: IncidentScenario) => {
    clearAllTimers();
    startTime.current = Date.now();

    tickRef.current = setInterval(() => {
      setElapsedTotal(Math.floor((Date.now() - startTime.current) / 1000));
    }, 500);

    const orchestratorStart: SSEEvent = { type: 'agent_start', agent: 'Orchestrator' };
    const orchestratorComplete: SSEEvent = {
      type: 'agent_complete',
      agent: 'Orchestrator',
      result: {
        sequence: ['Watcher', 'Diagnoser', 'AttentionRouter', 'Patcher', 'Communicator'],
        context: {},
        instructions: 'Proceed with standard agent sequence',
      },
    };

    // Add Attention Router simulation events
    const attentionRouterStart: SSEEvent = { type: 'agent_start', agent: 'AttentionRouter' };
    const attentionRouterComplete: SSEEvent = {
      type: 'agent_complete',
      agent: 'AttentionRouter',
      result: {
        attentionLevel: sc.attentionLevel || 'WATCH',
        attentionScore: sc.attentionScore || 50,
        attentionReason: sc.attentionReason || 'Simulation attention routing'
      },
    };
    const attentionRoutedEvent: SSEEvent = {
      type: 'attention_routed',
      attentionLevel: sc.attentionLevel || 'WATCH',
      attentionScore: sc.attentionScore || 50,
      reason: sc.attentionReason || 'Simulation attention routing'
    };

    // Add notification routing simulation
    const notificationRoutedEvent: SSEEvent = {
      type: 'notification_routed',
      attentionLevel: sc.attentionLevel || 'WATCH',
      channelsSent: sc.notificationPlan?.slack?.sent ? ['slack', 'github'] : [],
      channelsSuppressed: sc.notificationPlan?.slack?.sent ? ['pagerduty', 'email'] : ['slack', 'pagerduty', 'github', 'email'],
      suppressedReason: null
    };

    const allEvents: Array<{ delay: number; event: SSEEvent }> = [
      { delay: SIMULATION_DELAYS['Orchestrator_start'], event: orchestratorStart },
      { delay: SIMULATION_DELAYS['Orchestrator_complete'], event: orchestratorComplete },
    ];

    sc.events.forEach(evt => {
      let key = '';
      if (evt.type === 'agent_start') key = `${evt.agent}_start`;
      else if (evt.type === 'agent_complete') key = `${evt.agent}_complete`;
      else key = 'analysis_complete';
      const delay = SIMULATION_DELAYS[key] ?? 14500;
      allEvents.push({ delay, event: evt });
    });

    // Insert Attention Router events after Diagnoser
    allEvents.push(
      { delay: SIMULATION_DELAYS['AttentionRouter_start'], event: attentionRouterStart },
      { delay: SIMULATION_DELAYS['AttentionRouter_complete'], event: attentionRouterComplete },
      { delay: SIMULATION_DELAYS['AttentionRouter_complete'] + 100, event: attentionRoutedEvent },
      { delay: SIMULATION_DELAYS['Communicator_complete'] + 100, event: notificationRoutedEvent }
    );

    allEvents.forEach(({ delay, event }) => {
      const t = setTimeout(() => processEvent(event), delay);
      timers.current.push(t);
    });
  }, [clearAllTimers, processEvent]);

  const tryBackendSSE = useCallback((sc: IncidentScenario): boolean => {
    try {
      const url = `${BACKEND_URL}/api/incidents/${sc.id}/analyze`;
      const es = new EventSource(url);
      esRef.current = es;

      const timeoutId = setTimeout(() => {
        es.close();
        esRef.current = null;
        setConnectionMode('simulation');
        runSimulation(sc);
      }, 3000);

      es.onopen = () => {
        clearTimeout(timeoutId);
        setConnectionMode('backend');
        startTime.current = Date.now();
        tickRef.current = setInterval(() => {
          setElapsedTotal(Math.floor((Date.now() - startTime.current) / 1000));
        }, 500);
      };

      es.onmessage = (e) => {
        try {
          const evt = JSON.parse(e.data) as SSEEvent;
          processEvent(evt);
        } catch {}
      };

      es.onerror = () => {
        clearTimeout(timeoutId);
        es.close();
        esRef.current = null;
        setConnectionMode('simulation');
        runSimulation(sc);
      };

      return true;
    } catch {
      return false;
    }
  }, [processEvent, runSimulation]);

  const launch = useCallback((sc: IncidentScenario) => {
    setScenario(sc);
    setUiPhase('connecting');
    setAgents(Object.fromEntries(AGENT_ORDER.map(a => [a, { status: 'idle' }])) as Record<AgentName, AgentState>);
    setActiveAgent(null);
    setElapsedTotal(0);

    setTimeout(() => {
      setUiPhase('running');
      const backendConnected = tryBackendSSE(sc);
      if (!backendConnected) {
        setConnectionMode('simulation');
        runSimulation(sc);
      }
    }, 1200);
  }, [tryBackendSSE, runSimulation]);

  useEffect(() => {
    if (initialScenarioId) {
      const sc = SCENARIOS.find(s => s.id === initialScenarioId);
      if (sc) launch(sc);
    }
    return clearAllTimers;
  }, []);

  useEffect(() => {
    return clearAllTimers;
  }, [clearAllTimers]);

  const completedAgents = AGENT_ORDER.filter(a => agents[a].status === 'complete');
  const sev = scenario ? SEVERITY_CFG[scenario.severity] : null;
  
  // Get watcher result for dependency graph
  const watcherResult = agents.Watcher?.result as WatcherResult | undefined;

  if (uiPhase === 'connecting') {
    return (
      <div className="min-h-screen bg-[#05081a] pt-12 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 absolute" />
            <div className="w-16 h-16 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin absolute" />
            <div className="w-16 h-16 flex items-center justify-center">
              <Radio size={20} className="text-cyan-400" />
            </div>
          </div>
          <p className="text-sm font-mono text-cyan-400">Establishing connection...</p>
          <p className="text-[11px] text-slate-600 mt-1">{scenario?.id?.toUpperCase()}</p>
        </div>
      </div>
    );
  }

  if (uiPhase === 'selecting') {
    return (
      <div className="min-h-screen bg-[#05081a] pt-12 pb-10">
        <div className="max-w-5xl mx-auto px-6 pt-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={14} className="text-cyan-400" />
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">Incident Simulator</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Select a Scenario</h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Choose an incident to trigger autonomous AI agent resolution. Each scenario runs Orchestrator → Watcher → Diagnoser → Patcher → Communicator in sequence.
            </p>
          </div>

          {/* Agent legend */}
          <div className="flex items-center gap-4 mb-8 p-3 rounded-xl bg-[#0c1228] border border-[#1e2d4d]">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider shrink-0">Agent chain:</span>
            {AGENT_ORDER.map((a, i) => {
              const m = AGENT_META[a];
              return (
                <div key={a} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${m.bg} border ${m.border}`}>
                    <m.icon size={10} className={m.color} />
                    <span className={`text-[10px] font-medium ${m.color}`}>{a}</span>
                  </div>
                  {i < AGENT_ORDER.length - 1 && <ArrowDown size={10} className="text-slate-600 rotate-[-90deg]" />}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-5">
            {SCENARIOS.map(sc => (
              <ScenarioCard key={sc.id} scenario={sc} onSelect={() => launch(sc)} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#05081a] pt-12 overflow-hidden">

      {/* Left: Agent Pipeline */}
      <div className="w-56 shrink-0 border-r border-[#1e2d4d] bg-[#080d1f] flex flex-col overflow-hidden">
        <div className="px-3 pt-3 pb-2 border-b border-[#1e2d4d]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Agent Pipeline</span>
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${uiPhase === 'complete' ? 'bg-green-400' : 'bg-cyan-400 live-dot'}`} />
              <span className={`text-[9px] font-mono ${uiPhase === 'complete' ? 'text-green-400' : 'text-cyan-400'}`}>
                {uiPhase === 'complete' ? 'DONE' : 'LIVE'}
              </span>
            </div>
          </div>
          {scenario && (
            <div className="mt-1.5">
              <div className="text-[10px] font-mono text-slate-500">{scenario.id.toUpperCase()}</div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {AGENT_ORDER.map((agent, i) => {
              const meta = AGENT_META[agent];
              const state = agents[agent];
              const isActive = state.status === 'active';
              const isDone = state.status === 'complete';

              return (
                <div key={agent}>
                  <div className={`flex items-center gap-2 p-2 rounded-lg border transition-all duration-300 ${
                    isActive ? `${meta.bg} ${meta.border} shadow-sm` :
                    isDone ? 'bg-green-500/5 border-green-500/15' :
                    'border-transparent'
                  }`}>
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                      isActive ? `${meta.bg} border ${meta.border}` :
                      isDone ? 'bg-green-500/10 border border-green-500/25' :
                      'bg-[#0f1629] border border-[#1e2d4d]'
                    }`}>
                      {isDone
                        ? <CheckCircle size={12} className="text-green-400" />
                        : <meta.icon size={12} className={isActive ? meta.color : 'text-slate-600'} />
                      }
                    </div>
                    <div className="min-w-0">
                      <div className={`text-[11px] font-medium leading-none mb-0.5 ${
                        isActive ? meta.color : isDone ? 'text-slate-300' : 'text-slate-600'
                      }`}>{agent}</div>
                      <div className={`text-[9px] ${isActive ? 'text-slate-400' : 'text-slate-600'}`}>{meta.role}</div>
                    </div>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full live-dot" style={{ backgroundColor: 'currentColor' }} />}
                  </div>
                  {i < AGENT_ORDER.length - 1 && (
                    <div className="flex justify-center my-0.5">
                      <ArrowDown size={10} className={isDone ? 'text-cyan-500/50' : 'text-slate-700'} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live metrics */}
        {scenario && uiPhase === 'running' && (
          <div className="p-2 border-t border-[#1e2d4d] space-y-1.5">
            {[
              { label: 'CPU', value: `${scenario.metrics.cpu}%`, color: 'text-red-400' },
              { label: 'Latency', value: `${scenario.metrics.latency}ms`, color: 'text-amber-400' },
              { label: 'Errors', value: `${scenario.metrics.errorRate}%`, color: 'text-red-400' },
            ].map(m => (
              <div key={m.label} className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-600">{m.label}</span>
                <span className={m.color}>{m.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-600">Elapsed</span>
              <span className="text-slate-300">{elapsedTotal}s</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-2 border-t border-[#1e2d4d] space-y-1.5">
          {uiPhase === 'complete' && (
            <button
              onClick={() => onNavigate('incident-detail')}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-green-500/10 border border-green-500/25 text-green-400 text-[10px] font-semibold hover:bg-green-500/20 transition-colors"
            >
              <ExternalLink size={10} />
              View Report
            </button>
          )}
          <button
            onClick={resetState}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded border border-[#1e2d4d] text-slate-500 text-[10px] hover:text-slate-300 hover:border-slate-500 transition-colors"
          >
            <RotateCcw size={10} />
            {uiPhase === 'complete' ? 'New Simulation' : 'Abort & Reset'}
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        {scenario && sev && (
          <div className="px-5 py-3 border-b border-[#1e2d4d] bg-[#080d1f] shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full border ${sev.color} ${sev.bg} ${sev.border} flex items-center gap-1`}>
                    <span className={`w-1 h-1 rounded-full ${sev.dot}`} />
                    {sev.label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{scenario.id.toUpperCase()}</span>
                  <ChevronRight size={10} className="text-slate-600" />
                  <span className="text-[10px] font-mono text-cyan-400">{scenario.component}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                    connectionMode === 'backend'
                      ? 'text-green-400 bg-green-500/10 border-green-500/20'
                      : 'text-slate-500 bg-[#0c1228] border-[#1e2d4d]'
                  }`}>
{connectionMode === 'backend' ? '◉ BACKEND SSE' : '◎ SIMULATION'}
                      </span>
                      <button
                        onClick={() => setFocusMode(!focusMode)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                          focusMode
                            ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
                            : 'bg-[#0c1228] border border-[#1e2d4d] text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400'
                        }`}
                        title="Focus Mode: Hide AUTO-handled incidents"
                      >
                        <Target size={11} />
                        Focus: {focusMode ? 'ON' : 'OFF'}
                      </button>
                    </div>
                <h2 className="text-xl font-bold text-white">{scenario.title}</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">{scenario.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[9px] text-slate-600 uppercase tracking-wider">Agents Done</div>
                  <div className="text-lg font-bold font-mono text-white">{completedAgents.length}<span className="text-slate-500 text-sm">/{AGENT_ORDER.length}</span></div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-slate-600 uppercase tracking-wider">Elapsed</div>
                  <div className="text-lg font-bold font-mono text-white">{elapsedTotal}s</div>
                </div>
                {uiPhase === 'complete' && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-500/10 border border-green-500/25">
                    <CheckCircle size={14} className="text-green-400" />
                    <span className="text-xs font-bold text-green-400">RESOLVED</span>
                  </div>
                )}
              </div>
            </div>

            {/* Overall progress bar */}
            <div className="mt-2.5 h-1 rounded-full bg-[#1e2d4d] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-teal-400 to-green-400 transition-all duration-500"
                style={{ width: `${(completedAgents.length / AGENT_ORDER.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">

          {/* Agent cards */}
          <div ref={cardsRef} className="flex-1 overflow-y-auto p-4 space-y-3">

            {/* Streaming indicator */}
            {uiPhase === 'running' && activeAgent && (
              <div className={`rounded-xl border p-4 ${AGENT_META[activeAgent].bg} ${AGENT_META[activeAgent].border}`}>
                <div className="flex items-center gap-2 mb-2">
                  {(() => { const M = AGENT_META[activeAgent]; return <M.icon size={13} className={M.color} />; })()}
                  <span className={`text-[11px] font-bold ${AGENT_META[activeAgent].color}`}>{activeAgent}</span>
                  <span className="text-[9px] text-slate-500 ml-1">{AGENT_META[activeAgent].role}</span>
                  <div className="ml-auto flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-current live-dot" />
                    <span className={`text-[9px] font-mono ${AGENT_META[activeAgent].color}`}>PROCESSING</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${AGENT_META[activeAgent].color.replace('text-', 'bg-')} animate-bounce`}
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono">{streamingText}</p>
                </div>
              </div>
            )}

            {/* Completed agent cards in reverse display order (latest at top) */}
            {[...AGENT_ORDER].filter(a => agents[a].status !== 'idle').reverse().map((agent) => (
              <AgentResultCard
                key={agent}
                agent={agent}
                state={agents[agent]}
                isLatest={agent === activeAgent}
                notificationRouting={notificationRouting}
              />
            ))}

            {/* Empty state */}
            {uiPhase === 'running' && !activeAgent && completedAgents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-slate-600">Initializing agent sequence...</p>
              </div>
            )}

            {/* Complete banner */}
            {uiPhase === 'complete' && (
              <div className="rounded-xl border border-green-500/25 bg-green-500/5 p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center">
                  <CheckCircle size={20} className="text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-green-400 mb-0.5">Autonomous Resolution Complete</div>
                  <div className="text-[11px] text-slate-400">
                    All {AGENT_ORDER.length} agents completed in {elapsedTotal}s.
                    Incident analyzed, fix generated, stakeholders notified.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('incident-detail')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-green-500/15 border border-green-500/25 text-green-400 text-[11px] font-semibold hover:bg-green-500/25 transition-colors"
                  >
                    <ExternalLink size={11} />
                    Full Report
                  </button>
                  <button
                    onClick={resetState}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#1e2d4d] text-slate-400 text-[11px] hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
                  >
                    <RotateCcw size={11} />
                    New Sim
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Enhanced Panel - Metrics Chart + Dependency Graph + Context */}
          {uiPhase === 'running' && activeAgent && (
            <div className="w-80 border-l border-[#1e2d4d] bg-[#080d1f] shrink-0 overflow-y-auto">
              {/* Live Metrics Chart */}
              <MetricsChart scenario={scenario} uiPhase={uiPhase} elapsedTotal={elapsedTotal} />
              
              {/* Context Passed */}
              <div className="p-3 border-t border-[#1e2d4d]">
                <div className="px-3 py-2.5 border-b border-[#1e2d4d]">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Context Passed</div>
                  <div className="text-[9px] text-slate-600 mt-0.5">What {activeAgent} received</div>
                </div>
                <div className="p-3 space-y-2">
                  {completedAgents.slice(-2).map(agent => {
                    const state = agents[agent];
                    if (!state.result) return null;
                    const meta = AGENT_META[agent];
                    return (
                      <div key={agent} className={`rounded-lg border p-2.5 ${meta.bg} ${meta.border}`}>
                        <div className={`flex items-center gap-1.5 mb-1.5 text-[9px] font-semibold uppercase ${meta.color}`}>
                          <meta.icon size={9} />
                          {agent} output
                        </div>
                        {agent === 'Watcher' && (
                          <div className="text-[10px] text-slate-400 space-y-0.5">
                            <div>Confidence: <span className="text-slate-300">{Math.round((state.result as WatcherResult).confidence * 100)}%</span></div>
                            <div>Severity: <span className="text-slate-300">{(state.result as WatcherResult).severity}</span></div>
                          </div>
                        )}
                        {agent === 'Diagnoser' && (
                          <p className="text-[10px] text-slate-400 line-clamp-3">{(state.result as DiagnoserResult).rootCause}</p>
                        )}
                        {agent === 'Patcher' && (
                          <div className="text-[10px] text-slate-400 space-y-0.5">
                            <div>Fix: <span className="text-slate-300">{(state.result as PatcherResult).fixType}</span></div>
                            <div>Risk: <span className="text-slate-300">{(state.result as PatcherResult).riskLevel}</span></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {completedAgents.length === 0 && (
                    <p className="text-[10px] text-slate-600 italic">No prior agent output yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
