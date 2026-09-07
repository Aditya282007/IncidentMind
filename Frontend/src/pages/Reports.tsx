import { useState } from 'react';
import {
  FileText, Download, Share2, ChevronRight, CheckCircle,
  AlertTriangle, BookOpen, MessageSquare, Zap, Search,
  Wrench, BarChart2, Eye, Clock, Layers, HelpCircle, Play,
  Copy, Shield, Server, Database, Lock, Activity,
  TrendingDown, ExternalLink, GitBranch, Star, RefreshCw
} from 'lucide-react';

type ReportTab = 'overview' | 'root-cause' | 'patch' | 'communications' | 'runbook';

interface ReportsProps {
  onNavigate: (page: 'dashboard' | 'incidents' | 'history' | 'reports' | 'analytics' | 'settings' | 'incident-detail') => void;
}

interface ReportRecord {
  id: string;
  incidentId: string;
  title: string;
  date: string;
  severity: string;
  status: 'resolved' | 'open' | 'investigating';
  component: string;
  icon: React.ReactNode;
  data: {
    resolution: string; severity: string; nodesAffected: string;
    description: string;
    rootCause: string; confidence: number;
    contributingFactors: string[];
    suggestedInvestigation: string[];
    fix: string; fixType: string; commands: string[];
    estimatedTime: string; riskLevel: string; rollback: string;
    slackMessage: string; emailSubject: string; emailBody: string;
    channels: string[];
    runbookSteps: string[]; aiInsight: string;
  };
}

const REPORTS: ReportRecord[] = [
  {
    id: 'RPT-001', incidentId: 'incident-001', title: 'CPU Spike — api-server-2',
    date: 'Jun 11, 2026', severity: 'critical', status: 'resolved', component: 'api-server-2',
    icon: <Server size={14} className="text-red-400" />,
    data: {
      resolution: '2m 14s', severity: 'Critical', nodesAffected: '1',
      description: 'CPU usage exceeded 95% for 5 minutes on api-server-2, peaking at 97%. Risk of cascading failures across load balancer cluster. Approximately 12k concurrent users affected.',
      rootCause: 'High CPU usage on api-server-2 due to inefficient request processing — heap allocator GC cycle deadlock in worker-service-v2.1 thread pool handler #4.',
      confidence: 0.95,
      contributingFactors: ['CPU utilization at 97% — resource exhaustion', 'Request latency at 250ms — processing bottleneck', 'Memory pressure at 78% contributing to CPU overhead', 'Error rate at 2% from resource contention'],
      suggestedInvestigation: ['Check application logs for api-server-2', 'Review recent deployment changes', 'Analyze CPU profiling data for hotspots', 'Examine GC logs for cycle inefficiencies'],
      fix: 'Restarted api-server-2 service to free resources and reset stuck processes. GC tuning parameters updated to reduce cycle frequency.',
      fixType: 'restartService', commands: ['ssh user@api-server-2', 'sudo systemctl restart api-server', 'exit'],
      estimatedTime: '2 minutes', riskLevel: 'low', rollback: 'If restart causes further instability, rollback to previous stable image: api-server:v2.0-stable.',
      slackMessage: ':white_check_mark: *[RESOLVED] CPU Spike — api-server-2*\n\nCPU saturation at 97% has been resolved. Service restarted successfully by Patcher agent.\n\n:stopwatch: *Resolution Time:* 2m 14s\n:level_slider: *Risk Level:* Low',
      emailSubject: 'Incident Report: CPU Spike on api-server-2 — RESOLVED',
      emailBody: 'The automated incident response system has resolved the CPU spike on api-server-2. The service was restarted at 03:14 UTC and is now operating normally. Full post-mortem attached.',
      channels: ['slack', 'email'],
      runbookSteps: ['Monitor CPU usage for sustained spikes (>90% for 3+ min)', 'SSH into affected server', 'Restart the api-server service via systemctl', 'Monitor metrics for 5 minutes post-restart', 'If issue recurs, analyze heap dump and GC logs'],
      aiInsight: 'Pattern detected: 3 similar CPU spikes in 30 days. Recommend adding auto-scaling trigger at 80% to prevent recurrence.',
    },
  },
  {
    id: 'RPT-002', incidentId: 'incident-002', title: 'DB Connection Pool Exhaustion',
    date: 'Jun 11, 2026', severity: 'high', status: 'resolved', component: 'db-cluster-primary',
    icon: <Database size={14} className="text-amber-400" />,
    data: {
      resolution: '10m 42s', severity: 'High', nodesAffected: '2',
      description: 'Database connection pool maxed out causing query timeouts. High concurrent load (4,200 req/s) overwhelmed available connections. Application-wide latency spike to 1850ms.',
      rootCause: 'Connection pool exhaustion due to insufficient pool size (max: 50) under traffic of 4.2k req/s. Long-running queries holding connections without proper timeout enforcement.',
      confidence: 0.9,
      contributingFactors: ['Pool size capped at 50 connections — too low for current traffic', 'Long-running queries consuming connections for 30+ seconds', 'Missing connection timeout configuration — causing leaks', 'No circuit breaker to shed load under saturation'],
      suggestedInvestigation: ['Review connection pool size vs. traffic baseline', 'Analyze slow query log for queries >5s', 'Check application code for unclosed connections', 'Monitor pool utilization metrics post-fix'],
      fix: 'Increased DB_POOL_SIZE to 100 and added connection timeout configuration via kubectl configmap patch. Rolling deployment restart applied.',
      fixType: 'configChange', commands: ["kubectl patch configmap app-config -p '{\"data\":{\"DB_POOL_SIZE\": \"100\", \"DB_CONNECTION_TIMEOUT\": \"30s\", \"DB_MAX_LIFETIME\": \"10m\"}}'", 'kubectl rollout restart deployment/app-deployment', "kubectl exec -it $(kubectl get pods -l app=app-deployment -o jsonpath='{.items[0].metadata.name}') -- curl -X POST http://localhost:8080/actuator/refresh"],
      estimatedTime: '10 minutes', riskLevel: 'medium', rollback: 'Revert configmap to previous pool size values and restart deployment.',
      slackMessage: ':white_check_mark: *[RESOLVED] DB Connection Pool Exhaustion*\n\nPool size increased to 100 connections. Timeout config applied. Latency normalized.\n\n:stopwatch: *Resolution:* 10m 42s\n:rotating_light: *Risk:* Medium',
      emailSubject: 'Incident Report: DB Connection Pool Exhaustion — RESOLVED',
      emailBody: 'The database connection pool exhaustion on db-cluster-primary has been resolved. Connection pool size was increased from 50 to 100. Full post-mortem details attached.',
      channels: ['slack', 'pagerduty'],
      runbookSteps: ['Confirm connection pool saturation in metrics', 'Increase DB_POOL_SIZE via configmap patch', 'Set connection timeout (30s) and max lifetime (10m)', 'Trigger rolling restart of affected deployment', 'Monitor connection utilization and latency post-fix'],
      aiInsight: 'Recommend setting pool size to 150 for 20% headroom at peak traffic. Consider adding read replicas to reduce primary connection pressure.',
    },
  },
  {
    id: 'RPT-003', incidentId: 'incident-003', title: 'Memory Leak — auth-service-v2',
    date: 'Jun 10, 2026', severity: 'critical', status: 'resolved', component: 'auth-service-v2',
    icon: <Lock size={14} className="text-purple-400" />,
    data: {
      resolution: '4m 11s', severity: 'Critical', nodesAffected: '3',
      description: 'Heap memory growing at 2.4GB/min in auth-service-v2. Redis connection pool leaking during failed retry cycles. OOM crash imminent within 8 minutes if unresolved. ~64k concurrent users affected.',
      rootCause: 'Memory leak in Redis connection pool — connections not returned on failed retry cycles in Go service. GC unable to reclaim leaked connection objects under pressure.',
      confidence: 0.91,
      contributingFactors: ['Redis pool not releasing connections on retry failures', 'Go GC unable to reclaim leaked connection objects', 'Missing REDIS_POOL_MAX_LIFETIME enforcement', 'Circuit breaker misconfigured — not shedding load', 'Heap growing at 2.4GB/min — OOM in <10min'],
      suggestedInvestigation: ['Inspect Redis pool implementation in go-service-cluster', 'Review retry logic for connection handling on failure', 'Check circuit breaker threshold configuration', 'Examine Go pprof memory profiles for allocation hotspots'],
      fix: 'Applied hot-patch: enforced REDIS_POOL_MAX_LIFETIME=60s, REDIS_POOL_IDLE_TIMEOUT=30s. Triggered manual GC cycle. Rolling restart completed in 4 minutes.',
      fixType: 'hotPatch', commands: ['kubectl set env deployment/auth-service REDIS_POOL_MAX_LIFETIME=60s REDIS_POOL_IDLE_TIMEOUT=30s', 'kubectl rollout restart deployment/auth-service-v2', "kubectl exec -it $(kubectl get pods -l app=auth-service -o jsonpath='{.items[0].metadata.name}') -- curl -X POST http://localhost:8080/debug/gc"],
      estimatedTime: '4 minutes', riskLevel: 'low', rollback: 'Full rollback to auth-service:v2.0-stable available if patch causes instability.',
      slackMessage: ':rotating_light: *[RESOLVED] Memory Leak — auth-service-v2*\n\nCritical memory leak resolved. Redis pool max-lifetime enforced, GC cycle triggered.\n\nHeap growth stopped. Service stabilizing.\n\n:stopwatch: *Resolution:* 4m 11s\n:level_slider: *Risk:* Low',
      emailSubject: 'Incident Report: Memory Leak auth-service-v2 — RESOLVED',
      emailBody: 'Critical memory leak in auth-service-v2 resolved via hot-patch. Redis connection pool lifetime now enforced. All 64k affected sessions restored.',
      channels: ['slack', 'pagerduty', 'email'],
      runbookSteps: ['Confirm heap growth rate in pprof/metrics', 'Set REDIS_POOL_MAX_LIFETIME and IDLE_TIMEOUT env vars', 'Apply rolling restart to auth-service deployment', 'Trigger manual GC via debug endpoint', 'Monitor heap usage for 5 minutes post-patch'],
      aiInsight: 'Add heap growth alerting at 500MB/min. All Go services using Redis should enforce pool max-lifetime. Add to base service template.',
    },
  },
];

const TAB_CONFIG: { id: ReportTab; label: string; icon: typeof Eye }[] = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'root-cause', label: 'Root Cause', icon: Search },
  { id: 'patch', label: 'Patch', icon: Wrench },
  { id: 'communications', label: 'Communications', icon: MessageSquare },
  { id: 'runbook', label: 'Runbook', icon: BookOpen },
];

const SEVERITY = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  high:     { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  medium:   { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  low:      { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
};

const STATUS = {
  resolved: 'text-green-400',
  open: 'text-red-400',
  investigating: 'text-amber-400',
};

function generateReportPDF(r: ReportRecord): string {
  const content = `
INCIDENT REPORT: ${r.title}
Report ID: ${r.id}
Incident ID: ${r.incidentId}
Date: ${r.date}
Severity: ${r.severity.toUpperCase()}
Status: ${r.status.toUpperCase()}
Component: ${r.component}

========================================
EXECUTIVE SUMMARY
========================================
${r.data.description}

========================================
ROOT CAUSE ANALYSIS
========================================
Root Cause: ${r.data.rootCause}
Confidence: ${Math.round(r.data.confidence * 100)}%

Contributing Factors:
${r.data.contributingFactors.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Suggested Investigation:
${r.data.suggestedInvestigation.map((s, i) => `${i + 1}. ${s}`).join('\n')}

========================================
PATCH DETAILS
========================================
Fix: ${r.data.fix}
Fix Type: ${r.data.fixType}
Commands:
${r.data.commands.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Estimated Time: ${r.data.estimatedTime}
Risk Level: ${r.data.riskLevel}
Rollback Plan: ${r.data.rollback}

========================================
COMMUNICATIONS
========================================
Slack Message: ${r.data.slackMessage}
Email Subject: ${r.data.emailSubject}
Email Body: ${r.data.emailBody}
Channels: ${r.data.channels.join(', ')}

========================================
RUNBOOK STEPS
========================================
${r.data.runbookSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

========================================
AI INSIGHT
========================================
${r.data.aiInsight}
`;
  return content;
}

function downloadReport(r: ReportRecord) {
  const content = generateReportPDF(r);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${r.id}_${r.incidentId}_report.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

async function shareReport(r: ReportRecord) {
  const content = generateReportPDF(r);
  if (navigator.share) {
    try {
      await navigator.share({ title: `Incident Report: ${r.title}`, text: content });
    } catch (err) { console.log('Share cancelled'); }
  } else {
    await navigator.clipboard.writeText(content);
    alert('Report copied to clipboard!');
  }
}

function Tab({ active, children, label, icon: Icon }: { active: boolean; children: React.ReactNode; label: string; icon: typeof Eye }) {
  return (
    <button className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      active ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
    }`}>
      <Icon size={14} className="mr-2" />
      {label}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">{title}</h3>
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">{children}</div>
    </div>
  );
}

function KeyValue({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`font-mono text-white ${mono ? '' : 'font-normal'}`}>{value}</span>
    </div>
  );
}

function Badge({ children, color = 'slate' }: { children: React.ReactNode; color?: string }) {
  const colors = {
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    slate: 'bg-slate-700 text-slate-300 border-slate-600',
  };
  return <span className={colors[color] || colors.slate}>{children}</span>;
}

// Minimalistic tab components
function OverviewTab({ r }: { r: ReportRecord }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Resolution Time</div>
          <div className="text-2xl font-bold text-green-400">{r.data.resolution}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Severity</div>
          <div className="text-2xl font-bold">{r.data.severity}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Nodes Affected</div>
          <div className="text-2xl font-bold text-amber-400">{r.data.nodesAffected}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Status</div>
          <div className="text-2xl font-bold text-green-400">Resolved</div>
        </div>
      </div>
      <Section title="Executive Summary">
        <p className="text-sm text-slate-300 leading-relaxed">{r.data.description}</p>
      </Section>
      <div className="flex items-center gap-4">
        <button onClick={() => downloadReport(r)} className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-[#05081a] font-semibold rounded">
          <Download size={16} /> Export
        </button>
        <button onClick={() => shareReport(r)} className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-semibold rounded">
          <Share2 size={16} /> Share
        </button>
      </div>
    </div>
  );
}

function RootCauseTab({ r }: { r: ReportRecord }) {
  return (
    <div className="space-y-4">
      <Section title="Root Cause Analysis">
        <div className="text-sm text-slate-300 leading-relaxed">
          <p><strong>Primary Root Cause:</strong> {r.data.rootCause}</p>
          <p className="mt-2"><strong>Confidence:</strong> {Math.round(r.data.confidence * 100)}%</p>
        </div>
      </Section>
      <Section title="Contributing Factors">
        <ul className="list-disc list-inside space-y-2">
          {r.data.contributingFactors.map((factor, index) => (
            <li key={index} className="text-sm text-slate-300">{factor}</li>
          ))}
        </ul>
      </Section>
      <Section title="Suggested Investigation">
        <ol className="list-decimal list-inside space-y-2">
          {r.data.suggestedInvestigation.map((step, index) => (
            <li key={index} className="text-sm text-slate-300">{step}</li>
          ))}
        </ol>
      </Section>
    </div>
  );
}

function PatchTab({ r }: { r: ReportRecord }) {
  return (
    <div className="space-y-4">
      <Section title="Patch Recommendation">
        <div className="text-sm text-slate-300 leading-relaxed">
          <p><strong>Fix:</strong> {r.data.fix}</p>
          <p className="mt-2"><strong>Fix Type:</strong> {r.data.fixType}</p>
          <p className="mt-2"><strong>Estimated Time:</strong> {r.data.estimatedTime}</p>
          <p className="mt-2"><strong>Risk Level:</strong> {r.data.riskLevel}</p>
        </div>
      </Section>
      <Section title="Rollback Plan">
        <p className="text-sm text-slate-300"><strong>Rollback Plan:</strong> {r.data.rollback}</p>
      </Section>
      <Section title="Command Execution">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Commands</div>
          <pre className="text-xs font-mono text-green-400 bg-black/50 p-4 overflow-auto">{r.data.commands.join('\n')}</pre>
        </div>
      </Section>
    </div>
  );
}

function CommunicationsTab({ r }: { r: ReportRecord }) {
  const formatted = r.data.slackMessage
    .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
  return (
    <div className="space-y-4">
      <Section title="Slack Notification">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4" dangerouslySetInnerHTML={{ __html: formatted }} />
      </Section>
      <Section title="Internal Email">
        <div className="space-y-4">
          <div className="text-sm text-slate-300 font-semibold mb-2">Subject</div>
          <p className="text-sm text-slate-300">{r.data.emailSubject}</p>
          <div className="text-sm text-slate-300 font-semibold mb-2 mt-4">Body</div>
          <p className="text-sm text-slate-300 leading-relaxed">{r.data.emailBody}</p>
        </div>
      </Section>
    </div>
  );
}

function RunbookTab({ r }: { r: ReportRecord }) {
  return (
    <div className="space-y-4">
      <Section title={`Runbook — ${r.title}`}>
        <ol className="list-decimal list-inside space-y-2">
          {r.data.runbookSteps.map((step, index) => (
            <li key={index} className="flex items-start gap-3 p-2 rounded border border-white/10 bg-white/5">
              <div className="w-5 h-5 rounded-full border border-purple-500/30 text-xs text-purple-400 flex items-center justify-center shrink-0 font-mono font-semibold">
                {index + 1}
              </div>
              <span className="text-sm text-slate-300">{step}</span>
            </li>
          ))}
        </ol>
      </Section>
      <Section title="AI Insight">
        <p className="text-sm text-slate-300 leading-relaxed">{r.data.aiInsight}</p>
      </Section>
    </div>
  );
}

export default function Reports({ onNavigate }: ReportsProps) {
  const [activeReport, setActiveReport] = useState<ReportRecord>(REPORTS[0]);
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');

  const tabs: { id: ReportTab; label: string; icon: typeof Eye }[] = TAB_CONFIG;

  const TAB_CONTENT: Record<ReportTab, React.ReactNode> = {
    'overview':       <OverviewTab r={activeReport} />,
    'root-cause':     <RootCauseTab r={activeReport} />,
    'patch':          <PatchTab r={activeReport} />,
    'communications': <CommunicationsTab r={activeReport} />,
    'runbook':        <RunbookTab r={activeReport} />,
  };

  return (
    <div className="flex h-screen bg-[#05081a] pt-12 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-white/10 bg-[#05081a] flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Reports</h2>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-sm font-mono text-slate-300">{activeReport.id}</span>
          </div>
        </div>

        <nav className="p-3 flex-1 flex flex-col">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Reports</h3>
          <div className="space-y-1 flex-1">
            {REPORTS.map(r => (
              <button
                key={r.id}
                onClick={() => { setActiveReport(r); setActiveTab('overview'); }}
                className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                  activeReport.id === r.id
                    ? 'bg-white/10 border border-white/10'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  {r.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{r.title}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{r.component}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                  r.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                  r.severity === 'high' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                  'bg-blue-500/20 text-blue-400 border-blue-500/30'
                }`}>{r.severity}</span>
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-white/10">
            <button onClick={() => onNavigate('incidents')} className="w-full py-2 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/30 transition-colors flex items-center justify-center gap-2">
              <RefreshCw size={12} className="animate-spin" /> Replay
            </button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <header className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              {activeReport.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{activeReport.title}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap text-sm">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-white/20 text-slate-300 bg-white/5">{activeReport.severity}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-slate-300 border border-white/10">{activeReport.status}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{activeReport.component}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="px-3 py-1.5 rounded-lg border border-white/20 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-white/5 transition-colors flex items-center gap-1.5">
              <Share2 size={14} /> Share
            </button>
            <button onClick={() => downloadReport(activeReport)} className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#05081a] text-sm font-semibold transition-colors flex items-center gap-1.5">
              <Download size={14} /> Export
            </button>
          </div>
        </header>

        <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">{activeReport.id}</span>
          <ChevronRight size={14} className="text-slate-600" />
          <span className="text-slate-500">{activeReport.incidentId}</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-400">{activeReport.date}</span>
        </div>

        <nav className="mb-6 flex gap-1 bg-white/5 rounded-xl p-1 border border-white/10" aria-label="Report sections">
          {TAB_CONFIG.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="animate-fade-in">
          {TAB_CONTENT[activeTab]}
        </div>
      </main>
    </div>
  );
}