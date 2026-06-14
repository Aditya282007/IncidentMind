import { useState } from 'react';
import {
  Search, Calendar, Download, X, ChevronLeft, ChevronRight,
  AlertTriangle, Info, CheckCircle, Clock, Activity
} from 'lucide-react';

interface HistoryProps {
  onNavigate: (page: 'dashboard' | 'incidents' | 'history' | 'reports' | 'analytics' | 'settings' | 'incident-detail') => void;
}

const allIncidents = [
  {
    id: '#INC-9482',
    title: "CPU Spike Detected on 'Cluster-Delta'",
    subtitle: 'Infrastructure Alert',
    severity: 'Critical',
    status: 'Resolved',
    timestamp: 'Oct 24, 2023 - 14:22:10',
    resolution: '12m 45s',
  },
  {
    id: '#INC-9481',
    title: 'Database Connection Pool Exhaustion',
    subtitle: 'Database Service',
    severity: 'Warning',
    status: 'Investigating',
    timestamp: 'Oct 24, 2023 - 13:05:42',
    resolution: '--',
  },
  {
    id: '#INC-9479',
    title: "Unusual Login Pattern: User 'jsmith'",
    subtitle: 'Security Auth',
    severity: 'Info',
    status: 'Active',
    timestamp: 'Oct 24, 2023 - 11:45:00',
    resolution: '--',
  },
  {
    id: '#INC-9475',
    title: 'API Gateway Latency Increase',
    subtitle: 'Network Edge',
    severity: 'Critical',
    status: 'Resolved',
    timestamp: 'Oct 23, 2023 - 22:15:10',
    resolution: '45m 22s',
  },
  {
    id: '#INC-9472',
    title: "Storage Volume 'Vol-4' Near Capacity",
    subtitle: 'Storage Service',
    severity: 'Warning',
    status: 'Resolved',
    timestamp: 'Oct 23, 2023 - 18:00:00',
    resolution: '3h 14m',
  },
];

const severityConfig: Record<string, { color: string; bg: string; border: string; dot: string }> = {
  Critical: { color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/25', dot: 'bg-red-500' },
  Warning: { color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/25', dot: 'bg-amber-500' },
  Info: { color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/25', dot: 'bg-blue-500' },
};

const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
  Resolved: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  Active: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  Investigating: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
};

type SevFilter = 'Critical' | 'Warning' | 'Info';
type StatusFilter = 'Resolved' | 'Active' | 'Investigating';

export default function History({ onNavigate }: HistoryProps) {
  const [search, setSearch] = useState('');
  const [sevFilters, setSevFilters] = useState<Set<SevFilter>>(new Set(['Critical', 'Warning', 'Info']));
  const [statusFilters, setStatusFilters] = useState<Set<StatusFilter>>(new Set(['Resolved', 'Active', 'Investigating']));
  const [currentPage] = useState(1);

  const toggleSev = (s: SevFilter) => {
    setSevFilters(prev => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  const toggleStatus = (s: StatusFilter) => {
    setStatusFilters(prev => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  const clearAll = () => {
    setSevFilters(new Set(['Critical', 'Warning', 'Info']));
    setStatusFilters(new Set(['Resolved', 'Active', 'Investigating']));
    setSearch('');
  };

  const filtered = allIncidents.filter(inc => {
    const matchSev = sevFilters.has(inc.severity as SevFilter);
    const matchStatus = statusFilters.has(inc.status as StatusFilter);
    const matchSearch = search === '' ||
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.id.toLowerCase().includes(search.toLowerCase());
    return matchSev && matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#05081a] pt-12 pb-16">
      <div className="max-w-6xl mx-auto px-6 pt-8">

        {/* Page header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Incident History</h1>
            <p className="text-sm text-slate-400">Review and audit all past security and performance events.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search incidents..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 rounded bg-[#0c1228] border border-[#1e2d4d] text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 w-52"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded bg-[#0c1228] border border-[#1e2d4d] text-sm text-slate-300 hover:border-cyan-500/30 hover:text-cyan-400 transition-colors">
              <Calendar size={13} />
              Last 30 Days
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded bg-[#0c1228] border border-[#1e2d4d] text-sm text-slate-300 hover:border-cyan-500/30 hover:text-cyan-400 transition-colors">
              <Download size={13} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-5 p-3 rounded-lg bg-[#0c1228] border border-[#1e2d4d]">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Severity */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Severity:</span>
              {(['Critical', 'Warning', 'Info'] as SevFilter[]).map(s => {
                const cfg = severityConfig[s];
                const active = sevFilters.has(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSev(s)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                      active
                        ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                        : 'bg-transparent border-[#1e2d4d] text-slate-600'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${active ? cfg.dot : 'bg-slate-600'}`} />
                    {s}
                  </button>
                );
              })}
            </div>

            <div className="w-px h-5 bg-[#1e2d4d]" />

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status:</span>
              {(['Resolved', 'Active', 'Investigating'] as StatusFilter[]).map(s => {
                const cfg = statusConfig[s];
                const active = statusFilters.has(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                      active
                        ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                        : 'bg-transparent border-[#1e2d4d] text-slate-600'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={10} />
            Clear All Filters
          </button>
        </div>

        {/* Table */}
        <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden mb-5">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e2d4d] bg-[#080d1f]">
                {['Incident ID', 'Title', 'Severity', 'Status', 'Timestamp', 'Resolution'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inc, i) => {
                const sev = severityConfig[inc.severity];
                const stat = statusConfig[inc.status];
                return (
                  <tr
                    key={i}
                    className="border-b border-[#1e2d4d]/50 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    onClick={() => onNavigate('incident-detail')}
                  >
                    <td className="px-4 py-3.5">
                      <span className="text-[12px] font-mono text-slate-300 group-hover:text-cyan-400 transition-colors">
                        {inc.id}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-[12px] font-medium text-white">{inc.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{inc.subtitle}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`flex items-center gap-1.5 w-fit px-2 py-0.5 rounded text-[10px] font-medium border ${sev.bg} ${sev.border} ${sev.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                        {inc.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${stat.bg} ${stat.border} ${stat.color}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                        <Clock size={10} className="text-slate-600" />
                        {inc.timestamp}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[11px] font-mono ${inc.resolution === '--' ? 'text-slate-600' : 'text-green-400'}`}>
                        {inc.resolution}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Showing <span className="text-slate-300">1-10</span> of{' '}
            <span className="text-slate-300">2,492</span> incidents
          </span>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded flex items-center justify-center border border-[#1e2d4d] text-slate-500 hover:border-cyan-500/30 hover:text-cyan-400 transition-colors">
              <ChevronLeft size={13} />
            </button>
            {[1, 2, 3].map(p => (
              <button
                key={p}
                className={`w-7 h-7 rounded text-[12px] font-medium border transition-colors ${
                  p === currentPage
                    ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                    : 'border-[#1e2d4d] text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400'
                }`}
              >
                {p}
              </button>
            ))}
            <span className="text-slate-600 text-[12px] px-1">...</span>
            <button className="w-7 h-7 rounded text-[12px] font-medium border border-[#1e2d4d] text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400 transition-colors">
              258
            </button>
            <button className="w-7 h-7 rounded flex items-center justify-center border border-[#1e2d4d] text-slate-500 hover:border-cyan-500/30 hover:text-cyan-400 transition-colors">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
