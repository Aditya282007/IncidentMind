import { useState } from 'react';
import {
  FileText, Download, Share2, ChevronRight, CheckCircle,
  AlertTriangle, BookOpen, MessageSquare, Zap, Search,
  Wrench, BarChart2, Eye, Clock, Layers, HelpCircle, Play,
  Copy, Shield, Server, Database, Lock, Activity,
  TrendingDown, ExternalLink
} from 'lucide-react';

interface ReportsProps {
  onNavigate: (page: 'dashboard' | 'incidents' | 'history' | 'reports' | 'analytics' | 'settings' | 'incident-detail') => void;
}

type ReportTab = 'overview' | 'root-cause' | 'patch' | 'communications' | 'runbook';

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
  { id: 'overview',        label: 'Overview',        icon: Eye },
  { id: 'root-cause',      label: 'Root Cause',      icon: Search },
  { id: 'patch',           label: 'Patch',           icon: Wrench },
  { id: 'communications',  label: 'Communications',  icon: MessageSquare },
  { id: 'runbook',         label: 'Runbook',         icon: BookOpen },
];

const SEV_COLOR: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/25',
  high:     'text-amber-400 bg-amber-500/10 border-amber-500/25',
  medium:   'text-blue-400 bg-blue-500/10 border-blue-500/25',
};
const STATUS_COLOR: Record<string, string> = {
  resolved: 'text-green-400', open: 'text-red-400', investigating: 'text-amber-400',
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="text-slate-500 hover:text-cyan-400 transition-colors">
      {copied ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
    </button>
  );
}

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
      await navigator.share({
        title: `Incident Report: ${r.title}`,
        text: content,
      });
    } catch (err) {
      console.log('Share cancelled');
    }
  } else {
    await navigator.clipboard.writeText(content);
    alert('Report copied to clipboard!');
  }
}

function OverviewTab({ r }: { r: ReportRecord }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Resolution Time', value: r.data.resolution, color: 'text-green-400', icon: Clock },
            { label: 'Severity Score',  value: r.data.severity,   color: 'text-red-400',   icon: AlertTriangle },
            { label: 'Nodes Affected',  value: r.data.nodesAffected, color: 'text-amber-400', icon: Server },
            { label: 'Status',          value: 'Resolved',        color: 'text-green-400', icon: CheckCircle },
          ].map(m => (
            <div key={m.label} className="border border-[#1e2d4d] rounded-lg bg-[#080d1f] p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <m.icon size={11} className={m.color} />
                <span className="text-[9px] text-slate-600 uppercase tracking-wider">{m.label}</span>
              </div>
              <div className={`text-base font-bold font-mono ${m.color}`}>{m.value}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => downloadReport(r)} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[10px] font-medium hover:bg-cyan-500/20 transition-colors">
            <Download size={10} /> Export
          </button>
          <button onClick={() => shareReport(r)} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-purple-500/10 border border-purple-500/25 text-purple-400 text-[10px] font-medium hover:bg-purple-500/20 transition-colors">
            <Share2 size={10} /> Share
          </button>
        </div>
      </div>
      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye size={13} className="text-cyan-400" />
          <span className="text-sm font-semibold text-white">Executive Summary</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed mb-4">{r.data.description}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded bg-[#080d1f] border border-[#1e2d4d] p-3">
            <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5">Affected Component</div>
            <code className="text-sm font-mono text-cyan-400">{r.component}</code>
          </div>
          <div className="rounded bg-[#080d1f] border border-[#1e2d4d] p-3">
            <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5">Incident ID</div>
            <code className="text-sm font-mono text-slate-300">{r.incidentId}</code>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={13} className="text-blue-400" />
            <span className="text-sm font-semibold text-white">Risk Assessment</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded bg-[#080d1f] border border-[#1e2d4d] p-2.5 text-center">
              <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Regression Risk</div>
              <div className="text-sm font-bold font-mono text-green-400">{r.data.riskLevel === 'low' ? 'Low (5%)' : r.data.riskLevel === 'medium' ? 'Medium (18%)' : 'High (35%)'}</div>
            </div>
            <div className="rounded bg-[#080d1f] border border-[#1e2d4d] p-2.5 text-center">
              <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Stability Score</div>
              <div className="text-sm font-bold font-mono text-cyan-400">98.3%</div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400">SLAs fully restored. No evidence of lingering issues in downstream systems.</p>
        </div>
        <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={13} className="text-green-400" />
            <span className="text-sm font-semibold text-white">Timeline</span>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Detected',  time: '03:14:22', color: 'text-red-400' },
              { label: 'Diagnosed', time: '03:14:40', color: 'text-amber-400' },
              { label: 'Patched',   time: '03:14:55', color: 'text-teal-400' },
              { label: 'Resolved',  time: '03:15:01', color: 'text-green-400' },
            ].map(t => (
              <div key={t.label} className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">{t.label}</span>
                <span className={`font-mono font-semibold ${t.color}`}>{t.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RootCauseTab({ r }: { r: ReportRecord }) {
  const pct = Math.round(r.data.confidence * 100);
  return (
    <div className="space-y-4">
      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
        <div className="flex items-center gap-2 mb-4">
          <Search size={13} className="text-amber-400" />
          <span className="text-sm font-semibold text-white">Diagnoser Analysis</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] text-slate-500">Confidence</span>
            <div className="w-20 h-1.5 rounded-full bg-[#1e2d4d] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-green-400" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] font-mono text-slate-300">{pct}%</span>
          </div>
        </div>
        <div className="rounded-lg bg-amber-500/5 border border-amber-500/15 p-4 mb-4">
          <div className="text-[9px] text-amber-400/70 uppercase tracking-wider mb-2">Root Cause</div>
          <p className="text-sm text-amber-300 font-medium leading-relaxed">"{r.data.rootCause}"</p>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Contributing Factors</div>
          <ul className="space-y-1.5">
            {r.data.contributingFactors.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                <span className="text-amber-500 mt-0.5 shrink-0">›</span>{f}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={13} className="text-blue-400" />
          <span className="text-sm font-semibold text-white">Suggested Investigation Steps</span>
        </div>
        <div className="space-y-2">
          {r.data.suggestedInvestigation.map((step, i) => (
            <div key={i} className="flex items-start gap-3 p-2.5 rounded bg-[#080d1f] border border-[#1e2d4d]">
              <span className="w-5 h-5 rounded-full border border-[#2d4070] text-[9px] text-slate-500 flex items-center justify-center shrink-0 font-mono">{i + 1}</span>
              <span className="text-[11px] text-slate-300">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PatchTab({ r }: { r: ReportRecord }) {
  return (
    <div className="space-y-4">
      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
        <div className="flex items-center gap-2 mb-4">
          <Wrench size={13} className="text-teal-400" />
          <span className="text-sm font-semibold text-white">Patch Recommendation</span>
          <div className="ml-auto flex items-center gap-2">
            <CheckCircle size={12} className="text-green-400" />
            <span className="text-[11px] text-green-400">Deployed & Verified</span>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded border ${r.data.riskLevel === 'low' ? 'text-green-400 bg-green-500/10 border-green-500/25' : r.data.riskLevel === 'medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/25' : 'text-red-400 bg-red-500/10 border-red-500/25'}`}>{r.data.riskLevel} risk</span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-teal-400">{r.data.fixType}</span>
          <span className="text-[10px] text-slate-500 flex items-center gap-1 ml-auto"><Clock size={10} />{r.data.estimatedTime}</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed mb-4">{r.data.fix}</p>
        <div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider mb-2">
            <span>Command Execution</span>
            <CopyButton text={r.data.commands.join('\n')} />
          </div>
          <div className="rounded-lg bg-[#03060f] border border-[#1e2d4d] overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1e2d4d]">
              <span className="text-[9px] text-slate-600 font-mono">bash</span>
            </div>
            <div className="p-3 space-y-1">
              {r.data.commands.map((cmd, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-slate-600 font-mono text-[10px] shrink-0">$</span>
                  <code className="text-[10px] font-mono text-green-400 break-all leading-relaxed">{cmd}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={13} className="text-amber-400" />
          <span className="text-sm font-semibold text-white">Rollback Plan</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed mb-3">{r.data.rollback}</p>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-slate-500">Rollback window:</span>
          <span className="font-mono text-cyan-400">24 hours</span>
          <span className="text-slate-500 ml-4">Checkpoint saved:</span>
          <span className="font-mono text-green-400">Yes</span>
        </div>
      </div>
    </div>
  );
}

function CommunicationsTab({ r }: { r: ReportRecord }) {
  const formatted = r.data.slackMessage
    .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
  return (
    <div className="space-y-4">
      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={13} className="text-orange-400" />
          <span className="text-sm font-semibold text-white">Slack Notification</span>
          <div className="ml-auto flex gap-1.5">
            {r.data.channels.map(ch => (
              <span key={ch} className="text-[9px] px-1.5 py-0.5 rounded bg-[#0c1228] border border-[#1e2d4d] text-slate-500 font-mono">{ch}</span>
            ))}
          </div>
        </div>
        <div className="rounded-lg bg-[#1a1d21] border border-[#2d3748] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 rounded-sm bg-[#611f69] flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">#</span>
            </div>
            <span className="text-[10px] text-slate-400">incidents</span>
            <span className="ml-auto text-[9px] text-slate-600">{r.date}</span>
          </div>
          <div className="text-[11px] text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />
        </div>
      </div>
      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={13} className="text-blue-400" />
          <span className="text-sm font-semibold text-white">Internal Email</span>
        </div>
        <div className="space-y-3">
          <div className="rounded bg-[#080d1f] border border-[#1e2d4d] p-3">
            <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-1">Subject</div>
            <p className="text-[11px] text-slate-300 font-medium">{r.data.emailSubject}</p>
          </div>
          <div className="rounded bg-[#080d1f] border border-[#1e2d4d] p-3">
            <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-1">Body</div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{r.data.emailBody}</p>
          </div>
        </div>
      </div>
      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
        <div className="flex items-center gap-2 mb-3">
          <ExternalLink size={13} className="text-teal-400" />
          <span className="text-sm font-semibold text-white">Notification Summary</span>
        </div>
        <div className="space-y-2">
          {r.data.channels.map(ch => (
            <div key={ch} className="flex items-center justify-between p-2.5 rounded bg-[#080d1f] border border-[#1e2d4d]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-[11px] text-slate-300 font-mono capitalize">{ch}</span>
              </div>
              <span className="text-[10px] text-green-400 flex items-center gap-1"><CheckCircle size={10} /> Delivered</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RunbookTab({ r }: { r: ReportRecord }) {
  return (
    <div className="space-y-4">
      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={13} className="text-purple-400" />
          <span className="text-sm font-semibold text-white">Runbook — {r.title}</span>
        </div>
        <div className="space-y-2 mb-4">
          {r.data.runbookSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded border border-[#1e2d4d] bg-[#080d1f] hover:border-purple-500/20 transition-colors">
              <span className="w-5 h-5 rounded-full border border-purple-500/30 text-[9px] text-purple-400 flex items-center justify-center shrink-0 font-mono font-semibold">{i + 1}</span>
              <span className="text-[11px] text-slate-300 leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
        <div className="rounded bg-[#080d1f] border border-amber-500/20 p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Zap size={10} className="text-amber-400" />
            <span className="text-[9px] text-amber-400 font-semibold uppercase tracking-wider">AI Insight</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">{r.data.aiInsight}</p>
        </div>
      </div>
      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Layers size={13} className="text-cyan-400" />
          <span className="text-sm font-semibold text-white">Runbook Evolution</span>
        </div>
        <div className="space-y-2 mb-4">
          {['Add automated circuit breaker check as step 2b.', 'Include heap dump capture before restart.', 'Reference p95 latency threshold for faster trigger detection.'].map((sug, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-slate-400 p-2 rounded bg-[#080d1f] border border-[#1e2d4d]">
              <span className="text-cyan-500 shrink-0">+</span>{sug}
            </div>
          ))}
        </div>
        <button className="flex items-center gap-1.5 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors">
          <Layers size={10} /> + Update Runbook
        </button>
      </div>
    </div>
  );
}

export default function Reports({ onNavigate }: ReportsProps) {
  const [activeReport, setActiveReport] = useState<ReportRecord>(REPORTS[0]);
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');

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
      <aside className="w-52 shrink-0 border-r border-[#1e2d4d] bg-[#080d1f] flex flex-col overflow-y-auto">
        <div className="p-3 border-b border-[#1e2d4d]">
          <div className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest mb-2">Active Session</div>
          <div className="flex items-center gap-2 p-2 rounded bg-cyan-500/10 border border-cyan-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 live-dot" />
            <span className="text-[11px] text-cyan-400 font-medium font-mono">{activeReport.id}</span>
          </div>
        </div>

        <div className="p-3 flex-1">
          <div className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest mb-2">Incident Reports</div>
          <div className="space-y-1">
            {REPORTS.map(r => (
              <button
                key={r.id}
                onClick={() => { setActiveReport(r); setActiveTab('overview'); }}
                className={`w-full text-left p-2.5 rounded transition-all ${activeReport.id === r.id ? 'bg-[#0c1228] border border-[#1e2d4d]' : 'hover:bg-white/3'}`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  {r.icon}
                  <span className={`text-[11px] font-semibold ${activeReport.id === r.id ? 'text-white' : 'text-slate-400'}`}>{r.id}</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">{r.title}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-[8px] uppercase font-semibold ${SEV_COLOR[r.severity].split(' ')[0]}`}>{r.severity}</span>
                  <span className={`text-[9px] ${STATUS_COLOR[r.status]}`}>{r.status}</span>
                </div>
                <div className="text-[9px] text-slate-600 mt-0.5">{r.date}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 border-t border-[#1e2d4d] space-y-1">
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
            <HelpCircle size={12} /> Support
          </button>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
            <FileText size={12} /> Logs
          </button>
          <button onClick={() => onNavigate('incidents')} className="w-full py-2 mt-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-colors flex items-center justify-center gap-2">
            <Play size={11} /> Replay Incident
          </button>
        </div>
      </aside>

{/* Main */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-4 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main content - 3 columns */}
            <div className="lg:col-span-3 space-y-6">

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/25 text-amber-400 text-[10px] font-semibold">
                  <Zap size={9} /> AI Generated
                </span>
                <span className="text-[10px] font-mono text-slate-500">{activeReport.id}</span>
                <ChevronRight size={10} className="text-slate-600" />
                <button onClick={() => onNavigate('incident-detail')} className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors">
                  {activeReport.incidentId}
                </button>
                <div className="ml-auto flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#1e2d4d] text-slate-300 text-[11px] hover:border-cyan-500/30 hover:text-cyan-400 transition-colors">
                    <Share2 size={11} /> Share
                  </button>
                  <button onClick={() => downloadReport(activeReport)} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-[#05081a] text-[11px] font-semibold transition-colors">
                    <Download size={11} /> Export PDF
                  </button>
                </div>
              </div>

              {/* Header */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-white">{activeReport.title}</h1>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${SEV_COLOR[activeReport.severity]}`}>{activeReport.severity}</span>
                </div>
                <p className="text-[11px] text-slate-400">AI-generated post-incident report · {activeReport.date} · {activeReport.component}</p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#1e2d4d] mb-5">
                {TAB_CONFIG.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-medium border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-cyan-500 text-cyan-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <tab.icon size={11} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {TAB_CONTENT[activeTab]}

              <div className="mt-8 pt-4 border-t border-[#1e2d4d] flex items-center justify-between text-[10px] text-slate-600 font-mono">
                <span>© 2026 IncidentMind AI Operations · Data encrypted at rest</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />System Online</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />API Online</span>
                </div>
              </div>
            </div>

            {/* Right sidebar - Incident metadata */}
            <div className="lg:col-span-1 space-y-4">
              <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4 sticky top-24">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Incident Details</span>
                </div>
                <div className="space-y-3 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Incident ID</span>
                    <span className="font-mono text-slate-300">{activeReport.incidentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Component</span>
                    <span className="font-mono text-cyan-400">{activeReport.component}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Report ID</span>
                    <span className="font-mono text-slate-300">{activeReport.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date</span>
                    <span className="text-slate-300">{activeReport.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <span className={`font-medium ${STATUS_COLOR[activeReport.status]}`}>{activeReport.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Severity</span>
                    <span className={`font-medium ${SEV_COLOR[activeReport.severity].split(' ')[0]}`}>{activeReport.severity}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#1e2d4d]">
                  <div className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-2">Notifications Sent</div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeReport.data.channels.map(ch => (
                      <span key={ch} className="text-[9px] px-1.5 py-0.5 rounded bg-[#0c1228] border border-[#1e2d4d] text-slate-500 font-mono">{ch}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] p-4">
                <div className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-2">Quick Actions</div>
                <div className="space-y-2">
                  <button onClick={() => onNavigate('incidents')} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2">
                    <Play size={11} /> Replay Incident
                  </button>
                  <button onClick={() => downloadReport(activeReport)} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-[#05081a] text-xs font-semibold transition-colors">
                    <Download size={11} /> Export Report
                  </button>
                  <button className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded border border-[#1e2d4d] text-slate-300 text-xs hover:border-cyan-500/30 hover:text-cyan-400 transition-colors">
                    <Share2 size={11} /> Share Report
                  </button>
</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
