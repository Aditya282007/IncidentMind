import { useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  Download,
  Eye,
  ExternalLink,
  Filter,
  FlaskConical,
  MessageSquare,
  Settings2,
  Wrench,
} from 'lucide-react';
import AnalyticsChart from '../components/AnalyticsChart';
import Footer from '../components/Footer';

interface Props {
  onViewIncident: () => void;
}

const agentSteps = [
  { name: 'Watcher', status: 'COMPLETED', icon: Eye },
  { name: 'Diagnoser', status: 'COMPLETED', icon: FlaskConical },
  { name: 'Orchestrator', status: 'ANALYZING ROOT CAUSE', icon: Settings2 },
  { name: 'Patcher', status: 'UPCOMING', icon: Wrench },
  { name: 'Communicator', status: 'UPCOMING', icon: MessageSquare },
];

const feedItems = [
  { ago: '02m ago', agent: 'Watcher', color: '#00e5c3', msg: 'Detected abnormal CPU usage (95%) on api-server-2.' },
  { ago: '01m ago', agent: 'Diagnoser', color: '#f97316', msg: 'Likely memory leak in authentication service identified.' },
  { ago: 'Just now', agent: 'Orchestrator', color: '#a78bfa', msg: 'Evaluating risk of service restart vs. hot-patching.' },
  { ago: '15m ago', agent: 'Patcher', color: '#60a5fa', msg: 'System integrity check passed after incident #482.' },
  { ago: '22m ago', agent: 'Watcher', color: '#00e5c3', msg: 'Memory threshold alert cleared on db-cluster-1.' },
];

const logLines = [
  "> Fetching metrics for 'api-server-2' [CPU_LOAD, MEM_USAGE, GC_PAUSE]",
  '> Cross-referencing deployment logs with spike onset (14:22:10 UTC)',
  '> Identifying potential leak in AuthModule.validateToken()',
  '> Initiating snapshot analysis...',
];

const incidentHistory = [
  { id: '#INC-492', title: 'Redis OOM Recovery', status: 'RESOLVED', statusColor: 'green', duration: '1m 45s' },
  { id: '#INC-491', title: 'SSL Cert Expiry Auto-renew', status: 'RESOLVED', statusColor: 'green', duration: '42s' },
  { id: '#INC-490', title: 'DNS Resolution Flaky', status: 'MANUAL', statusColor: 'purple', duration: '12m 10s' },
];

const statCards = [
  { label: 'Active Incidents', value: '2', color: 'text-white' },
  { label: 'Resolved Today', value: '45', color: 'text-[#00e5c3]' },
  { label: 'MTTR Reduction', value: '78%', color: 'text-white' },
  { label: 'Agent Success Rate', value: '99.2%', color: 'text-[#a78bfa]' },
];

function ElapsedTimer() {
  const [elapsed, setElapsed] = useState(262);
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const s = String(elapsed % 60).padStart(2, '0');
  return <span className="font-mono text-lg sm:text-2xl text-white tabular-nums">00:{m}:{s}</span>;
}

function LogTerminal() {
  const [cursor, setCursor] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setCursor((c) => !c), 600);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg p-3 sm:p-4 font-mono text-xs leading-relaxed overflow-x-auto">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-[#00e5c3] animate-pulse flex-shrink-0" />
        <span className="text-[#00e5c3] font-semibold">Orchestrator Logs</span>
      </div>
      <div className="min-w-max sm:min-w-0 space-y-1">
        {logLines.map((l, i) => (
          <div key={i} className="text-gray-300 whitespace-nowrap sm:whitespace-normal">{l}</div>
        ))}
        <div className="text-gray-400">{cursor ? '_' : '\u00a0'}</div>
      </div>
    </div>
  );
}

export default function Dashboard({ onViewIncident }: Props) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] pt-[52px] flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center text-center px-4 sm:px-6 pt-10 sm:pt-14 md:pt-16 pb-10 md:pb-14">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-[1.15] max-w-3xl">
          AI Agents Resolving Production
          <br className="hidden sm:block" />
          {' '}Incidents{' '}
          <span className="text-[#00e5c3]">Before Humans Wake Up</span>
        </h1>
        <p className="text-gray-400 mt-4 sm:mt-5 text-sm sm:text-base max-w-xl leading-relaxed px-2">
          Monitor, diagnose, patch, and communicate incidents autonomously using
          coordinated multi-agent LLM systems integrated with your cloud stack.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 sm:mt-8 w-full sm:w-auto">
          <button className="w-full sm:w-auto bg-[#00e5c3] hover:bg-[#00ccad] transition-colors text-[#0a1f1c] font-semibold px-6 py-2.5 rounded-lg text-sm">
            Trigger Demo Incident
          </button>
          <button
            onClick={onViewIncident}
            className="w-full sm:w-auto bg-transparent border border-[#333] hover:border-[#555] text-white font-medium px-6 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Eye size={15} />
            View Live Incident
          </button>
        </div>
      </section>

      {/* Stat Cards */}
      <section className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="card px-4 sm:px-6 py-4 sm:py-5">
              <div className="text-gray-400 text-xs sm:text-sm mb-1.5 sm:mb-2">{card.label}</div>
              <div className={`text-2xl sm:text-3xl font-bold ${card.color}`}>{card.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Incident + Activity Feed */}
      <section className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full mt-5 sm:mt-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px] gap-4 sm:gap-5">
        {/* Live Incident Command Center */}
        <div className="card p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              <h2 className="text-white font-bold text-base sm:text-lg">Live Incident Command Center</h2>
            </div>
            <span className="text-xs border border-red-700/60 text-red-400 bg-red-950/30 px-3 py-1 rounded-full whitespace-nowrap">
              Priority: Critical
            </span>
          </div>
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5c3]" />
            <span className="text-gray-400 text-xs sm:text-sm">Active Orchestration Flow</span>
          </div>

          {/* Incident info box */}
          <div className="bg-[#111] border border-[#2a2a2a] rounded-lg px-4 sm:px-5 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3 mb-5 sm:mb-6">
            <div>
              <div className="text-white font-semibold text-sm">CPU Spike Detected</div>
              <div className="text-gray-500 text-xs mt-1 font-mono">
                Target: <span className="text-[#00e5c3]">api-server-2.production.cloud</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-500 text-xs mb-1">Time Elapsed</div>
              <ElapsedTimer />
            </div>
          </div>

          {/* Agent flow — horizontally scrollable on small screens */}
          <div className="overflow-x-auto -mx-1 px-1 mb-5 sm:mb-6">
            <div className="relative flex items-start justify-between min-w-[420px] sm:min-w-0 px-2 sm:px-4">
              {/* connecting line */}
              <div className="absolute top-[26px] left-[14%] right-[14%] h-px bg-[#2a2a2a]" />
              <div className="absolute top-[26px] left-[14%] w-[37%] h-px bg-[#00e5c3]" />

              {agentSteps.map((step) => {
                const isCompleted = step.status === 'COMPLETED';
                const isActive = step.status === 'ANALYZING ROOT CAUSE';
                const Icon = step.icon;
                return (
                  <div key={step.name} className="flex flex-col items-center z-10 w-[18%]">
                    <div
                      className={`w-11 h-11 sm:w-[52px] sm:h-[52px] rounded-xl flex items-center justify-center mb-2 border transition-all ${
                        isCompleted
                          ? 'bg-[#0d2d24] border-[#00e5c3]/40'
                          : isActive
                          ? 'bg-[#0d2d24] border-[#00e5c3] agent-active'
                          : 'bg-[#1a1a1a] border-[#2a2a2a]'
                      }`}
                    >
                      <Icon
                        size={18}
                        className={isCompleted || isActive ? 'text-[#00e5c3]' : 'text-gray-600'}
                      />
                    </div>
                    <div
                      className={`text-[10px] sm:text-xs font-semibold text-center ${
                        isActive ? 'text-[#00e5c3]' : isCompleted ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </div>
                    <div
                      className={`text-[9px] sm:text-[10px] font-medium tracking-wide mt-0.5 text-center leading-tight ${
                        isCompleted || isActive ? 'text-[#00e5c3]' : 'text-gray-600'
                      }`}
                    >
                      {step.status}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <LogTerminal />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* Agent Activity Feed */}
          <div className="card p-4 sm:p-5 flex-1">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-white font-semibold text-sm">Agent Activity Feed</h3>
              <button className="text-gray-500 hover:text-gray-300 transition-colors">
                <BarChart3 size={16} />
              </button>
            </div>
            <div className="space-y-2 sm:space-y-2.5">
              {feedItems.map((item, i) => (
                <div
                  key={i}
                  className={`bg-[#111] border rounded-lg p-2.5 sm:p-3 ${
                    i === 2 ? 'border-[#00e5c3]/30' : 'border-[#222]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5">
                    <span className="text-gray-500 text-[10px]">{item.ago}</span>
                    <span className="text-[10px]" style={{ color: item.color }}>{item.agent}</span>
                  </div>
                  <p className="text-gray-300 text-xs leading-snug">{item.msg}</p>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="card p-4 sm:p-5">
            <div className="text-gray-400 text-[10px] font-semibold tracking-widest uppercase mb-3">
              System Health
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex-1 h-2 bg-[#1a1a1a] rounded-full overflow-hidden mr-3">
                <div className="h-full rounded-full bg-gradient-to-r from-[#00e5c3] to-[#00b89e]" style={{ width: '98%' }} />
              </div>
              <span className="text-[#00e5c3] text-sm font-semibold">98%</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500">NODE CLUSTERS</span>
              <span className="text-[#00e5c3] font-medium">STABLE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics + Incident History */}
      <section className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full mt-4 sm:mt-5 mb-6 sm:mb-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div className="h-[300px] sm:h-[340px]">
          <AnalyticsChart />
        </div>

        {/* Incident History */}
        <div className="card p-4 sm:p-6 overflow-x-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h3 className="text-white font-semibold text-base">Incident History</h3>
            <div className="flex items-center gap-2">
              <button className="text-gray-400 hover:text-gray-200 transition-colors">
                <Filter size={15} />
              </button>
              <button className="text-gray-400 hover:text-gray-200 transition-colors">
                <Download size={15} />
              </button>
            </div>
          </div>

          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-[#1e1e1e]">
                {['INCIDENT ID', 'TITLE', 'STATUS', 'DURATION', 'ACTION'].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] text-gray-500 font-semibold tracking-wider pb-3 pr-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {incidentHistory.map((row) => (
                <tr key={row.id} className="border-b border-[#1a1a1a]">
                  <td className="py-3 sm:py-4 pr-3">
                    <span className="text-[#00e5c3] text-sm font-mono font-medium">{row.id}</span>
                  </td>
                  <td className="py-3 sm:py-4 pr-3">
                    <span className="text-gray-200 text-sm whitespace-nowrap">{row.title}</span>
                  </td>
                  <td className="py-3 sm:py-4 pr-3">
                    <span
                      className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded whitespace-nowrap ${
                        row.statusColor === 'green'
                          ? 'bg-green-900/40 text-green-400 border border-green-700/40'
                          : 'bg-purple-900/40 text-purple-400 border border-purple-700/40'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 sm:py-4 pr-3">
                    <span className="text-gray-300 text-sm font-mono whitespace-nowrap">{row.duration}</span>
                  </td>
                  <td className="py-3 sm:py-4">
                    <button className="text-gray-400 hover:text-gray-200 transition-colors">
                      <ExternalLink size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Footer />
    </div>
  );
}
