import {
  Eye, MessageSquare, Search, Wrench, Download, Share2,
  RotateCcw, ChevronRight, Copy, CheckSquare, Square,
  Clock, AlertTriangle, CheckCircle, ExternalLink, MessageCircle
} from 'lucide-react';

interface IncidentDetailProps {
  onNavigate: (page: 'dashboard' | 'incidents' | 'history' | 'reports' | 'analytics' | 'settings' | 'incident-detail') => void;
}

const evidenceRows = [
  { time: '14:21:09 AM', source: 'worker-code-A4', msg: 'CPU usage 98.2% on core 4...', level: 'CRT' },
  { time: '14:21:09', source: 'api-server-2', msg: 'Response time latency > 320ms', level: 'WARN' },
  { time: '14:21:09 AM', source: 'orchestrator', msg: 'Initiating service restart on pod-7b3', level: 'INFO' },
];

const levelColor = (l: string) => {
  if (l === 'CRT') return 'text-red-400 bg-red-500/10 border-red-500/25';
  if (l === 'WARN') return 'text-amber-400 bg-amber-500/10 border-amber-500/25';
  return 'text-blue-400 bg-blue-500/10 border-blue-500/25';
};

function ProgressRing({ pct }: { pct: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={56} height={56} className="-rotate-90">
      <circle cx={28} cy={28} r={r} fill="none" stroke="#1e2d4d" strokeWidth={4} />
      <circle
        cx={28} cy={28} r={r}
        fill="none"
        stroke="#22d3ee"
        strokeWidth={4}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      <text
        x={28} y={28}
        textAnchor="middle"
        dominantBaseline="middle"
        className="rotate-90"
        style={{ fontSize: 10, fill: '#22d3ee', fontFamily: 'JetBrains Mono', transform: 'rotate(90deg)', transformOrigin: '28px 28px' }}
      >
        {pct}%
      </text>
    </svg>
  );
}

export default function IncidentDetail({ onNavigate }: IncidentDetailProps) {
  return (
    <div className="min-h-screen bg-[#05081a] pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-6 pt-5">

        {/* Breadcrumb + actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
            <button
              onClick={() => onNavigate('incidents')}
              className="hover:text-cyan-400 transition-colors"
            >
              INCIDENTS
            </button>
            <ChevronRight size={10} />
            <span className="text-slate-300">INCIDENT-001</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#1e2d4d] text-slate-300 text-[11px] hover:border-cyan-500/30 hover:text-cyan-400 transition-colors">
              <Download size={11} />
              Export PDF
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#1e2d4d] text-slate-300 text-[11px] hover:border-cyan-500/30 hover:text-cyan-400 transition-colors">
              <Share2 size={11} />
              Share Report
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-amber-500/30 text-amber-400 text-[11px] hover:bg-amber-500/10 transition-colors">
              <RotateCcw size={11} />
              Reopen Incident
            </button>
          </div>
        </div>

        {/* Incident header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">CPU Spike Detected</h1>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-[10px] font-semibold">
              <CheckCircle size={9} />
              Resolved
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-semibold">
              <AlertTriangle size={9} />
              Critical
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
            <span>Incident-001</span>
            <span className="text-slate-600">•</span>
            <Clock size={10} />
            <span>Oct 24, 2023 - 14:22:10 UTC</span>
            <span className="text-slate-600">•</span>
            <span>Resolution Time: <span className="text-green-400">12m 45s</span></span>
          </div>
        </div>

        {/* Agent cards 2x2 */}
        <div className="grid grid-cols-2 gap-4 mb-5">

          {/* Watcher Analysis */}
          <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                  <Eye size={15} className="text-cyan-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Watcher Analysis</div>
                  <div className="text-[10px] text-slate-500">Automated Ingestion & Monitoring</div>
                </div>
              </div>
              <ProgressRing pct={98} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3 text-[10px]">
              <div>
                <div className="text-slate-500 uppercase tracking-wider mb-1">Affected Components</div>
                <div className="text-slate-300 font-mono">api-server-2</div>
                <div className="text-slate-300 font-mono">worker-make-40</div>
              </div>
              <div>
                <div className="text-slate-500 uppercase tracking-wider mb-1">Threshold Violation</div>
                <div className="text-red-400 font-mono">CPU Saturation &gt; 95%</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Detected sustained CPU saturation across multiple clusters. The primary spike originated from
              worker-code-A4, causing cascade latency in the api-server-2 load balancer group. Metrics indicate
              a non-linear growth in execution time for the processing queue.
            </p>
          </div>

          {/* Communicator */}
          <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                <MessageSquare size={15} className="text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Communicator</div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle size={9} className="text-slate-500" />
                  <span className="text-[10px] text-slate-500">Slack Message Preview</span>
                </div>
              </div>
            </div>
            <div className="rounded bg-[#080d1f] border border-[#1e2d4d] p-3 mb-3">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-3 h-3 rounded-sm bg-[#611f69]" />
                <span className="text-[10px] text-slate-500 font-mono">Slack #incidents</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                *CRITICAL: CPU Spike on api-server-2 has been mitigated. Service restarted and scaled.*
              </p>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Actions Log</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle size={11} className="text-green-400 shrink-0" />
                  <span className="text-slate-300">Automated post-mortem generated.</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle size={11} className="text-green-400 shrink-0" />
                  <span className="text-slate-300">Updated INC-002 with leak patterns.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnoser */}
          <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <Search size={15} className="text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Diagnoser</div>
                <div className="text-[10px] text-slate-500">Root Cause Investigation</div>
              </div>
            </div>
            <div className="mb-3">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Root Cause</div>
              <div className="text-sm font-semibold text-amber-400 font-mono">Memory leak in worker-service-v2.1</div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                High concurrent requests combined with inefficient garbage collection cycles lead to
                heap exhaustion.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[10px] mb-3">
              <div>
                <div className="text-slate-500 uppercase tracking-wider mb-1">Impacted Service</div>
                <div className="text-slate-300 font-mono">worker-service</div>
              </div>
              <div>
                <div className="text-slate-500 uppercase tracking-wider mb-1">Likely Impact</div>
                <div className="text-amber-400 font-mono">Service Latency</div>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Investigation Steps</div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <CheckSquare size={11} className="text-green-400 shrink-0" />
                  <span className="text-slate-300">Heap dump analysis completed</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Square size={11} className="text-slate-600 shrink-0" />
                  <span className="text-slate-500">Thread stack trace inspection</span>
                </div>
              </div>
            </div>
          </div>

          {/* Patcher */}
          <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                <Wrench size={15} className="text-green-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Patcher</div>
                <div className="text-[10px] text-slate-500">Mitigation & Remediation</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[10px] mb-3">
              <div>
                <div className="text-slate-500 uppercase tracking-wider mb-1">Est. Remediation Time</div>
                <div className="text-cyan-400 font-mono text-base font-bold">2m 45s</div>
              </div>
              <div>
                <div className="text-slate-500 uppercase tracking-wider mb-1">Risk Level</div>
                <div className="text-green-400 font-mono">Low (Auto)</div>
              </div>
            </div>
            <div className="mb-3">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Recommended Commands</div>
              <div className="relative rounded bg-[#080d1f] border border-[#1e2d4d] p-2.5">
                <pre className="text-[10px] text-slate-300 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`kubectl rollout restart deployment/worker-service
hpa scale up --min-h`}
                </pre>
                <button className="absolute top-2 right-2 p-1 rounded hover:bg-white/5 transition-colors">
                  <Copy size={10} className="text-slate-500" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[10px]">
              <div>
                <div className="text-slate-500 uppercase tracking-wider mb-1">Fix Type</div>
                <div className="text-slate-300">Automated Scaling</div>
              </div>
              <div>
                <div className="text-slate-500 uppercase tracking-wider mb-1">Rollback Plan</div>
                <div className="text-amber-400 font-mono">Revert to v2.0-stable</div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Evidence */}
        <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e2d4d]">
            <span className="text-[11px] font-semibold text-slate-200 uppercase tracking-wider">Related Evidence</span>
            <button className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors">
              <ExternalLink size={10} />
              View full log
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e2d4d]">
                {['Timestamp', 'Source', 'Message', 'Level'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {evidenceRows.map((row, i) => (
                <tr key={i} className="border-b border-[#1e2d4d]/50 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-2.5 text-[11px] font-mono text-slate-400">{row.time}</td>
                  <td className="px-4 py-2.5 text-[11px] font-mono text-cyan-400">{row.source}</td>
                  <td className="px-4 py-2.5 text-[11px] text-slate-300">{row.msg}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${levelColor(row.level)}`}>
                      {row.level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Floating action button */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => onNavigate('reports')}
            className="w-10 h-10 rounded-full bg-cyan-500 hover:bg-cyan-400 shadow-lg shadow-cyan-500/25 flex items-center justify-center transition-colors"
          >
            <ChevronRight size={18} className="text-[#05081a]" />
          </button>
        </div>
      </div>
    </div>
  );
}
