import { useState, useEffect } from 'react';
import {
  User, Bell, Plug, Bot, Key, Shield, Palette,
  ChevronDown, Save, X, FileText, HelpCircle, Zap,
  CheckCircle, Monitor, Eye, EyeOff, Copy, Plus,
  Trash2, RefreshCw, Globe, Lock, Smartphone, AlertTriangle,
  Sun, Moon, Laptop, Target, Clock, BarChart2, RotateCcw, Tag
} from 'lucide-react';

type SettingsSection = 'profile' | 'notifications' | 'integrations' | 'ai-agents' | 'api-keys' | 'security' | 'theme' | 'attention-policy';

const sidebarItems: { id: SettingsSection; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'profile',         label: 'Profile',         icon: User },
  { id: 'notifications',   label: 'Notifications',   icon: Bell },
  { id: 'integrations',    label: 'Integrations',    icon: Plug },
  { id: 'ai-agents',       label: 'AI Agents',       icon: Bot },
  { id: 'api-keys',        label: 'API Keys',        icon: Key },
  { id: 'security',        label: 'Security',        icon: Shield },
  { id: 'theme',           label: 'Theme',           icon: Palette },
  { id: 'attention-policy', label: 'Attention Policy', icon: Target },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-cyan-500' : 'bg-[#1e2d4d]'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

function Field({ value, onChange, label, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; label?: string; placeholder?: string; type?: string;
}) {
  return (
    <div>
      {label && <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</label>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded bg-[#080d1f] border border-[#1e2d4d] text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-colors"
      />
    </div>
  );
}

function SectionHeader({ icon: Icon, title, desc }: { icon: React.FC<{ size?: number; className?: string }>; title: string; desc?: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2d4d]">
      <Icon size={13} className="text-cyan-400" />
      <div>
        <span className="text-sm font-semibold text-white">{title}</span>
        {desc && <p className="text-[10px] text-slate-500 mt-0.5">{desc}</p>}
      </div>
    </div>
  );
}

/* ── Profile ── */
function ProfileSection() {
  const [fullName, setFullName] = useState('Julian Vane');
  const [role, setRole] = useState('Lead Security Operator');
  const [email, setEmail] = useState('j.vane@incidentmind.io');
  const [bio, setBio] = useState('Senior SRE focused on autonomous incident response and platform reliability.');
  const [timezone, setTimezone] = useState('UTC+0 (London)');

  return (
    <div className="space-y-4">
      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
        <SectionHeader icon={User} title="Profile Information" />
        <div className="p-5">
          <div className="flex items-start gap-5 mb-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-xl border border-[#1e2d4d] bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center shrink-0">
                <Monitor size={32} className="text-cyan-400/60" />
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-cyan-500 border-2 border-[#0c1228] flex items-center justify-center hover:bg-cyan-400 transition-colors">
                <Plus size={10} className="text-[#05081a]" />
              </button>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <Field label="Full Name" value={fullName} onChange={setFullName} />
              <Field label="Role" value={role} onChange={setRole} />
              <div className="col-span-2">
                <Field label="Email Address" value={email} onChange={setEmail} type="email" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Bio</label>
              <textarea
                value={bio} onChange={e => setBio(e.target.value)} rows={3}
                className="w-full px-3 py-2 rounded bg-[#080d1f] border border-[#1e2d4d] text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Timezone</label>
              <div className="relative">
                <select value={timezone} onChange={e => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#080d1f] border border-[#1e2d4d] text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 appearance-none">
                  <option>UTC+0 (London)</option>
                  <option>UTC-5 (New York)</option>
                  <option>UTC-8 (Los Angeles)</option>
                  <option>UTC+5:30 (Mumbai)</option>
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
              <div className="mt-3 p-3 rounded bg-[#080d1f] border border-[#1e2d4d]">
                <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-1.5">Account Info</div>
                <div className="space-y-1 text-[10px] font-mono">
                  <div className="flex justify-between"><span className="text-slate-600">Account ID</span><span className="text-slate-400">USR-4829-ALPHA</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Member since</span><span className="text-slate-400">Jan 2024</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Plan</span><span className="text-cyan-400">Enterprise</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Notifications ── */
function NotificationsSection() {
  const [notifCritical, setNotifCritical] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(true);
  const [notifHealth, setNotifHealth] = useState(false);
  const [notifResolve, setNotifResolve] = useState(true);
  const [notifAgent, setNotifAgent] = useState(true);
  const [notifDigest, setNotifDigest] = useState(false);
  const [quietStart, setQuietStart] = useState('23:00');
  const [quietEnd, setQuietEnd] = useState('07:00');

  const toggles = [
    { label: 'Critical Alerts', desc: 'Immediate notification for high-priority security breaches.', value: notifCritical, setter: setNotifCritical },
    { label: 'Incident Resolved', desc: 'Notify when an incident is marked resolved by any agent.', value: notifResolve, setter: setNotifResolve },
    { label: 'Agent Activity', desc: 'Stream notifications as each agent activates and completes.', value: notifAgent, setter: setNotifAgent },
    { label: 'Weekly Intelligence Reports', desc: 'Summary of platform performance and mitigated threats.', value: notifWeekly, setter: setNotifWeekly },
    { label: 'System Health Updates', desc: 'Maintenance schedules and system availability alerts.', value: notifHealth, setter: setNotifHealth },
    { label: 'Daily Digest', desc: 'Consolidated summary of all events every morning at 09:00.', value: notifDigest, setter: setNotifDigest },
  ];

  return (
    <div className="space-y-4">
      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
        <SectionHeader icon={Bell} title="Notification Preferences" desc="Control which events trigger alerts and how you receive them." />
        <div className="divide-y divide-[#1e2d4d]">
          {toggles.map(item => (
            <div key={item.label} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <div className="text-sm font-medium text-white">{item.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
              </div>
              <Toggle checked={item.value} onChange={item.setter} />
            </div>
          ))}
        </div>
      </div>
      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
        <SectionHeader icon={Bell} title="Quiet Hours" desc="Suppress non-critical alerts during specified hours." />
        <div className="p-5 grid grid-cols-2 gap-4">
          <Field label="Quiet Start" value={quietStart} onChange={setQuietStart} type="time" />
          <Field label="Quiet End" value={quietEnd} onChange={setQuietEnd} type="time" />
          <div className="col-span-2 p-3 rounded bg-[#080d1f] border border-amber-500/20 flex items-start gap-2">
            <AlertTriangle size={12} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400">Critical severity alerts will always bypass quiet hours.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Integrations ── */
function IntegrationsSection() {
  const [slackChannel, setSlackChannel] = useState('#security-war-room');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [smtpServer, setSmtpServer] = useState('smtp.incidentmind.io');
  const [recipientList, setRecipientList] = useState('security-ops@company.com');
  const [pdKey, setPdKey] = useState('');
  const [ghOrg, setGhOrg] = useState('incidentmind-io');
  const [ghRepo, setGhRepo] = useState('platform-config');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Slack */}
        <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2d4d]">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-[#611f69] flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">#</span>
              </div>
              <span className="text-sm font-semibold text-white">Slack</span>
            </div>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/15 border border-green-500/25 text-green-400 text-[9px] font-semibold">
              <CheckCircle size={8} /> CONNECTED
            </span>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Alert Channel</label>
              <div className="relative">
                <select value={slackChannel} onChange={e => setSlackChannel(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#080d1f] border border-[#1e2d4d] text-sm text-slate-300 focus:outline-none appearance-none">
                  <option>#security-war-room</option><option>#incidents</option><option>#devops-alerts</option>
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
            <Field label="Webhook URL" value={webhookUrl || 'https://hooks.slack.com/services/***'} onChange={setWebhookUrl} type="password" />
            <button className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"><RefreshCw size={10} /> Test Connection</button>
          </div>
        </div>
        {/* Email SMTP */}
        <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2d4d]">
            <div className="flex items-center gap-2">
              <Globe size={13} className="text-blue-400" />
              <span className="text-sm font-semibold text-white">Email SMTP</span>
            </div>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/15 border border-green-500/25 text-green-400 text-[9px] font-semibold">
              <CheckCircle size={8} /> CONNECTED
            </span>
          </div>
          <div className="p-4 space-y-3">
            <Field label="SMTP Server" value={smtpServer} onChange={setSmtpServer} />
            <Field label="Recipient List" value={recipientList} onChange={setRecipientList} />
            <button className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"><RefreshCw size={10} /> Send Test Email</button>
          </div>
        </div>
        {/* PagerDuty */}
        <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2d4d]">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-[#06AC38] flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">PD</span>
              </div>
              <span className="text-sm font-semibold text-white">PagerDuty</span>
            </div>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#1e2d4d] border border-[#1e2d4d] text-slate-500 text-[9px] font-semibold">NOT CONFIGURED</span>
          </div>
          <div className="p-4 space-y-3">
            <Field label="Integration Key" value={pdKey} onChange={setPdKey} placeholder="pdkey_xxxxxxxxxx" type="password" />
            <Field label="Severity Routing" value="critical,high" onChange={() => {}} />
            <button className="w-full py-1.5 rounded border border-cyan-500/30 text-cyan-400 text-[11px] font-medium hover:bg-cyan-500/10 transition-colors">Connect PagerDuty</button>
          </div>
        </div>
        {/* GitHub */}
        <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2d4d]">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#24292e] flex items-center justify-center border border-slate-600">
                <span className="text-white text-[8px] font-bold">GH</span>
              </div>
              <span className="text-sm font-semibold text-white">GitHub</span>
            </div>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#1e2d4d] border border-[#1e2d4d] text-slate-500 text-[9px] font-semibold">NOT CONFIGURED</span>
          </div>
          <div className="p-4 space-y-3">
            <Field label="Organization" value={ghOrg} onChange={setGhOrg} />
            <Field label="Target Repo (for patches)" value={ghRepo} onChange={setGhRepo} />
            <button className="w-full py-1.5 rounded border border-cyan-500/30 text-cyan-400 text-[11px] font-medium hover:bg-cyan-500/10 transition-colors">Connect GitHub</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── AI Agents ── */
const agentDefs = [
  { name: 'Orchestrator', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/25', role: 'Controller — sequences agents and maintains incident context', threshold: 0.6 },
  { name: 'Watcher',      color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/25',   role: 'Sensor — polls metrics/logs, detects anomalies', threshold: 0.75 },
  { name: 'Diagnoser',    color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/25',  role: 'Analyst — finds root cause, produces structured diagnosis', threshold: 0.8 },
  { name: 'Patcher',      color: 'text-teal-400',   bg: 'bg-teal-500/10',   border: 'border-teal-500/25',   role: 'Fixer — generates fix commands, rollback plans', threshold: 0.85 },
  { name: 'Communicator', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/25', role: 'Notifier — drafts Slack message, incident report, runbook', threshold: 0.7 },
  { name: 'AttentionRouter', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/25', role: 'Router — scores incident attention level (AUTO/WATCH/ESCALATE)', threshold: 0.7 },
];

function AIAgentsSection() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(agentDefs.map(a => [a.name, true]))
  );
  const [autoMit, setAutoMit] = useState(true);
  const [maxRetries, setMaxRetries] = useState('3');
  const [timeout, setTimeout_] = useState('30');

  return (
    <div className="space-y-4">
      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
        <SectionHeader icon={Bot} title="Agent Configuration" desc="Enable or disable individual agents and tune their behavior." />
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between p-3 rounded bg-[#080d1f] border border-cyan-500/15">
            <div>
              <div className="text-sm font-semibold text-white mb-0.5">Autonomous Mitigation</div>
              <div className="text-[11px] text-slate-500">Allow agents to apply patches without human approval.</div>
            </div>
            <Toggle checked={autoMit} onChange={setAutoMit} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Max Retries per Agent" value={maxRetries} onChange={setMaxRetries} />
            <Field label="Agent Timeout (sec)" value={timeout} onChange={setTimeout_} />
          </div>
        </div>
      </div>
      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
        <SectionHeader icon={Bot} title="Individual Agents" />
        <div className="divide-y divide-[#1e2d4d]">
          {agentDefs.map(agent => (
            <div key={agent.name} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${agent.color} ${agent.bg} ${agent.border}`}>
                    {agent.name}
                  </div>
                  <span className="text-[10px] text-slate-500">{agent.role}</span>
                </div>
                <Toggle checked={enabled[agent.name]} onChange={v => setEnabled(p => ({ ...p, [agent.name]: v }))} />
              </div>
              {enabled[agent.name] && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block text-[9px] text-slate-600 uppercase tracking-wider mb-1">Model</label>
                    <div className="relative">
                      <span className="text-[11px] text-slate-400">Ollama (qwen3:latest)</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-600 uppercase tracking-wider mb-1">Min Confidence: <span className="text-slate-400">{Math.round(agent.threshold * 100)}%</span></label>
                    <input type="range" min={0} max={100} defaultValue={agent.threshold * 100}
                      className="w-full h-1.5 rounded-full appearance-none bg-[#1e2d4d] cursor-pointer accent-cyan-500" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── API Keys ── */
interface ApiKey { id: string; name: string; prefix: string; created: string; lastUsed: string; scope: string }
const initialKeys: ApiKey[] = [
  { id: '1', name: 'Production Backend', prefix: 'im_live_Kf92', created: 'Jan 12, 2026', lastUsed: 'Just now', scope: 'read, write' },
  { id: '2', name: 'CI Pipeline',        prefix: 'im_live_Jx84', created: 'Mar 3, 2026',  lastUsed: '2 days ago', scope: 'read' },
  { id: '3', name: 'Analytics Export',   prefix: 'im_test_Qm11', created: 'May 28, 2026', lastUsed: 'Never',     scope: 'read' },
];

function ApiKeysSection() {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [revealId, setRevealId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const deleteKey = (id: string) => setKeys(prev => prev.filter(k => k.id !== id));
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(id); setTimeout(() => setCopied(null), 1500);
  };
  const createKey = () => {
    if (!newName.trim()) return;
    const newKey: ApiKey = {
      id: String(Date.now()), name: newName, prefix: 'im_live_New1',
      created: 'Just now', lastUsed: 'Never', scope: 'read, write',
    };
    setKeys(prev => [...prev, newKey]);
    setNewName(''); setShowNew(false);
  };

  return (
    <div className="space-y-4">
      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2d4d]">
          <div className="flex items-center gap-2">
            <Key size={13} className="text-cyan-400" />
            <span className="text-sm font-semibold text-white">API Keys</span>
            <span className="text-[10px] text-slate-500">{keys.length} keys</span>
          </div>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[11px] hover:bg-cyan-500/20 transition-colors">
            <Plus size={11} /> New Key
          </button>
        </div>
        {showNew && (
          <div className="p-4 border-b border-amber-500/20 bg-amber-500/5 flex items-center gap-3">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Key name (e.g. Staging Backend)"
              className="flex-1 px-3 py-1.5 rounded bg-[#080d1f] border border-[#1e2d4d] text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50" />
            <button onClick={createKey} className="px-3 py-1.5 rounded bg-cyan-500 text-[#05081a] text-[11px] font-semibold hover:bg-cyan-400 transition-colors">Create</button>
            <button onClick={() => setShowNew(false)} className="text-slate-500 hover:text-slate-300 transition-colors"><X size={14} /></button>
          </div>
        )}
        <div className="divide-y divide-[#1e2d4d]">
          {keys.map(key => (
            <div key={key.id} className="px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-sm font-medium text-white">{key.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#080d1f] border border-[#1e2d4d] text-slate-500 font-mono">{key.scope}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setRevealId(revealId === key.id ? null : key.id)} className="text-slate-500 hover:text-slate-300 transition-colors">
                    {revealId === key.id ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button onClick={() => handleCopy(`${key.prefix}...`, key.id)} className="text-slate-500 hover:text-slate-300 transition-colors">
                    {copied === key.id ? <CheckCircle size={13} className="text-green-400" /> : <Copy size={13} />}
                  </button>
                  <button onClick={() => deleteKey(key.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-mono">
                <span className="text-slate-500">{revealId === key.id ? `${key.prefix}••••••••••••••••` : `${key.prefix}••••••••`}</span>
                <span className="text-slate-600">Created {key.created}</span>
                <span className="text-slate-600">Last used: {key.lastUsed}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border border-amber-500/20 rounded-lg bg-amber-500/5 p-4 flex items-start gap-3">
        <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] text-amber-300 font-medium mb-0.5">Keep your API keys secure</p>
          <p className="text-[11px] text-slate-400">Never expose keys in client-side code or public repositories. Rotate keys immediately if compromised.</p>
        </div>
      </div>
    </div>
  );
}

/* ── Security ── */
function SecuritySection() {
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [ipAllowlist, setIpAllowlist] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('8');
  const [ipEntry, setIpEntry] = useState('');
  const [allowedIps, setAllowedIps] = useState(['10.0.0.0/8', '192.168.1.0/24']);

  const removeIp = (ip: string) => setAllowedIps(prev => prev.filter(i => i !== ip));
  const addIp = () => {
    if (ipEntry.trim()) { setAllowedIps(prev => [...prev, ipEntry.trim()]); setIpEntry(''); }
  };

  const sessions = [
    { device: 'Chrome · macOS', location: 'London, UK', last: 'Active now', current: true },
    { device: 'Firefox · Ubuntu', location: 'London, UK', last: '2 hours ago', current: false },
    { device: 'Mobile Safari · iOS', location: 'New York, US', last: '3 days ago', current: false },
  ];

  return (
    <div className="space-y-4">
      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
        <SectionHeader icon={Shield} title="Authentication" />
        <div className="divide-y divide-[#1e2d4d]">
          {[
            { label: 'Two-Factor Authentication', desc: 'Require TOTP or hardware key at login.', value: mfaEnabled, setter: setMfaEnabled },
            { label: 'Single Sign-On (SSO)', desc: 'Delegate authentication to your identity provider.', value: ssoEnabled, setter: setSsoEnabled },
            { label: 'IP Allowlist', desc: 'Restrict access to specific IP ranges only.', value: ipAllowlist, setter: setIpAllowlist },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <div className="text-sm font-medium text-white">{item.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
              </div>
              <Toggle checked={item.value} onChange={item.setter} />
            </div>
          ))}
        </div>
      </div>

      {ipAllowlist && (
        <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
          <SectionHeader icon={Globe} title="Allowed IP Ranges" />
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <input value={ipEntry} onChange={e => setIpEntry(e.target.value)} onKeyDown={e => e.key === 'Enter' && addIp()}
                placeholder="e.g. 203.0.113.0/24" className="flex-1 px-3 py-1.5 rounded bg-[#080d1f] border border-[#1e2d4d] text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50" />
              <button onClick={addIp} className="px-3 py-1.5 rounded bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 text-[11px] hover:bg-cyan-500/25 transition-colors">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allowedIps.map(ip => (
                <div key={ip} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#080d1f] border border-[#1e2d4d]">
                  <span className="text-[11px] font-mono text-slate-300">{ip}</span>
                  <button onClick={() => removeIp(ip)} className="text-slate-600 hover:text-red-400 transition-colors"><X size={10} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2d4d]">
          <div className="flex items-center gap-2">
            <Smartphone size={13} className="text-cyan-400" />
            <span className="text-sm font-semibold text-white">Active Sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-slate-500">Timeout (hours)</label>
            <input value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} type="number" min={1} max={24}
              className="w-12 px-2 py-0.5 rounded bg-[#080d1f] border border-[#1e2d4d] text-sm text-slate-300 text-center focus:outline-none" />
          </div>
        </div>
        <div className="divide-y divide-[#1e2d4d]">
          {sessions.map(s => (
            <div key={s.device} className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{s.device}</span>
                  {s.current && <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/25 text-green-400">Current</span>}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{s.location} · {s.last}</div>
              </div>
              {!s.current && (
                <button className="text-[11px] text-red-400 hover:text-red-300 transition-colors">Revoke</button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
        <SectionHeader icon={Lock} title="Danger Zone" />
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between p-3 rounded border border-red-500/20 bg-red-500/5">
            <div>
              <div className="text-sm font-medium text-red-400">Revoke All Sessions</div>
              <div className="text-[11px] text-slate-500">Log out all devices except this one.</div>
            </div>
            <button className="px-3 py-1.5 rounded border border-red-500/30 text-red-400 text-[11px] hover:bg-red-500/10 transition-colors">Revoke All</button>
          </div>
          <div className="flex items-center justify-between p-3 rounded border border-red-500/20 bg-red-500/5">
            <div>
              <div className="text-sm font-medium text-red-400">Delete Account</div>
              <div className="text-[11px] text-slate-500">Permanently remove your account and all data.</div>
            </div>
            <button className="px-3 py-1.5 rounded border border-red-500/30 text-red-400 text-[11px] hover:bg-red-500/10 transition-colors">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Theme ── */
type ColorTheme = 'cyber' | 'stealth' | 'aurora';
type Density = 'compact' | 'comfortable' | 'spacious';

function ThemeSection() {
  const [theme, setTheme] = useState<ColorTheme>('cyber');
  const [density, setDensity] = useState<Density>('comfortable');
  const [mode, setMode] = useState<'dark' | 'light' | 'system'>('dark');
  const [animations, setAnimations] = useState(true);
  const [glowEffects, setGlowEffects] = useState(true);
  const [compactSidebar, setCompactSidebar] = useState(false);
  const [monoFont, setMonoFont] = useState('JetBrains Mono');

  const themes: { id: ColorTheme; label: string; accent: string; preview: string[] }[] = [
    { id: 'cyber', label: 'Cyber', accent: '#22d3ee', preview: ['#22d3ee', '#2dd4bf', '#818cf8'] },
    { id: 'stealth', label: 'Stealth', accent: '#94a3b8', preview: ['#94a3b8', '#64748b', '#475569'] },
    { id: 'aurora', label: 'Aurora', accent: '#4ade80', preview: ['#4ade80', '#22d3ee', '#a855f7'] },
  ];

  const densities: { id: Density; label: string; desc: string }[] = [
    { id: 'compact', label: 'Compact', desc: 'More content, less padding' },
    { id: 'comfortable', label: 'Comfortable', desc: 'Balanced spacing' },
    { id: 'spacious', label: 'Spacious', desc: 'Relaxed layout' },
  ];

  const modes = [
    { id: 'dark' as const, label: 'Dark', icon: Moon },
    { id: 'light' as const, label: 'Light', icon: Sun },
    { id: 'system' as const, label: 'System', icon: Laptop },
  ];

  return (
    <div className="space-y-4">
      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
        <SectionHeader icon={Palette} title="Color Theme" />
        <div className="p-5 grid grid-cols-3 gap-3">
          {themes.map(t => (
            <button key={t.id} onClick={() => setTheme(t.id)}
              className={`rounded-xl border p-4 text-left transition-all ${theme === t.id ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-[#1e2d4d] bg-[#080d1f] hover:border-[#2d4070]'}`}>
              <div className="flex gap-1.5 mb-3">
                {t.preview.map(c => <div key={c} className="w-5 h-5 rounded-full" style={{ backgroundColor: c }} />)}
              </div>
              <div className={`text-sm font-semibold ${theme === t.id ? 'text-white' : 'text-slate-400'}`}>{t.label}</div>
              {theme === t.id && <div className="text-[9px] text-cyan-400 mt-0.5">Active</div>}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
        <SectionHeader icon={Laptop} title="Display Mode" />
        <div className="p-5">
          <div className="grid grid-cols-3 gap-3">
            {modes.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${mode === m.id ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400' : 'border-[#1e2d4d] bg-[#080d1f] text-slate-400 hover:border-[#2d4070]'}`}>
                <m.icon size={14} />
                <span className="text-[11px] font-medium">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
        <SectionHeader icon={Palette} title="UI Density" />
        <div className="p-5 grid grid-cols-3 gap-3">
          {densities.map(d => (
            <button key={d.id} onClick={() => setDensity(d.id)}
              className={`rounded-lg border p-3 text-left transition-all ${density === d.id ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-[#1e2d4d] bg-[#080d1f] hover:border-[#2d4070]'}`}>
              <div className={`text-sm font-semibold mb-0.5 ${density === d.id ? 'text-cyan-400' : 'text-slate-400'}`}>{d.label}</div>
              <div className="text-[9px] text-slate-600">{d.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
        <SectionHeader icon={Palette} title="Visual Effects" />
        <div className="divide-y divide-[#1e2d4d]">
          {[
            { label: 'Animations', desc: 'Smooth transitions and micro-interactions.', value: animations, setter: setAnimations },
            { label: 'Glow Effects', desc: 'Neon glow on active elements and alerts.', value: glowEffects, setter: setGlowEffects },
            { label: 'Compact Sidebar', desc: 'Collapse sidebar labels, show icons only.', value: compactSidebar, setter: setCompactSidebar },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <div className="text-sm font-medium text-white">{item.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
              </div>
              <Toggle checked={item.value} onChange={item.setter} />
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-[#1e2d4d]">
          <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Monospace Font</label>
          <div className="relative">
            <select value={monoFont} onChange={e => setMonoFont(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#080d1f] border border-[#1e2d4d] text-sm text-slate-300 focus:outline-none appearance-none">
              <option>JetBrains Mono</option><option>Fira Code</option><option>IBM Plex Mono</option><option>Source Code Pro</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
          <div className="mt-2 px-3 py-2 rounded bg-[#080d1f] border border-[#1e2d4d]">
            <code className="text-[11px] text-green-400" style={{ fontFamily: monoFont }}>
              kubectl rollout restart deployment/auth-service
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Attention Policy ── */
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? 'http://localhost:3001';

function AttentionPolicySection() {
  const [policy, setPolicy] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const severityOptions = ['AUTO', 'WATCH', 'ESCALATE'];
  const [severityDefaults, setSeverityDefaults] = useState<Record<string, string>>({
    LOW: 'AUTO', MEDIUM: 'WATCH', HIGH: 'ESCALATE', CRITICAL: 'ESCALATE'
  });
  const [alwaysEscalateServices, setAlwaysEscalateServices] = useState<string[]>(['payment-service', 'auth-service']);
  const [alwaysAutoServices, setAlwaysAutoServices] = useState<string[]>(['cache-redis', 'cdn-edge']);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('07:00');
  const [minAutoConfidence, setMinAutoConfidence] = useState(70);
  const [recurrenceWindowDays, setRecurrenceWindowDays] = useState(7);
  const [recurrenceThreshold, setRecurrenceThreshold] = useState(2);
  const [escalateInput, setEscalateInput] = useState('');
  const [autoInput, setAutoInput] = useState('');

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/attention-policy`);
      const data = await res.json();
      if (data.success && data.policy) {
        setPolicy(data.policy);
        setSeverityDefaults(data.policy.severityDefaults || {});
        setAlwaysEscalateServices(data.policy.alwaysEscalateServices || []);
        setAlwaysAutoServices(data.policy.alwaysAutoServices || []);
        if (data.policy.quietHours) {
          const start = String(data.policy.quietHours.start).padStart(2, '0');
          const end = String(data.policy.quietHours.end).padStart(2, '0');
          setQuietStart(`${start}:00`);
          setQuietEnd(`${end}:00`);
        }
        setMinAutoConfidence(Math.round((data.policy.minAutoConfidence || 0.7) * 100));
        setRecurrenceWindowDays(data.policy.recurrenceWindowDays || 7);
        setRecurrenceThreshold(data.policy.recurrenceThreshold || 2);
      }
    } catch (err) {
      console.error('Failed to fetch policy:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const updates = {
        severityDefaults,
        alwaysEscalateServices,
        alwaysAutoServices,
        quietHours: {
          start: parseInt(quietStart.split(':')[0]),
          end: parseInt(quietEnd.split(':')[0])
        },
        minAutoConfidence: minAutoConfidence / 100,
        recurrenceWindowDays,
        recurrenceThreshold
      };
      const res = await fetch(`${BACKEND_URL}/api/attention-policy`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Attention policy saved successfully' });
        await fetchPolicy();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save policy' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save policy' });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateDefaults = async () => {
    setGenerating(true);
    setMessage(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/attention-policy/defaults`);
      const data = await res.json();
      if (data.success && data.policy) {
        setSeverityDefaults(data.policy.severityDefaults || {});
        setAlwaysEscalateServices(data.policy.alwaysEscalateServices || []);
        setAlwaysAutoServices(data.policy.alwaysAutoServices || []);
        if (data.policy.quietHours) {
          const start = String(data.policy.quietHours.start).padStart(2, '0');
          const end = String(data.policy.quietHours.end).padStart(2, '0');
          setQuietStart(`${start}:00`);
          setQuietEnd(`${end}:00`);
        }
        setMinAutoConfidence(Math.round((data.policy.minAutoConfidence || 0.7) * 100));
        setRecurrenceWindowDays(data.policy.recurrenceWindowDays || 7);
        setRecurrenceThreshold(data.policy.recurrenceThreshold || 2);
        setMessage({ type: 'success', text: 'Defaults generated from incident history' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to generate defaults' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to generate defaults' });
    } finally {
      setGenerating(false);
    }
  };

  const addEscalateService = () => {
    if (escalateInput.trim() && !alwaysEscalateServices.includes(escalateInput.trim())) {
      setAlwaysEscalateServices([...alwaysEscalateServices, escalateInput.trim()]);
      setEscalateInput('');
    }
  };

  const addAutoService = () => {
    if (autoInput.trim() && !alwaysAutoServices.includes(autoInput.trim())) {
      setAlwaysAutoServices([...alwaysAutoServices, autoInput.trim()]);
      setAutoInput('');
    }
  };

  const removeEscalateService = (svc: string) => {
    setAlwaysEscalateServices(alwaysEscalateServices.filter(s => s !== svc));
  };

  const removeAutoService = (svc: string) => {
    setAlwaysAutoServices(alwaysAutoServices.filter(s => s !== svc));
  };

  return (
    <div className="space-y-4">
      {message && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
          message.type === 'success' 
            ? 'border-green-500/30 bg-green-500/10 text-green-400' 
            : 'border-red-500/30 bg-red-500/10 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
          <span className="text-[11px]">{message.text}</span>
        </div>
      )}

      <div className="border border-[#1e2d4d] rounded-lg bg-[#0c1228] overflow-hidden">
        <SectionHeader icon={Target} title="Attention Policy" desc="Configure how IncidentMind routes attention for incidents." />
        <div className="p-5 space-y-6">
          {/* Severity Defaults */}
          <div>
            <div className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-3">Severity → Default Attention Level</div>
            <div className="grid grid-cols-4 gap-3">
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map(sev => (
                <div key={sev} className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider">{sev}</label>
                  <select
                    value={severityDefaults[sev] || 'WATCH'}
                    onChange={e => setSeverityDefaults(p => ({ ...p, [sev]: e.target.value }))}
                    className="w-full px-3 py-2 rounded bg-[#080d1f] border border-[#1e2d4d] text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 appearance-none"
                  >
                    {severityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Always Escalate Services */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Always Escalate Services</div>
              <div className="flex items-center gap-2">
                <input
                  value={escalateInput}
                  onChange={e => setEscalateInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addEscalateService()}
                  placeholder="e.g. payment-service"
                  className="px-2 py-1.5 rounded bg-[#080d1f] border border-[#1e2d4d] text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 w-48"
                />
                <button onClick={addEscalateService} className="px-2 py-1.5 rounded bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[11px] hover:bg-cyan-500/20 transition-colors">Add</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {alwaysEscalateServices.map(svc => (
                <span key={svc} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono">
                  {svc}
                  <button onClick={() => removeEscalateService(svc)} className="text-red-400 hover:text-red-300"><X size={10} /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Always Auto Services */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Always Auto-Handle Services</div>
              <div className="flex items-center gap-2">
                <input
                  value={autoInput}
                  onChange={e => setAutoInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addAutoService()}
                  placeholder="e.g. cache-redis"
                  className="px-2 py-1.5 rounded bg-[#080d1f] border border-[#1e2d4d] text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 w-48"
                />
                <button onClick={addAutoService} className="px-2 py-1.5 rounded bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[11px] hover:bg-cyan-500/20 transition-colors">Add</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {alwaysAutoServices.map(svc => (
                <span key={svc} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-mono">
                  {svc}
                  <button onClick={() => removeAutoService(svc)} className="text-green-400 hover:text-green-300"><X size={10} /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Quiet Hours Start</label>
              <input type="time" value={quietStart} onChange={e => setQuietStart(e.target.value)} className="w-full px-3 py-2 rounded bg-[#080d1f] border border-[#1e2d4d] text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Quiet Hours End</label>
              <input type="time" value={quietEnd} onChange={e => setQuietEnd(e.target.value)} className="w-full px-3 py-2 rounded bg-[#080d1f] border border-[#1e2d4d] text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50" />
            </div>
          </div>

          {/* Min Auto Confidence */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider">Min Auto-Patch Confidence</label>
              <span className="text-sm font-mono text-cyan-400">{minAutoConfidence}%</span>
            </div>
            <input type="range" min={0} max={100} value={minAutoConfidence} onChange={e => setMinAutoConfidence(parseInt(e.target.value))} className="w-full h-1.5 rounded-full appearance-none bg-[#1e2d4d] cursor-pointer accent-cyan-500" />
          </div>

          {/* Recurrence Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Recurrence Window (days)</label>
              <input type="number" min={1} max={30} value={recurrenceWindowDays} onChange={e => setRecurrenceWindowDays(parseInt(e.target.value) || 1)} className="w-full px-3 py-2 rounded bg-[#080d1f] border border-[#1e2d4d] text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Recurrence Threshold</label>
              <input type="number" min={1} max={10} value={recurrenceThreshold} onChange={e => setRecurrenceThreshold(parseInt(e.target.value) || 1)} className="w-full px-3 py-2 rounded bg-[#080d1f] border border-[#1e2d4d] text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-[#1e2d4d]">
            <button onClick={handleGenerateDefaults} disabled={generating} className="flex items-center gap-2 px-4 py-2 rounded border border-amber-500/30 text-amber-400 text-[11px] font-medium hover:bg-amber-500/10 transition-colors disabled:opacity-50">
              <RotateCcw size={12} className={generating ? 'animate-spin' : ''} />
              Regenerate from History
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-[#05081a] text-[11px] font-semibold transition-colors disabled:opacity-50">
              <Save size={12} /> {saving ? 'Saving...' : 'Save Policy'}
            </button>
          </div>
        </div>
      </div>

      <div className="border border-amber-500/20 rounded-lg bg-amber-500/5 p-4 flex items-start gap-3">
        <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] text-amber-300 font-medium mb-0.5">How it works</p>
          <ul className="text-[10px] text-slate-400 space-y-1 ml-4 list-disc">
            <li>Severity defaults set the baseline attention level per severity</li>
            <li>Always-escalate services bypass scoring and force ESCALATE</li>
            <li>Always-auto services bypass scoring and force AUTO</li>
            <li>Quiet hours suppress non-critical notifications</li>
            <li>Regenerate from history analyzes MongoDB to suggest optimal defaults</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ── Root Component ── */
export default function Settings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [hasChanges] = useState(true);

  const sectionContent: Record<SettingsSection, React.ReactNode> = {
    'profile':           <ProfileSection />,
    'notifications':     <NotificationsSection />,
    'integrations':      <IntegrationsSection />,
    'ai-agents':         <AIAgentsSection />,
    'api-keys':          <ApiKeysSection />,
    'security':          <SecuritySection />,
    'theme':             <ThemeSection />,
    'attention-policy':  <AttentionPolicySection />,
  };

  const sectionTitles: Record<SettingsSection, { title: string; desc: string }> = {
    'profile':           { title: 'Profile',          desc: 'Manage your personal information and account details.' },
    'notifications':     { title: 'Notifications',    desc: 'Configure how and when you receive alerts.' },
    'integrations':      { title: 'Integrations',     desc: 'Connect Slack, Email, PagerDuty, and GitHub.' },
    'ai-agents':         { title: 'AI Agents',         desc: 'Configure each agent\'s model, thresholds, and behavior.' },
    'api-keys':          { title: 'API Keys',          desc: 'Manage access keys for programmatic API access.' },
    'security':          { title: 'Security',          desc: 'Two-factor auth, sessions, and IP allowlisting.' },
    'theme':             { title: 'Theme',             desc: 'Customize the visual appearance of the interface.' },
    'attention-policy':  { title: 'Attention Policy',  desc: 'Configure severity defaults, service rules, quiet hours, and auto-tune from history.' },
  };

  return (
    <div className="flex h-screen bg-[#05081a] pt-12 overflow-hidden">

      {/* Sidebar */}
      <aside className="w-52 shrink-0 border-r border-[#1e2d4d] bg-[#080d1f] flex flex-col">
        <div className="p-4 border-b border-[#1e2d4d]">
          <div className="text-sm font-semibold text-white">Settings</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Platform Configuration</div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {sidebarItems.map(item => (
            <button key={item.id} onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left transition-all ${
                activeSection === item.id
                  ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}>
              <item.icon size={14} className={activeSection === item.id ? 'text-cyan-400' : 'text-slate-500'} />
              <span className="text-[12px] font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-[#1e2d4d] space-y-2">
          <button className="w-full py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2">
            <Zap size={12} /> Deploy Changes
          </button>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
            <FileText size={12} /> Documentation
          </button>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
            <HelpCircle size={12} /> Support
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-3.5 border-b border-[#1e2d4d] bg-[#080d1f] shrink-0">
          <h2 className="text-base font-bold text-white">{sectionTitles[activeSection].title}</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">{sectionTitles[activeSection].desc}</p>
        </div>
        <div className="flex-1 overflow-y-auto pb-6">
          <div className="px-6 pt-5">
            {sectionContent[activeSection]}
          </div>
        </div>

        {/* Footer bar */}
        {hasChanges && (
          <div className="h-12 shrink-0 flex items-center justify-between px-6 border-t border-amber-500/20 bg-[#0c0e1a]">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 live-dot" />
              <span className="text-[11px] text-slate-400">Unsaved changes will be deployed to the production agent cluster.</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-4 py-1.5 rounded border border-[#1e2d4d] text-slate-300 text-[11px] font-medium hover:border-slate-500 transition-colors">
                <X size={11} /> Cancel
              </button>
              <button className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-[#05081a] text-[11px] font-semibold transition-colors">
                <Save size={11} /> Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
