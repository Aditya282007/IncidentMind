import {
  ArrowLeft,
  BarChart3,
  Database,
  ExternalLink,
  Eye,
  FileText,
  ListFilter,
  Lock,
  Server,
  Settings2,
  Share2,
  Sparkles,
} from 'lucide-react';
import MemoryChart from '../components/MemoryChart';

interface Props {
  onBack: () => void;
}

const timelineItems = [
  { time: '00:00', agent: 'Watcher', agentColor: '#00e5c3', title: 'Latency spike detected', desc: 'Global latency crossed 500ms threshold.' },
  { time: '00:15', agent: 'Diagnoser', agentColor: '#f97316', title: 'OOM state identified', desc: 'Linked latency to Redis node-04 memory.' },
  { time: '00:30', agent: 'Orchestrator', agentColor: '#a78bfa', title: 'Initiated recovery', desc: 'Hard restart and cache eviction sweep.' },
  { time: '01:20', agent: 'Patcher', agentColor: '#60a5fa', title: 'Memory limit adjusted', desc: 'Increased max-memory to 4GB temporarily.' },
  { time: '01:45', agent: 'Communicator', agentColor: '#34d399', title: 'Stability confirmed', desc: 'Internal health checks passed 5/5.' },
];

const serviceImpact = [
  { name: 'API Gateway', icon: Server, status: 'HEALTHY', color: 'green', highlighted: false },
  { name: 'Auth Service', icon: Lock, status: 'DEGRADED', color: 'amber', highlighted: false },
  { name: 'Redis Cluster', icon: Database, status: 'FAILED', color: 'red', highlighted: true },
  { name: 'User DB', icon: ListFilter, status: 'INACTIVE', color: 'gray', highlighted: false },
];

const rawLogs = [
  { time: '[00:30]', cmd: 'EXECUTING node_restart --force', highlight: true },
  { time: '[00:31]', cmd: 'SIGTERM sent to pid 4921', highlight: false },
  { time: '[00:45]', cmd: 'node-04 status: BOOTING', highlight: false },
  { time: '[01:20]', cmd: 'PATCHING config/redis.conf', highlight: true },
  { time: '[01:45]', cmd: 'HEALTH_CHECK: PASS', highlight: false },
];

function CircularProgress({ pct }: { pct: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1f1f1f" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#00e5c3" strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white font-bold text-base sm:text-lg leading-none">{pct}%</span>
        <span className="text-gray-500 text-[9px] sm:text-[10px] mt-0.5">MATCH</span>
      </div>
    </div>
  );
}

function ResolutionTimeline() {
  return (
    <div className="card p-4 sm:p-5">
      <h3 className="text-white font-semibold mb-4 sm:mb-5">Resolution Timeline</h3>
      <div className="relative pl-5 sm:pl-6">
        <div className="absolute left-[7px] top-1 bottom-1 w-px bg-[#2a2a2a]" />
        <div className="space-y-4 sm:space-y-5">
          {timelineItems.map((item, i) => (
            <div key={i} className="relative">
              <div
                className="absolute -left-[18px] sm:-left-[19px] top-0.5 w-3 h-3 rounded-full border-2 bg-[#0f0f0f]"
                style={{ borderColor: item.agentColor }}
              />
              <div className="mb-0.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-gray-500 font-mono">{item.time}</span>
                <span className="text-[11px]" style={{ color: item.agentColor }}>— {item.agent}</span>
              </div>
              <div className="text-white text-sm font-semibold">{item.title}</div>
              <div className="text-gray-400 text-xs mt-0.5">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function IncidentDetail({ onBack }: Props) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] pt-[52px]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-5 sm:py-6">
        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-gray-400 hover:text-gray-200 text-sm transition-colors mb-4 sm:mb-5"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between mb-5 sm:mb-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <h1 className="text-white font-extrabold text-xl sm:text-2xl leading-tight">
                #INC-492: Redis OOM Recovery
              </h1>
              <span className="text-xs font-bold tracking-wider px-2.5 py-1 rounded-full bg-green-900/40 text-green-400 border border-green-700/40 whitespace-nowrap">
                RESOLVED
              </span>
              <span className="text-xs font-bold tracking-wider px-2.5 py-1 rounded-full bg-red-900/30 text-red-400 border border-red-700/40 whitespace-nowrap">
                CRITICAL
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Incident triggered by node-04 memory threshold violation. Resolution time:{' '}
              <strong className="text-white">1m 45s</strong>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 xl:flex-shrink-0">
            <button className="bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#444] text-white text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap">
              <Eye size={14} />
              Review Agent Decisions
            </button>
            <button className="bg-[#00e5c3] hover:bg-[#00ccad] text-[#0a1f1c] text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap">
              <FileText size={14} />
              View Post-Mortem
            </button>
          </div>
        </div>

        {/* Main grid — stacks on mobile, side-by-side on xl */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 sm:gap-5">
          {/* Left column */}
          <div className="space-y-4 sm:space-y-5">
            {/* AI Root Cause Analysis */}
            <div className="card p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#00e5c3] flex-shrink-0" />
                    <h2 className="text-white font-semibold text-sm sm:text-base">AI Root Cause Analysis</h2>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">Autonomous diagnosis completed in 15 seconds.</p>
                </div>
                <CircularProgress pct={98} />
              </div>
              <div className="bg-[#111] border border-[#2a2a2a] rounded-lg p-4 sm:p-5 mt-2">
                <p className="text-gray-300 text-xs sm:text-sm leading-loose italic">
                  "Memory exhaustion detected in{' '}
                  <code className="text-[#00e5c3] bg-[#0d2d24] px-1.5 py-0.5 rounded text-xs not-italic font-mono">
                    Redis Cluster node-04
                  </code>{' '}
                  due to an unexpected surge in session data keys originating from the Auth Service (v2.4.1).
                  Latency spike correlated with a misconfigured TTL policy on the session-store namespace."
                </p>
              </div>
            </div>

            {/* Service Impact Map */}
            <div className="card p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <Sparkles size={16} className="text-[#00e5c3]" />
                <h2 className="text-white font-semibold text-sm sm:text-base">Service Impact Map</h2>
              </div>
              <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {serviceImpact.map((svc) => {
                    const Icon = svc.icon;
                    return (
                      <div key={svc.name} className="flex flex-col items-center gap-2 sm:gap-3">
                        <div
                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center border ${
                            svc.highlighted
                              ? 'bg-red-950/20 border-red-600/60'
                              : 'bg-[#1a1a1a] border-[#2a2a2a]'
                          }`}
                        >
                          <Icon
                            size={22}
                            className={svc.highlighted ? 'text-red-400' : 'text-gray-400'}
                          />
                        </div>
                        <div className="text-center">
                          <div className={`text-xs font-medium mb-1.5 ${svc.highlighted ? 'text-red-400' : 'text-gray-300'}`}>
                            {svc.name}
                          </div>
                          <span
                            className={`text-[9px] font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded ${
                              svc.color === 'green'
                                ? 'bg-green-900/40 text-green-400'
                                : svc.color === 'amber'
                                ? 'bg-amber-900/40 text-amber-400'
                                : svc.color === 'red'
                                ? 'bg-red-900/40 text-red-400'
                                : 'bg-[#1a1a1a] text-gray-500'
                            }`}
                          >
                            {svc.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Memory Chart + Raw Logs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div className="card p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00e5c3] animate-pulse" />
                    <span className="text-white text-sm font-medium">Memory Usage (node-04)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#1a1a1a] border border-[#333] text-gray-300 px-2 py-0.5 rounded font-mono">
                      LIVE
                    </span>
                    <span className="text-red-400 text-xs font-semibold">98.4% Max</span>
                  </div>
                </div>
                <div className="h-24 sm:h-28">
                  <MemoryChart />
                </div>
              </div>

              <div className="card p-4 sm:p-5">
                <h3 className="text-white text-sm font-medium mb-3">Raw Agent Logs</h3>
                <div className="space-y-1.5 font-mono text-xs overflow-x-auto">
                  {rawLogs.map((l, i) => (
                    <div key={i} className={`whitespace-nowrap ${l.highlight ? 'text-[#00e5c3]' : 'text-gray-300'}`}>
                      <span className="text-gray-600 mr-1">{l.time}</span>
                      {l.cmd}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <ResolutionTimeline />

            {/* Export */}
            <button className="card w-full p-4 flex items-center gap-3 hover:border-[#444] transition-colors group">
              <div className="w-8 h-8 bg-[#111] rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText size={15} className="text-gray-400 group-hover:text-gray-200 transition-colors" />
              </div>
              <span className="text-gray-300 text-sm group-hover:text-white transition-colors flex-1 text-left">
                Export PDF Report
              </span>
              <ExternalLink size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors flex-shrink-0" />
            </button>

            {/* Share */}
            <button className="card w-full p-4 flex items-center gap-3 hover:border-[#444] transition-colors group">
              <div className="w-8 h-8 bg-[#111] rounded-lg flex items-center justify-center flex-shrink-0">
                <Share2 size={15} className="text-gray-400 group-hover:text-gray-200 transition-colors" />
              </div>
              <span className="text-gray-300 text-sm group-hover:text-white transition-colors flex-1 text-left">
                Share with Team
              </span>
              <ExternalLink size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors flex-shrink-0" />
            </button>

            {/* Automation Insight */}
            <div className="relative rounded-xl p-4 sm:p-5 overflow-hidden bg-gradient-to-br from-[#1a0f2e] to-[#120c22] border border-[#2d1f50]">
              <div className="relative z-10">
                <h3 className="text-white font-bold mb-2">Automation Insight</h3>
                <p className="text-gray-300 text-xs leading-relaxed">
                  This recovery prevented an estimated 14 minutes of total downtime, saving approx.{' '}
                  <strong className="text-[#00e5c3]">$1,240</strong> in SLA penalties.
                </p>
              </div>
              <div className="absolute bottom-2 right-3 opacity-10">
                <BarChart3 size={64} className="text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
