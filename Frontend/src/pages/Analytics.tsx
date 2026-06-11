import { useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Clock,
  Download,
  Shield,
  Zap,
} from 'lucide-react';
import Footer from '../components/Footer';

/* ── helpers ── */
function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/* ── SVG area/line chart ── */
const weeklyData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  incidents: [4, 2, 6, 11, 14, 9, 5],
  mttr: [3.2, 1.8, 4.5, 2.1, 1.6, 2.8, 2.0],
};
const monthlyData = {
  labels: ['W1', 'W2', 'W3', 'W4'],
  incidents: [22, 18, 31, 25],
  mttr: [2.8, 2.3, 1.9, 1.6],
};
const quarterData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  incidents: [45, 38, 52, 47, 60, 42],
  mttr: [4.2, 3.8, 3.1, 2.6, 2.1, 1.8],
};

function buildLinePath(vals: number[], W: number, H: number, P: number) {
  const max = Math.max(...vals) * 1.25 || 1;
  return vals
    .map((v, i) => {
      const x = P + (i / (vals.length - 1)) * (W - P * 2);
      const y = H - P - clamp(v / max, 0, 1) * (H - P * 2);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');
}
function buildAreaPath(vals: number[], W: number, H: number, P: number) {
  const max = Math.max(...vals) * 1.25 || 1;
  const xs = vals.map((_, i) => P + (i / (vals.length - 1)) * (W - P * 2));
  const ys = vals.map((v) => H - P - clamp(v / max, 0, 1) * (H - P * 2));
  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(' L ');
  return `M${xs[0]},${H - P} L${pts} L${xs[xs.length - 1]},${H - P}Z`;
}

function TrendChart({ data }: { data: typeof weeklyData }) {
  const W = 600; const H = 200; const P = 24;
  const incLine = buildLinePath(data.incidents, W, H, P);
  const incArea = buildAreaPath(data.incidents, W, H, P);
  const mttrLine = buildLinePath(data.mttr, W, H, P);
  const mttrArea = buildAreaPath(data.mttr, W, H, P);
  const xs = data.labels.map((_, i) => P + (i / (data.labels.length - 1)) * (W - P * 2));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="aIncGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="aMttrGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <path d={mttrArea} fill="url(#aMttrGrad)" />
      <path d={mttrLine} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
      <path d={incArea} fill="url(#aIncGrad)" />
      <path d={incLine} fill="none" stroke="#7dd3fc" strokeWidth="2.5" strokeLinejoin="round" />
      {data.labels.map((l, i) => (
        <text key={l} x={xs[i]} y={H - 4} textAnchor="middle" fontSize="10" fill="#6b7280" fontFamily="Inter,sans-serif">{l}</text>
      ))}
    </svg>
  );
}

/* ── horizontal bar chart ── */
const agentMttr = [
  { name: 'Watcher',      mttr: 0.4,  pct: 95 },
  { name: 'Diagnoser',    mttr: 0.9,  pct: 92 },
  { name: 'Orchestrator', mttr: 0.6,  pct: 98 },
  { name: 'Patcher',      mttr: 1.2,  pct: 88 },
  { name: 'Communicator', mttr: 0.3,  pct: 99 },
];

/* ── donut chart ── */
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = 52; const cx = 70; const cy = 70;
  let angle = -90;
  const paths = segments.map((seg) => {
    const sweep = (seg.value / total) * 360;
    const a1 = (angle * Math.PI) / 180;
    const a2 = ((angle + sweep - 0.5) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(a1); const y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2); const y2 = cy + r * Math.sin(a2);
    const large = sweep > 180 ? 1 : 0;
    angle += sweep;
    return { ...seg, d: `M${cx},${cy} L${x1},${y1} A${r},${r},0,${large},1,${x2},${y2}Z` };
  });
  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg viewBox="0 0 140 140" className="w-28 h-28 flex-shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="#1a1a1a" />
        {paths.map((p) => <path key={p.label} d={p.d} fill={p.color} opacity="0.85" />)}
        <circle cx={cx} cy={cy} r={r * 0.58} fill="#0f0f0f" />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="12" fill="white" fontWeight="700" fontFamily="Inter,sans-serif">{total}</text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize="8" fill="#6b7280" fontFamily="Inter,sans-serif">incidents</text>
      </svg>
      <div className="space-y-2 flex-1 min-w-[120px]">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
              <span className="text-gray-400 text-xs">{s.label}</span>
            </div>
            <span className="text-white text-xs font-semibold">{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const kpiCards = [
  { label: 'Avg. MTTR',        value: '1.8m',  change: -22, unit: 'vs last period', icon: Clock,    color: 'text-[#00e5c3]' },
  { label: 'Incidents / Day',  value: '7.3',   change: -11, unit: 'vs last period', icon: Activity, color: 'text-white' },
  { label: 'Auto-Resolution',  value: '94.7%', change: +3,  unit: 'vs last period', icon: Zap,      color: 'text-[#00e5c3]' },
  { label: 'Uptime SLA',       value: '99.97%',change: +0.02,unit: 'vs last period', icon: Shield,  color: 'text-white' },
];

type Range = '7d' | '30d' | '90d';

const rangeData: Record<Range, typeof weeklyData> = {
  '7d':  weeklyData,
  '30d': monthlyData,
  '90d': quarterData,
};

const resolutionSegments = [
  { label: 'Fully Automated', value: 62, color: '#00e5c3' },
  { label: 'Assisted',        value: 18, color: '#60a5fa' },
  { label: 'Manual',          value: 12, color: '#a78bfa' },
  { label: 'Escalated',       value: 4,  color: '#f97316' },
];

const serviceHealth = [
  { name: 'API Gateway',    score: 99.9, incidents: 2,  trend: 'up'   },
  { name: 'Auth Service',   score: 97.2, incidents: 8,  trend: 'down' },
  { name: 'Redis Cluster',  score: 94.5, incidents: 14, trend: 'down' },
  { name: 'User DB',        score: 99.4, incidents: 3,  trend: 'up'   },
  { name: 'CDN Edge',       score: 99.8, incidents: 1,  trend: 'up'   },
  { name: 'Queue Service',  score: 98.1, incidents: 5,  trend: 'up'   },
];

export default function Analytics() {
  const [range, setRange] = useState<Range>('7d');

  return (
    <div className="min-h-screen bg-[#0f0f0f] pt-[52px] flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full pt-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-white font-extrabold text-2xl sm:text-3xl">Analytics</h1>
            <p className="text-gray-400 text-sm mt-1">System performance, agent efficiency &amp; incident trends.</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Range selector */}
            <div className="flex items-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-0.5">
              {(['7d', '30d', '90d'] as Range[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    range === r ? 'bg-[#2a2a2a] text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#444] text-gray-300 text-sm px-3 py-2 rounded-lg transition-colors">
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full space-y-5 pb-8">
        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {kpiCards.map((c) => {
            const Icon = c.icon;
            const positive = c.change > 0;
            return (
              <div key={c.label} className="card px-4 sm:px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-xs">{c.label}</span>
                  <div className="w-7 h-7 rounded-lg bg-[#111] flex items-center justify-center">
                    <Icon size={14} className="text-gray-500" />
                  </div>
                </div>
                <div className={`text-2xl sm:text-3xl font-bold ${c.color} mb-1`}>{c.value}</div>
                <div className="flex items-center gap-1">
                  {c.change > 0
                    ? <ArrowUp size={11} className="text-green-400" />
                    : <ArrowDown size={11} className="text-red-400" />}
                  <span className={`text-[11px] font-semibold ${c.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {Math.abs(c.change)}{typeof c.change === 'number' && c.change < 2 ? '%' : '%'}
                  </span>
                  <span className="text-gray-600 text-[10px]">{c.unit}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trend chart + Agent MTTR */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px] gap-4 sm:gap-5">
          {/* Trend chart */}
          <div className="card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">Incident Volume &amp; MTTR Trend</h3>
                <p className="text-gray-500 text-xs mt-0.5">Incidents per day vs. mean time to resolve</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7dd3fc]" />
                  <span className="text-gray-400 text-xs">Incidents</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                  <span className="text-gray-400 text-xs">MTTR (min)</span>
                </div>
              </div>
            </div>
            <div className="h-[180px] sm:h-[200px]">
              <TrendChart data={rangeData[range]} />
            </div>
          </div>

          {/* Agent MTTR */}
          <div className="card p-5">
            <h3 className="text-white font-semibold mb-1">Agent Response Time</h3>
            <p className="text-gray-500 text-xs mb-4">Average seconds per action</p>
            <div className="space-y-3.5">
              {agentMttr.map((a) => (
                <div key={a.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-gray-300 text-xs font-medium">{a.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#00e5c3] text-xs font-mono">{a.mttr}s</span>
                      <span className="text-gray-500 text-[10px]">{a.pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#00e5c3] to-[#00b89e] transition-all duration-500"
                      style={{ width: `${a.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resolution breakdown + Service health */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Donut */}
          <div className="card p-5 sm:p-6">
            <h3 className="text-white font-semibold mb-1">Resolution Type Breakdown</h3>
            <p className="text-gray-500 text-xs mb-5">How incidents were resolved this period</p>
            <DonutChart segments={resolutionSegments} />
          </div>

          {/* Service health table */}
          <div className="card p-5 sm:p-6 overflow-x-auto">
            <h3 className="text-white font-semibold mb-1">Service Health Scores</h3>
            <p className="text-gray-500 text-xs mb-4">Uptime &amp; incident count by service</p>
            <table className="w-full min-w-[300px]">
              <thead>
                <tr className="border-b border-[#1e1e1e]">
                  {['Service', 'Score', 'Incidents', 'Trend'].map((h) => (
                    <th key={h} className="text-left text-[10px] text-gray-500 font-semibold tracking-wider pb-2.5 pr-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {serviceHealth.map((s) => (
                  <tr key={s.name} className="border-b border-[#131313]">
                    <td className="py-3 pr-3 text-gray-200 text-sm">{s.name}</td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${s.score >= 99 ? 'bg-[#00e5c3]' : s.score >= 97 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${s.score}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-gray-300">{s.score}%</span>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-gray-400 text-sm font-mono">{s.incidents}</td>
                    <td className="py-3">
                      {s.trend === 'up'
                        ? <div className="flex items-center gap-1 text-green-400"><ArrowUp size={12} /><span className="text-[11px]">Better</span></div>
                        : <div className="flex items-center gap-1 text-red-400"><ArrowDown size={12} /><span className="text-[11px]">Worse</span></div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom: detailed stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'P50 Resolution',  value: '48s',   sub: 'Median incident time'     },
            { label: 'P95 Resolution',  value: '4m 12s',sub: '95th percentile'          },
            { label: 'Longest Outage',  value: '12m 10s',sub: 'DNS Resolution Flaky'    },
          ].map((s) => (
            <div key={s.label} className="card px-5 py-4 flex items-center gap-4">
              <BarChart3 size={20} className="text-gray-600 flex-shrink-0" />
              <div>
                <div className="text-gray-400 text-xs mb-0.5">{s.label}</div>
                <div className="text-white font-bold text-lg font-mono">{s.value}</div>
                <div className="text-gray-600 text-xs">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
