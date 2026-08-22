import { useState, useEffect } from 'react';
import {
  Search, Calendar, Download, X, ChevronLeft, ChevronRight,
  AlertTriangle, Info, CheckCircle, Clock, Activity,
  RefreshCw, Filter
} from 'lucide-react';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? 'http://localhost:3001';

interface HistoryProps {
  onNavigate: (page: 'dashboard' | 'incidents' | 'history' | 'reports' | 'analytics' | 'settings' | 'incident-detail') => void;
}

interface Incident {
  incidentId: string;
  title: string;
  severity: string;
  status: string;
  service: string;
  triggeredAt: string;
  resolvedAt?: string;
  mttrSeconds?: number;
}

interface HistoryResponse {
  incidents: Incident[];
  total: number;
  page: number;
  limit: number;
}

const severityConfig: Record<string, { color: string; bg: string; border: string; dot: string }> = {
  Critical: { color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/25', dot: 'bg-red-500' },
  High: { color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/25', dot: 'bg-amber-500' },
  Medium: { color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/25', dot: 'bg-blue-500' },
  Low: { color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/25', dot: 'bg-green-500' },
  critical: { color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/25', dot: 'bg-red-500' },
  high: { color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/25', dot: 'bg-amber-500' },
  medium: { color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/25', dot: 'bg-blue-500' },
  low: { color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/25', dot: 'bg-green-500' },
};

const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
  Resolved: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  OPEN: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  RESOLVED: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  IN_PROGRESS: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  Active: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  Investigating: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
};

type SevFilter = 'Critical' | 'High' | 'Medium' | 'Low' | 'critical' | 'high' | 'medium' | 'low';
type StatusFilter = 'Resolved' | 'OPEN' | 'RESOLVED' | 'IN_PROGRESS' | 'Active' | 'Investigating';

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).replace(',', ' -');
}

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

function getSeverityLabel(severity: string): SevFilter {
  const s = severity.toLowerCase();
  if (s === 'critical') return 'Critical';
  if (s === 'high') return 'High';
  if (s === 'medium') return 'Medium';
  if (s === 'low') return 'Low';
  return severity as SevFilter;
}

function getStatusLabel(status: string): StatusFilter {
  const s = status.toUpperCase();
  if (s === 'RESOLVED') return 'Resolved';
  if (s === 'OPEN') return 'Active';
  if (s === 'IN_PROGRESS') return 'Investigating';
  return status as StatusFilter;
}

export default function History({ onNavigate }: HistoryProps) {
  const [search, setSearch] = useState('');
  const [sevFilters, setSevFilters] = useState<Set<SevFilter>>(new Set(['Critical', 'High', 'Medium', 'Low', 'critical', 'high', 'medium', 'low']));
  const [statusFilters, setStatusFilters] = useState<Set<StatusFilter>>(new Set(['Resolved', 'OPEN', 'RESOLVED', 'IN_PROGRESS', 'Active', 'Investigating']));
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Convert to 1-based page for backend
      const backendPage = currentPage + 1;
      const params = new URLSearchParams({
        page: backendPage.toString(),
        limit: limit.toString(),
      });
      if (search) params.append('search', search);
      
      // Add severity filters - send as array
      const selectedSeverities = Array.from(sevFilters);
      if (selectedSeverities.length > 0 && selectedSeverities.length < 8) {
        selectedSeverities.forEach(s => params.append('severity', s));
      }
      
      // Add status filters - send as array
      const selectedStatuses = Array.from(statusFilters);
      if (selectedStatuses.length > 0 && selectedStatuses.length < 6) {
        selectedStatuses.forEach(s => params.append('status', s));
      }
      
      const response = await fetch(`${BACKEND_URL}/api/history?${params}`);
      if (!response.ok) throw new Error('Failed to fetch history');
      
      const data: HistoryResponse = await response.json();
      setIncidents(data.incidents);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIncidents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentPage, search, sevFilters, statusFilters]);

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
    setSevFilters(new Set(['Critical', 'High', 'Medium', 'Low', 'critical', 'high', 'medium', 'low']));
    setStatusFilters(new Set(['Resolved', 'OPEN', 'RESOLVED', 'IN_PROGRESS', 'Active', 'Investigating']));
    setSearch('');
    setCurrentPage(1);
  };

  const filtered = incidents.filter(inc => {
    const sevLabel = getSeverityLabel(inc.severity);
    const statusLabel = getStatusLabel(inc.status);
    const matchSev = sevFilters.has(sevLabel);
    const matchStatus = statusFilters.has(statusLabel);
    const matchSearch = search === '' ||
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.incidentId.toLowerCase().includes(search.toLowerCase());
    return matchSev && matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(total / limit);

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
            <button 
              onClick={fetchHistory}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded bg-[#0c1228] border border-[#1e2d4d] text-sm text-slate-300 hover:border-cyan-500/30 hover:text-cyan-400 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Refresh
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
              {(['Critical', 'High', 'Medium', 'Low'] as SevFilter[]).map(s => {
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

        {/* Loading/Error */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Loading history...</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="border border-red-500/30 bg-red-500/5 rounded-lg p-4 mb-5">
            <p className="text-red-400 text-sm">Error: {error}</p>
            <button onClick={fetchHistory} className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm underline">Retry</button>
          </div>
        )}

        {/* Table */}
        {!loading && <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden mb-5">
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    No incidents found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((inc, i) => {
                  const sevLabel = getSeverityLabel(inc.severity);
                  const statusLabel = getStatusLabel(inc.status);
                  const sev = severityConfig[sevLabel];
                  const stat = statusConfig[statusLabel];
                  return (
                    <tr
                      key={inc.incidentId}
                      className="border-b border-[#1e2d4d]/50 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                      onClick={() => onNavigate('incident-detail')}
                    >
                      <td className="px-4 py-3.5">
                        <span className="text-[12px] font-mono text-slate-300 group-hover:text-cyan-400 transition-colors">
                          #{inc.incidentId}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-[12px] font-medium text-white">{inc.title}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{inc.service}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`flex items-center gap-1.5 w-fit px-2 py-0.5 rounded text-[10px] font-medium border ${sev.bg} ${sev.border} ${sev.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                          {sevLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${stat.bg} ${stat.border} ${stat.color}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                          <Clock size={10} className="text-slate-600" />
                          {formatTimestamp(inc.triggeredAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[11px] font-mono ${inc.mttrSeconds ? 'text-green-400' : 'text-slate-600'}`}>
                          {formatMttr(inc.mttrSeconds)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>}

        {/* Pagination */}
        {!loading && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Showing <span className="text-slate-300">{filtered.length > 0 ? (currentPage - 1) * limit + 1 : 0}</span> to <span className="text-slate-300">{(currentPage - 1) * limit + filtered.length}</span> of{' '}
              <span className="text-slate-300">{total}</span> incidents
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 rounded flex items-center justify-center border border-[#1e2d4d] text-slate-500 hover:border-cyan-500/30 hover:text-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded text-[12px] font-medium border transition-colors ${
                      pageNum === currentPage
                        ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                        : 'border-[#1e2d4d] text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <span className="text-slate-600 text-[12px] px-1">...</span>
              )}
              {totalPages > 5 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-7 h-7 rounded text-[12px] font-medium border border-[#1e2d4d] text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400 transition-colors"
                >
                  {totalPages}
                </button>
              )}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 rounded flex items-center justify-center border border-[#1e2d4d] text-slate-500 hover:border-cyan-500/30 hover:text-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}