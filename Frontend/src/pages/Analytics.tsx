import { useState, useEffect, useRef } from 'react';
import OperatorSidebar, { SidebarNav } from '../components/OperatorSidebar';
import {
  Triangle, Clock, MousePointer, CheckCircle2, Download,
  TrendingUp, TrendingDown, Zap, Activity, AlertTriangle,
  Search, Eye, Wrench, MessageSquare, Shield, Server,
  Filter, RefreshCw, ChevronDown, ToggleRight, ToggleLeft,
  Plus, Trash2, Play, Pause, Circle, ArrowRight
} from 'lucide-react';

// ── Shared chart helpers ──────────────────────────────────────────────────────

const incidentData = [
  { day: 'Mon', value: 22, anomaly: false },
  { day: 'Tue', value: 45, anomaly: false },
  { day: 'Wed', value: 68, anomaly: true },
  { day: 'Thu', value: 82, anomaly: false },
  { day: 'Fri', value: 95, anomaly: true },
  { day: 'Sat', value: 118, anomaly: false },
  { day: 'Sun', value: 147, anomaly: true },
];

const affectedServices = [
  { name: 'api-server-02',      value: 842, max: 842, color: '#a855f7' },
  { name: 'db-cluster-primary', value: 614, max: 842, color: '#06b6d4' },
  { name: 'auth-provider-v3',   value: 420, max: 842, color: '#818cf8' },
  { name: 'edge-cache-node',    value: 310, max: 842, color: '#2dd4bf' },
  { name: 'payment-gateway',    value: 122, max: 842, color: '#f97316' },
];

const heatmapData = [
  [0.1, 0.3, 0.5, 0.7],
  [0.2, 0.6, 0.8, 0.4],
  [0.4, 0.9, 0.6, 0.2],
];

const mttrTrend = [38, 34, 30, 28, 26, 22, 20, 19, 18, 17, 16, 15];

function IncidentChart() {
  const W = 400, H = 160, padL = 30, padR = 10, padT = 10, padB = 30;
  const chartW = W - padL - padR, chartH = H - padT - padB;
  const maxVal = 160;
  const pts = incidentData.map((d, i) => ({
    x: padL + (i / (incidentData.length - 1)) * chartW,
    y: padT + chartH - (d.value / maxVal) * chartH,
    ...d,
  }));
  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
  const area = `${pts[0].x},${padT + chartH} ${polyline} ${pts[pts.length - 1].x},${padT + chartH}`;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="2" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {[0, 50, 100, 150].map(g => {
        const y = padT + chartH - (g / maxVal) * chartH;
        return <g key={g}><line x1={padL} y1={y} x2={padL + chartW} y2={y} stroke="#1e2d4d" strokeWidth="1" strokeDasharray="4,4" /><text x={padL - 4} y={y + 3} textAnchor="end" fontSize="9" fill="#4a5568">{g}</text></g>;
      })}
      <polygon points={area} fill="url(#areaGrad)" />
      <polyline points={pts.map((p, i) => `${p.x},${padT + chartH - (Math.max(0, p.value * 0.65) / maxVal) * chartH}`).join(' ')} fill="none" stroke="#2dd4bf" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
      <polyline points={polyline} fill="none" stroke="#a855f7" strokeWidth="2" filter="url(#glow)" strokeLinejoin="round" />
      {pts.filter(p => p.anomaly).map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill="#a855f7" stroke="#1e2d4d" strokeWidth="1.5" />)}
      {pts.filter(p => !p.anomaly).map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#06b6d4" />)}
      {pts.map((p, i) => <text key={i} x={p.x} y={H - 6} textAnchor="middle" fontSize="9" fill="#4a5568">{p.day}</text>)}
    </svg>
  );
}

function DonutGauge({ pct }: { pct: number }) {
  const r = 48, circ = 2 * Math.PI * r, offset = circ - (pct / 100) * circ;
  return (
    <div className="flex items-center justify-center py-2 relative">
      <svg width={120} height={120} className="-rotate-90">
        <circle cx={60} cy={60} r={r} fill="none" stroke="#1e2d4d" strokeWidth={10} />
        <circle cx={60} cy={60} r={r} fill="none" stroke="url(#donutGrad)" strokeWidth={10} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        <defs><linearGradient id="donutGrad" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#2dd4bf" /></linearGradient></defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-bold font-mono text-white">{pct}%</div>
        <div className="text-[9px] text-slate-500">AVG</div>
      </div>
    </div>
  );
}

function MttrSparkline() {
  const W = 200, H = 70, max = Math.max(...mttrTrend);
  const pts = mttrTrend.map((v, i) => `${(i / (mttrTrend.length - 1)) * W},${H - (v / max) * (H - 10) - 5}`).join(' ');
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      <defs><linearGradient id="mttrGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.2" /><stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" /></linearGradient></defs>
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill="url(#mttrGrad)" />
      <polyline points={pts} fill="none" stroke="#2dd4bf" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// ── OVERVIEW section ──────────────────────────────────────────────────────────
function OverviewSection() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 2000); return () => clearInterval(t); }, []);

  const healthCards = [
    { label: 'System Uptime', value: '99.1%', sub: 'Last 30 days', color: 'text-green-400', icon: CheckCircle2 },
    { label: 'Active Agents',  value: '5 / 5',  sub: 'All online', color: 'text-cyan-400',  icon: Zap },
    { label: 'Open Incidents', value: '3',      sub: '1 critical', color: 'text-amber-400', icon: AlertTriangle },
    { label: 'MTTR Today',     value: '11m 8s', sub: '-3.2% vs avg', color: 'text-blue-400', icon: Clock },
  ];

  const agentStatus = [
    { name: 'Orchestrator', icon: Shield,        color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/25', incidents: 14 },
    { name: 'Watcher',      icon: Eye,           color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/25',   incidents: 14 },
    { name: 'Diagnoser',    icon: Search,        color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/25',  incidents: 14 },
    { name: 'Patcher',      icon: Wrench,        color: 'text-teal-400',   bg: 'bg-teal-500/10',   border: 'border-teal-500/25',   incidents: 14 },
    { name: 'Communicator', icon: MessageSquare, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/25', incidents: 14 },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-3">
        {healthCards.map(c => (
          <div key={c.label} className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">{c.label}</span>
              <c.icon size={13} className={c.color} />
            </div>
            <div className={`text-2xl font-bold font-mono ${c.color} mb-0.5`}>{c.value}</div>
            <div className="text-[10px] text-slate-600">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
        <div className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-4">Agent Health Status</div>
        <div className="space-y-2">
          {agentStatus.map(a => (
            <div key={a.name} className={`flex items-center gap-3 p-2.5 rounded-lg border ${a.bg} ${a.border}`}>
              <div className={`w-7 h-7 rounded-lg ${a.bg} border ${a.border} flex items-center justify-center`}>
                <a.icon size={13} className={a.color} />
              </div>
              <span className={`text-[11px] font-semibold ${a.color} w-28`}>{a.name}</span>
              <div className="flex items-center gap-1.5 ml-auto">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 live-dot" />
                <span className="text-[10px] text-green-400 font-mono">ONLINE</span>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono text-slate-300">{a.incidents} incidents</div>
                <div className="text-[9px] text-slate-600">this week</div>
              </div>
              <div className="w-24 h-1.5 rounded-full bg-[#1e2d4d] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400" style={{ width: `${85 + ((tick + agentStatus.indexOf(a)) % 3) * 4}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Incident Volume · 7d</div>
          <IncidentChart />
        </div>
        <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Top Affected Services</div>
          <div className="space-y-3">
            {affectedServices.map(svc => (
              <div key={svc.name}>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-400 font-mono">{svc.name}</span>
                  <span className="text-slate-300 font-mono font-semibold">{svc.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#1e2d4d] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(svc.value / svc.max) * 100}%`, backgroundColor: svc.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DEEP INSIGHTS section ──────────────────────────────────────────────────────
type TimeRange = '24h' | '7d' | '30d' | '90d';
function DeepInsightsSection() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const metricCards = [
    { label: 'Total Incidents', icon: Triangle, iconColor: 'text-amber-400', value: '1,284', trend: '+12.5% vs last 30d', trendUp: true },
    { label: 'Avg MTTR',        icon: Clock,    iconColor: 'text-cyan-400',   value: '14m 32s', trend: '-4.2% improved speed', trendUp: false },
    { label: 'Agent Accuracy %', icon: MousePointer, iconColor: 'text-purple-400', value: '98.4%', trend: 'High Precision', trendUp: null, badge: true },
    { label: 'Success Rate',    icon: CheckCircle2, iconColor: 'text-green-400', value: '94.1%', bar: 94.1 },
  ];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Deep Insights</h2>
          <p className="text-[11px] text-slate-500">Operational performance metrics and real-time threat intelligence.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded overflow-hidden border border-[#1e2d4d]">
            {(['24h', '7d', '30d', '90d'] as TimeRange[]).map(t => (
              <button key={t} onClick={() => setTimeRange(t)} className={`px-3 py-1.5 text-[11px] font-medium transition-colors ${timeRange === t ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-slate-200 bg-[#0c1228]'}`}>{t}</button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded border border-[#1e2d4d] text-slate-300 text-[11px] hover:border-cyan-500/30 hover:text-cyan-400 transition-colors"><Download size={12} />Export</button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {metricCards.map((card) => (
          <div key={card.label} className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">{card.label}</span>
              <card.icon size={14} className={card.iconColor} />
            </div>
            <div className="text-2xl font-bold font-mono text-white mb-2">{card.value}</div>
            {card.trend && card.trendUp !== undefined && card.trendUp !== null && (
              <div className="flex items-center gap-1 text-[10px] text-green-400">
                {card.trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                <span>{card.trend}</span>
              </div>
            )}
            {card.trend && card.trendUp === null && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/25 text-purple-400">
                <Zap size={8} className="inline mr-0.5" />{card.trend}
              </span>
            )}
            {card.bar !== undefined && (
              <div className="h-1.5 rounded-full bg-[#1e2d4d] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400" style={{ width: `${card.bar}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Incidents Per Day</span>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" /><span className="text-[10px] text-slate-500">Anomalies</span></div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-400" /><span className="text-[10px] text-slate-500">Baseline</span></div>
            </div>
          </div>
          <IncidentChart />
        </div>
        <div className="col-span-2 border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
          <div className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-4">Affected Services</div>
          <div className="space-y-3">
            {affectedServices.map(svc => (
              <div key={svc.name}>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-400 font-mono">{svc.name}</span>
                  <span className="text-slate-300 font-mono font-semibold">{svc.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#1e2d4d] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(svc.value / svc.max) * 100}%`, backgroundColor: svc.color, boxShadow: `0 0 6px ${svc.color}60` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-[#1e2d4d] flex justify-between">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total Volume</span>
            <span className="text-sm font-bold font-mono text-white">2.3k</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Agent Calibration</div>
          <DonutGauge pct={95} />
          <div className="grid grid-cols-2 gap-2 mt-2 text-center">
            <div><div className="text-xs font-bold font-mono text-cyan-400">4/4</div><div className="text-[9px] text-slate-600">Agents Active</div></div>
            <div><div className="text-xs font-bold font-mono text-green-400">99.1%</div><div className="text-[9px] text-slate-600">Uptime</div></div>
          </div>
        </div>
        <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Heatmap: Distribution</div>
          <div className="space-y-1.5">
            {['wk_01', 'wk_02', 'wk_03'].map((wk, ri) => (
              <div key={wk} className="flex items-center gap-1.5">
                <span className="text-[9px] text-slate-600 font-mono w-8 shrink-0">{wk}</span>
                <div className="flex gap-1 flex-1">
                  {heatmapData[ri].map((val, ci) => (
                    <div key={ci} className="flex-1 h-7 rounded" style={{ backgroundColor: `rgba(${val > 0.7 ? '34,211,238' : val > 0.4 ? '45,212,191' : val > 0.2 ? '30,45,77' : '12,18,40'}, ${0.4 + val * 0.6})` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">MTTR Efficiency Trend</div>
          <div className="relative">
            <MttrSparkline />
            <div className="absolute top-2 right-0 bg-[#0c1228] rounded border border-[#1e2d4d] px-2 py-1.5">
              <div className="text-[9px] text-slate-500">Peak Improvement</div>
              <div className="text-base font-bold font-mono text-green-400">-24%</div>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-center">
            <div><div className="text-xs font-bold font-mono text-white">14m 32s</div><div className="text-[9px] text-slate-600">Current Avg</div></div>
            <div><div className="text-xs font-bold font-mono text-slate-400">19m 02s</div><div className="text-[9px] text-slate-600">30d Ago</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FORENSICS section ─────────────────────────────────────────────────────────
const forensicEvents = [
  { time: '03:14:22', agent: 'Watcher',      type: 'ANOMALY',  msg: 'CPU spike detected on api-server-2: 97%', severity: 'critical' },
  { time: '03:14:24', agent: 'Orchestrator', type: 'TRIGGER',  msg: 'Sequence ALPHA-7 initiated. Routing to Watcher.', severity: 'info' },
  { time: '03:14:31', agent: 'Watcher',      type: 'CONFIRM',  msg: 'Anomaly confirmed. Confidence: 95%. Telemetry forwarded.', severity: 'high' },
  { time: '03:14:33', agent: 'Diagnoser',    type: 'ANALYZE',  msg: 'Root cause: GC cycle inefficiency in heap allocator.', severity: 'high' },
  { time: '03:14:40', agent: 'Diagnoser',    type: 'COMPLETE', msg: 'Contributing factors identified. Confidence: 85%.', severity: 'info' },
  { time: '03:14:42', agent: 'Patcher',      type: 'PATCH',    msg: 'Rolling restart initiated: kubectl rollout restart', severity: 'info' },
  { time: '03:14:55', agent: 'Patcher',      type: 'VERIFY',   msg: 'Patch validated. Regression tests passing (12/12).', severity: 'success' },
  { time: '03:14:57', agent: 'Communicator', type: 'NOTIFY',   msg: 'Slack #incidents notified. PagerDuty resolved.', severity: 'success' },
  { time: '03:15:01', agent: 'Orchestrator', type: 'RESOLVED', msg: 'Incident INC-8829-B2 resolved. All agents standing down.', severity: 'success' },
];

const sevColor: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/20',
  high:     'text-amber-400 bg-amber-500/10 border-amber-500/20',
  info:     'text-blue-400 bg-blue-500/10 border-blue-500/20',
  success:  'text-green-400 bg-green-500/10 border-green-500/20',
};

const agentColor: Record<string, string> = {
  Orchestrator: 'text-purple-400', Watcher: 'text-blue-400',
  Diagnoser: 'text-amber-400', Patcher: 'text-teal-400', Communicator: 'text-orange-400',
};

function ForensicsSection() {
  const [filter, setFilter] = useState('all');
  const visible = filter === 'all' ? forensicEvents : forensicEvents.filter(e => e.severity === filter || e.agent.toLowerCase() === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Forensic Investigation</h2>
          <p className="text-[11px] text-slate-500">Full event timeline and raw telemetry for incident INC-8829-B2.</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={12} className="text-slate-500" />
          {['all', 'critical', 'success', 'watcher', 'diagnoser', 'patcher'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors capitalize ${filter === f ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2d4d] flex items-center gap-2">
          <Activity size={12} className="text-cyan-400" />
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Event Timeline</span>
          <span className="text-[9px] text-slate-600 font-mono ml-auto">{visible.length} events</span>
        </div>
        <div className="divide-y divide-[#1e2d4d]">
          {visible.map((evt, i) => (
            <div key={i} className="flex items-start gap-4 px-4 py-3 hover:bg-white/2 transition-colors">
              <span className="text-[10px] font-mono text-slate-600 shrink-0 mt-0.5">{evt.time}</span>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className={`w-2 h-2 rounded-full ${evt.severity === 'success' ? 'bg-green-400' : evt.severity === 'critical' ? 'bg-red-400' : evt.severity === 'high' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                {i < visible.length - 1 && <div className="w-px h-4 bg-[#1e2d4d]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-semibold ${agentColor[evt.agent] || 'text-slate-400'}`}>{evt.agent}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${sevColor[evt.severity]}`}>{evt.type}</span>
                </div>
                <p className="text-[11px] text-slate-300">{evt.msg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Raw Telemetry */}
      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2d4d]">
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Raw Telemetry Snapshot</span>
        </div>
        <div className="p-4 grid grid-cols-4 gap-3">
          {[
            { label: 'CPU Peak', value: '97.4%', color: 'text-red-400' },
            { label: 'Mem Usage', value: '78.1%', color: 'text-amber-400' },
            { label: 'Req Latency', value: '250ms', color: 'text-amber-400' },
            { label: 'Error Rate', value: '2.0%', color: 'text-red-400' },
            { label: 'Req/s', value: '4,821', color: 'text-slate-300' },
            { label: 'GC Cycles', value: '148/min', color: 'text-amber-400' },
            { label: 'Heap Alloc', value: '2.4GB/min', color: 'text-red-400' },
            { label: 'Threads', value: '96% sat.', color: 'text-red-400' },
          ].map(m => (
            <div key={m.label} className="rounded bg-[#080d1f] border border-[#1e2d4d] p-2.5">
              <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-0.5">{m.label}</div>
              <div className={`text-sm font-bold font-mono ${m.color}`}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── AUTOMATIONS section ───────────────────────────────────────────────────────
interface AutoRule { id: string; name: string; trigger: string; action: string; enabled: boolean; runs: number; lastRun: string }
const defaultRules: AutoRule[] = [
  { id: '1', name: 'CPU Spike Auto-Response', trigger: 'CPU > 90% for 3m', action: 'Launch Watcher → Full Sequence', enabled: true, runs: 42, lastRun: '2h ago' },
  { id: '2', name: 'DB Pool Exhaustion',      trigger: 'DB connections > 95%', action: 'Patch: Scale connection pool', enabled: true, runs: 18, lastRun: '1d ago' },
  { id: '3', name: 'Memory Leak Detector',    trigger: 'Heap > 1GB/min growth', action: 'Diagnoser → Patcher sequence', enabled: true, runs: 7, lastRun: '3d ago' },
  { id: '4', name: 'Latency Spike Alert',     trigger: 'p99 latency > 2000ms', action: 'Notify Communicator only', enabled: false, runs: 31, lastRun: '5d ago' },
  { id: '5', name: 'Error Rate Threshold',    trigger: 'Error rate > 5% for 5m', action: 'Watcher + Diagnoser', enabled: true, runs: 12, lastRun: '12h ago' },
];

function AutomationsSection() {
  const [rules, setRules] = useState<AutoRule[]>(defaultRules);
  const toggleRule = (id: string) => setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  const deleteRule = (id: string) => setRules(prev => prev.filter(r => r.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Automations</h2>
          <p className="text-[11px] text-slate-500">Trigger rules that launch agent sequences automatically.</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[11px] hover:bg-cyan-500/20 transition-colors">
          <Plus size={11} /> New Rule
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-2">
        {[
          { label: 'Active Rules', value: rules.filter(r => r.enabled).length, color: 'text-green-400' },
          { label: 'Total Runs', value: rules.reduce((a, r) => a + r.runs, 0), color: 'text-cyan-400' },
          { label: 'Disabled', value: rules.filter(r => !r.enabled).length, color: 'text-slate-400' },
        ].map(s => (
          <div key={s.label} className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-3 text-center">
            <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2d4d]">
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Trigger Rules</span>
        </div>
        <div className="divide-y divide-[#1e2d4d]">
          {rules.map(rule => (
            <div key={rule.id} className={`px-4 py-4 transition-colors ${rule.enabled ? '' : 'opacity-50'}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{rule.name}</span>
                    {rule.enabled
                      ? <span className="text-[9px] text-green-400 bg-green-500/10 border border-green-500/25 px-1.5 py-0.5 rounded">ACTIVE</span>
                      : <span className="text-[9px] text-slate-500 bg-[#1a2340] border border-[#1e2d4d] px-1.5 py-0.5 rounded">DISABLED</span>
                    }
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] mb-0.5">
                    <span className="text-slate-500">When:</span>
                    <code className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-mono">{rule.trigger}</code>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <ArrowRight size={10} className="text-slate-600" />
                    <span className="text-cyan-400 font-mono">{rule.action}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <button onClick={() => toggleRule(rule.id)} className="transition-colors">
                    {rule.enabled
                      ? <ToggleRight size={22} className="text-cyan-400 hover:text-cyan-300" />
                      : <ToggleLeft size={22} className="text-slate-600 hover:text-slate-400" />
                    }
                  </button>
                  <button onClick={() => deleteRule(rule.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[9px] font-mono text-slate-600">
                <span>Runs: <span className="text-slate-400">{rule.runs}</span></span>
                <span>Last: <span className="text-slate-400">{rule.lastRun}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── LOGS section ──────────────────────────────────────────────────────────────
const LOG_POOL = [
  { t: '02:14:22', type: 'CRIT',  agent: 'Watcher',      msg: 'CPU saturation detected on worker-node-0: 98.4%' },
  { t: '02:14:23', type: 'SYS',   agent: 'Orchestrator', msg: 'Sequence ALPHA-7 initiated. Routing incident context.' },
  { t: '02:14:31', type: 'MATCH', agent: 'Watcher',      msg: 'Anomaly signature confirmed. Telemetry forwarded to Diagnoser.' },
  { t: '02:14:33', type: 'INFO',  agent: 'Diagnoser',    msg: 'Root cause analysis started. LLM invocation #1.' },
  { t: '02:14:40', type: 'MATCH', agent: 'Diagnoser',    msg: 'Root pattern match: GC cycle inefficiency in v2.1 allocator.' },
  { t: '02:14:42', type: 'PATCH', agent: 'Patcher',      msg: 'kubectl rollout restart deployment/worker-service' },
  { t: '02:14:50', type: 'SYS',   agent: 'Patcher',      msg: 'Rolling restart initiated. Pod worker-node-0 draining.' },
  { t: '02:14:55', type: 'MATCH', agent: 'Patcher',      msg: 'Health check passed: worker-node-1 online.' },
  { t: '02:14:57', type: 'INFO',  agent: 'Communicator', msg: 'Slack #incidents notification dispatched.' },
  { t: '02:15:01', type: 'SYS',   agent: 'Orchestrator', msg: 'Incident INC-8829-B2 resolved. All agents standing down.' },
  { t: '02:41:12', type: 'WARN',  agent: 'Watcher',      msg: 'DB connection pool at 91% capacity. Monitoring.' },
  { t: '02:41:25', type: 'CRIT',  agent: 'Watcher',      msg: 'Connection pool exhausted. Query timeouts starting.' },
  { t: '02:41:26', type: 'SYS',   agent: 'Orchestrator', msg: 'Sequence BRAVO-3 initiated.' },
  { t: '02:41:34', type: 'PATCH', agent: 'Patcher',      msg: "kubectl patch configmap app-config -p '{\"data\":{\"DB_POOL_SIZE\": \"100\"}}'" },
  { t: '02:41:44', type: 'MATCH', agent: 'Patcher',      msg: 'Configmap updated. Rolling restart complete.' },
];

const logStyle: Record<string, string> = {
  CRIT:  'text-red-400 bg-red-500/10 border-red-500/20',
  WARN:  'text-amber-400 bg-amber-500/10 border-amber-500/20',
  MATCH: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  PATCH: 'text-green-400 bg-green-500/10 border-green-500/20',
  INFO:  'text-blue-400 bg-blue-500/10 border-blue-500/20',
  SYS:   'text-slate-400 bg-transparent border-transparent',
};

function LogsSection() {
  const [logs, setLogs] = useState(LOG_POOL);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [streaming, setStreaming] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const visible = logs.filter(l =>
    (typeFilter === 'ALL' || l.type === typeFilter) &&
    (search === '' || l.msg.toLowerCase().includes(search.toLowerCase()) || l.agent.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleStream = () => {
    if (streaming) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setStreaming(false);
    } else {
      setStreaming(true);
      let idx = 0;
      intervalRef.current = setInterval(() => {
        const entry = LOG_POOL[idx % LOG_POOL.length];
        const now = new Date();
        const ts = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
        setLogs(prev => [...prev.slice(-50), { ...entry, t: ts }]);
        idx++;
      }, 1200);
    }
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">System Logs</h2>
          <p className="text-[11px] text-slate-500">Real-time log stream from all agents and services.</p>
        </div>
        <button onClick={toggleStream} className={`flex items-center gap-2 px-3 py-1.5 rounded border text-[11px] font-medium transition-colors ${streaming ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'}`}>
          {streaming ? <><Pause size={11} /> Stop Stream</> : <><Play size={11} /> Live Stream</>}
        </button>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..."
            className="w-full pl-8 pr-3 py-1.5 rounded bg-[#0c1228] border border-[#1e2d4d] text-[11px] text-slate-300 focus:outline-none focus:border-cyan-500/40" />
        </div>
        <div className="flex rounded overflow-hidden border border-[#1e2d4d]">
          {['ALL', 'CRIT', 'WARN', 'MATCH', 'PATCH', 'INFO', 'SYS'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1.5 text-[9px] font-mono font-medium transition-colors ${typeFilter === t ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300 bg-[#0c1228]'}`}>
              {t}
            </button>
          ))}
        </div>
        <button onClick={() => setLogs(LOG_POOL)} className="text-slate-500 hover:text-slate-300 transition-colors"><RefreshCw size={13} /></button>
      </div>
      <div className="border border-[#1e2d4d] rounded-lg bg-[#080d1f] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1e2d4d]">
          {streaming && <span className="w-1.5 h-1.5 rounded-full bg-red-400 live-dot" />}
          <span className="text-[10px] font-mono text-slate-600">{visible.length} entries</span>
        </div>
        <div className="max-h-96 overflow-y-auto p-2 space-y-0.5">
          {visible.map((log, i) => (
            <div key={i} className={`flex items-start gap-2 px-2 py-1 rounded text-[10px] font-mono border ${logStyle[log.type]}`}>
              <span className="text-slate-600 shrink-0">{log.t}</span>
              <span className={`shrink-0 font-semibold ${agentColor[log.agent] || 'text-slate-400'}`}>[{log.agent}]</span>
              <span className="shrink-0 font-semibold">[{log.type}]</span>
              <span className="text-slate-300 break-words">{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PREFERENCES section ───────────────────────────────────────────────────────
function PreferencesSection() {
  const [refreshRate, setRefreshRate] = useState('30');
  const [defaultRange, setDefaultRange] = useState('7d');
  const [chartType, setChartType] = useState('line');
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [showBaseline, setShowBaseline] = useState(true);
  const [autoExport, setAutoExport] = useState(false);
  const [exportFormat, setExportFormat] = useState('PDF');
  const [exportDay, setExportDay] = useState('Monday');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">Analytics Preferences</h2>
        <p className="text-[11px] text-slate-500">Customize data refresh rates, chart defaults, and export settings.</p>
      </div>

      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2d4d]">
          <Activity size={12} className="text-cyan-400" />
          <span className="text-[11px] font-semibold text-white uppercase tracking-wider">Data Settings</span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Auto-refresh Rate</label>
            <div className="relative">
              <select value={refreshRate} onChange={e => setRefreshRate(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#080d1f] border border-[#1e2d4d] text-sm text-slate-300 focus:outline-none appearance-none">
                <option value="10">Every 10 seconds</option>
                <option value="30">Every 30 seconds</option>
                <option value="60">Every minute</option>
                <option value="300">Every 5 minutes</option>
                <option value="0">Manual only</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Default Time Range</label>
            <div className="relative">
              <select value={defaultRange} onChange={e => setDefaultRange(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#080d1f] border border-[#1e2d4d] text-sm text-slate-300 focus:outline-none appearance-none">
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2d4d]">
          <Circle size={12} className="text-cyan-400" />
          <span className="text-[11px] font-semibold text-white uppercase tracking-wider">Chart Defaults</span>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-2">Chart Type</label>
            <div className="flex gap-2">
              {['line', 'bar', 'area'].map(ct => (
                <button key={ct} onClick={() => setChartType(ct)}
                  className={`flex-1 py-2 rounded-lg border text-[11px] font-medium capitalize transition-colors ${chartType === ct ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400' : 'border-[#1e2d4d] bg-[#080d1f] text-slate-400 hover:border-[#2d4070]'}`}>
                  {ct}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-[#1e2d4d]">
            {[
              { label: 'Show Anomaly Markers', desc: 'Highlight detected anomaly points on charts.', value: showAnomalies, setter: setShowAnomalies },
              { label: 'Show Baseline Line', desc: 'Overlay expected baseline on incident charts.', value: showBaseline, setter: setShowBaseline },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium text-white">{item.label}</div>
                  <div className="text-[10px] text-slate-500">{item.desc}</div>
                </div>
                <div className="flex items-center gap-2">
                  {item.value
                    ? <button onClick={() => item.setter(false)} className="text-cyan-400 hover:text-cyan-300"><ToggleRight size={22} /></button>
                    : <button onClick={() => item.setter(true)} className="text-slate-600 hover:text-slate-400"><ToggleLeft size={22} /></button>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2d4d]">
          <Download size={12} className="text-cyan-400" />
          <span className="text-[11px] font-semibold text-white uppercase tracking-wider">Scheduled Export</span>
          <div className="ml-auto">
            {autoExport
              ? <button onClick={() => setAutoExport(false)} className="text-cyan-400 hover:text-cyan-300"><ToggleRight size={22} /></button>
              : <button onClick={() => setAutoExport(true)} className="text-slate-600 hover:text-slate-400"><ToggleLeft size={22} /></button>
            }
          </div>
        </div>
        {autoExport && (
          <div className="p-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Format</label>
              <div className="flex gap-2">
                {['PDF', 'CSV', 'JSON'].map(f => (
                  <button key={f} onClick={() => setExportFormat(f)}
                    className={`flex-1 py-1.5 rounded border text-[11px] font-mono font-medium transition-colors ${exportFormat === f ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400' : 'border-[#1e2d4d] bg-[#080d1f] text-slate-400'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Send Every</label>
              <div className="relative">
                <select value={exportDay} onChange={e => setExportDay(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#080d1f] border border-[#1e2d4d] text-sm text-slate-300 focus:outline-none appearance-none">
                  {['Monday', 'Wednesday', 'Friday', 'Daily'].map(d => <option key={d}>{d}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Root Component ────────────────────────────────────────────────────────────
export default function Analytics() {
  const [activeNav, setActiveNav] = useState<SidebarNav>('insights');

  const sections: Record<SidebarNav, React.ReactNode> = {
    overview:     <OverviewSection />,
    insights:     <DeepInsightsSection />,
    forensics:    <ForensicsSection />,
    automations:  <AutomationsSection />,
    logs:         <LogsSection />,
    preferences:  <PreferencesSection />,
  };

  const sectionTitles: Record<SidebarNav, { title: string; sub: string }> = {
    overview:    { title: 'Overview',         sub: 'System health, agent status, and incident summary.' },
    insights:    { title: 'Deep Insights',    sub: 'Operational performance metrics and real-time threat intelligence.' },
    forensics:   { title: 'Forensics',        sub: 'Event timeline, raw telemetry, and incident investigation tools.' },
    automations: { title: 'Automations',      sub: 'Trigger rules that launch agent sequences automatically.' },
    logs:        { title: 'System Logs',      sub: 'Real-time log stream from all agents and services.' },
    preferences: { title: 'Preferences',      sub: 'Customize refresh rates, chart defaults, and export settings.' },
  };

  return (
    <div className="flex h-screen bg-[#05081a] pt-12 overflow-hidden">
      <OperatorSidebar activeNav={activeNav} onNavChange={setActiveNav} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-4 pb-3 border-b border-[#1e2d4d] bg-[#05081a] sticky top-0 z-10">
          <h1 className="text-lg font-bold text-white">{sectionTitles[activeNav].title}</h1>
          <p className="text-[11px] text-slate-500">{sectionTitles[activeNav].sub}</p>
        </div>
        <div className="px-6 pt-5 pb-10">
          {sections[activeNav]}
        </div>
      </div>
    </div>
  );
}
