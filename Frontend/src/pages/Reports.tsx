import { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import Footer from '../components/Footer';

const statusColors: Record<string, string> = {
  GENERATED:  'bg-green-900/40 text-green-400 border-green-700/40',
  PENDING:    'bg-yellow-900/30 text-yellow-400 border-yellow-700/40',
  PROCESSING: 'bg-blue-900/30 text-blue-400 border-blue-700/40',
  FAILED:     'bg-red-900/30 text-red-400 border-red-700/40',
};

const typeColors: Record<string, string> = {
  'Post-Mortem':   'bg-[#1a1a1a] text-gray-300 border-[#333]',
  'Weekly Digest': 'bg-[#1a0f2e] text-purple-300 border-purple-800/40',
  'SLA Report':    'bg-[#0d2d24] text-[#00e5c3] border-[#00e5c3]/30',
  'Incident Log':  'bg-[#1a1500] text-amber-300 border-amber-800/40',
  'Compliance':    'bg-[#0d1a2d] text-blue-300 border-blue-800/40',
};

const reports = [
  { id: 'RPT-0042', title: 'Redis OOM Recovery — Full Post-Mortem', type: 'Post-Mortem',   date: 'Jun 11, 2026', status: 'GENERATED',  duration: '1m 45s', size: '2.4 MB' },
  { id: 'RPT-0041', title: 'Weekly SRE Digest — Week 23',           type: 'Weekly Digest', date: 'Jun 9, 2026',  status: 'GENERATED',  duration: '—',      size: '1.1 MB' },
  { id: 'RPT-0040', title: 'SSL Certificate Renewal Audit',         type: 'SLA Report',    date: 'Jun 8, 2026',  status: 'GENERATED',  duration: '42s',    size: '890 KB' },
  { id: 'RPT-0039', title: 'DNS Flakiness Root Cause Report',       type: 'Post-Mortem',   date: 'Jun 7, 2026',  status: 'GENERATED',  duration: '12m 10s',size: '3.1 MB' },
  { id: 'RPT-0038', title: 'Q2 Compliance Report — ISO 27001',      type: 'Compliance',    date: 'Jun 5, 2026',  status: 'GENERATED',  duration: '—',      size: '5.7 MB' },
  { id: 'RPT-0037', title: 'Auth Service Degradation Incident Log', type: 'Incident Log',  date: 'Jun 3, 2026',  status: 'GENERATED',  duration: '8m 22s', size: '1.8 MB' },
  { id: 'RPT-0036', title: 'Monthly SLA Report — May 2026',         type: 'SLA Report',    date: 'Jun 1, 2026',  status: 'GENERATED',  duration: '—',      size: '2.2 MB' },
  { id: 'RPT-0035', title: 'Weekly SRE Digest — Week 22',           type: 'Weekly Digest', date: 'May 26, 2026', status: 'GENERATED',  duration: '—',      size: '1.0 MB' },
  { id: 'RPT-0034', title: 'Database Failover Analysis',            type: 'Post-Mortem',   date: 'May 24, 2026', status: 'PENDING',    duration: '3m 01s', size: '—'      },
  { id: 'RPT-0033', title: 'CDN Latency Spike Investigation',       type: 'Incident Log',  date: 'May 22, 2026', status: 'PROCESSING', duration: '5m 47s', size: '—'      },
];

const summaryCards = [
  { label: 'Total Reports',   value: '42',   sub: 'This quarter',    color: 'text-white' },
  { label: 'Auto-Generated',  value: '38',   sub: '90.4% automated', color: 'text-[#00e5c3]' },
  { label: 'Avg. Gen Time',   value: '1.2s', sub: 'Last 30 days',    color: 'text-white' },
  { label: 'Pending',         value: '2',    sub: 'In queue',        color: 'text-yellow-400' },
];

const reportTypes = ['All Types', 'Post-Mortem', 'Weekly Digest', 'SLA Report', 'Incident Log', 'Compliance'];
const statusOptions = ['All Statuses', 'GENERATED', 'PENDING', 'PROCESSING', 'FAILED'];

export default function Reports() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  const filtered = reports.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter   === 'All Types'    || r.type   === typeFilter;
    const matchStatus = statusFilter === 'All Statuses' || r.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="min-h-screen bg-[#0f0f0f] pt-[52px] flex flex-col">
      {/* Page header */}
      <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full pt-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-white font-extrabold text-2xl sm:text-3xl">Reports</h1>
            <p className="text-gray-400 text-sm mt-1">AI-generated incident reports, post-mortems &amp; SLA summaries.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#444] text-gray-300 text-sm px-3 py-2 rounded-lg transition-colors">
              <RefreshCw size={14} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button className="flex items-center gap-2 bg-[#00e5c3] hover:bg-[#00ccad] text-[#0a1f1c] font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
              <Plus size={14} />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full space-y-5 pb-8">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {summaryCards.map((c) => (
            <div key={c.label} className="card px-4 sm:px-5 py-4">
              <div className="text-gray-400 text-xs mb-1.5">{c.label}</div>
              <div className={`text-2xl sm:text-3xl font-bold ${c.color}`}>{c.value}</div>
              <div className="text-gray-600 text-xs mt-1">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 flex-1">
              <Search size={14} className="text-gray-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search reports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none w-full"
              />
            </div>
            {/* Type filter */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none bg-[#111] border border-[#2a2a2a] rounded-lg pl-3 pr-8 py-2 text-sm text-gray-300 outline-none cursor-pointer hover:border-[#444] transition-colors w-full sm:w-auto"
              >
                {reportTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
            {/* Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-[#111] border border-[#2a2a2a] rounded-lg pl-3 pr-8 py-2 text-sm text-gray-300 outline-none cursor-pointer hover:border-[#444] transition-colors w-full sm:w-auto"
              >
                {statusOptions.map((s) => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
            {/* Date range */}
            <button className="flex items-center gap-2 bg-[#111] border border-[#2a2a2a] hover:border-[#444] rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors whitespace-nowrap">
              <Calendar size={14} />
              Last 30 days
              <ChevronDown size={12} />
            </button>
          </div>
        </div>

        {/* Reports table */}
        <div className="card overflow-x-auto">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#1e1e1e]">
            <span className="text-white font-semibold">
              {filtered.length} report{filtered.length !== 1 ? 's' : ''}
            </span>
            <button className="flex items-center gap-1.5 text-gray-400 hover:text-gray-200 text-sm transition-colors">
              <Download size={14} />
              Export all
            </button>
          </div>
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {['Report ID', 'Title', 'Type', 'Date', 'Status', 'Duration', 'Size', ''].map((h) => (
                  <th key={h} className="text-left text-[10px] text-gray-500 font-semibold tracking-wider px-4 sm:px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.id} className={`border-b border-[#131313] hover:bg-[#161616] transition-colors ${i % 2 === 0 ? '' : ''}`}>
                  <td className="px-4 sm:px-5 py-3.5">
                    <span className="text-[#00e5c3] font-mono text-xs font-medium">{row.id}</span>
                  </td>
                  <td className="px-4 sm:px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <FileText size={13} className="text-gray-600 flex-shrink-0" />
                      <span className="text-gray-200 text-sm">{row.title}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-5 py-3.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${typeColors[row.type] ?? 'bg-[#1a1a1a] text-gray-400 border-[#333]'}`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 sm:px-5 py-3.5">
                    <span className="text-gray-400 text-xs whitespace-nowrap">{row.date}</span>
                  </td>
                  <td className="px-4 sm:px-5 py-3.5">
                    <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border ${statusColors[row.status] ?? ''}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-5 py-3.5">
                    <span className="text-gray-400 text-xs font-mono">{row.duration}</span>
                  </td>
                  <td className="px-4 sm:px-5 py-3.5">
                    <span className="text-gray-400 text-xs font-mono">{row.size}</span>
                  </td>
                  <td className="px-4 sm:px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {row.status === 'GENERATED' && (
                        <>
                          <button className="text-gray-500 hover:text-[#00e5c3] transition-colors" title="Download">
                            <Download size={14} />
                          </button>
                          <button className="text-gray-500 hover:text-gray-200 transition-colors" title="Open">
                            <ExternalLink size={14} />
                          </button>
                        </>
                      )}
                      {row.status === 'PROCESSING' && (
                        <RefreshCw size={14} className="text-blue-400 animate-spin" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-500 text-sm">No reports match your filters.</div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
