import { type ElementType, useState } from 'react';
import {
  Bell,
  Bot,
  ChevronRight,
  Globe,
  Key,
  Link2,
  Mail,
  Plus,
  Save,
  Trash2,
  Users,
} from 'lucide-react';
import Footer from '../components/Footer';

type Section = 'general' | 'alerts' | 'integrations' | 'agents' | 'team';

const SECTIONS: { id: Section; label: string; icon: ElementType; desc: string }[] = [
  { id: 'general',      label: 'General',               icon: Globe,   desc: 'Organization settings'         },
  { id: 'alerts',       label: 'Alerts & Notifications', icon: Bell,    desc: 'Thresholds & channels'         },
  { id: 'integrations', label: 'Integrations',           icon: Link2,   desc: 'Connect external services'     },
  { id: 'agents',       label: 'Agent Configuration',    icon: Bot,     desc: 'AI agent behavior & policies'  },
  { id: 'team',         label: 'Team & Access',          icon: Users,   desc: 'Members & permissions'         },
];

/* ── reusable form primitives ── */
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm text-gray-300 font-medium mb-1.5">{children}</label>;
}
function HelpText({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-600 mt-1">{children}</p>;
}
function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#111] border border-[#2a2a2a] focus:border-[#00e5c3]/60 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none transition-colors"
    />
  );
}
function Toggle({ enabled, onChange, label }: { enabled: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#1a1a1a] last:border-0">
      <span className="text-sm text-gray-300">{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${enabled ? 'bg-[#00e5c3]' : 'bg-[#2a2a2a]'}`}
        style={{ height: '22px', width: '40px' }}
      >
        <span
          className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-[19px]' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  );
}
function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#111] border border-[#2a2a2a] focus:border-[#00e5c3]/60 rounded-lg px-3 py-2.5 text-sm text-gray-200 outline-none transition-colors cursor-pointer"
    >
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5 sm:p-6">
      <h3 className="text-white font-semibold mb-5 pb-4 border-b border-[#1e1e1e]">{title}</h3>
      {children}
    </div>
  );
}
function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 last:mb-0">
      <Label>{label}</Label>
      {children}
      {help && <HelpText>{help}</HelpText>}
    </div>
  );
}

/* ── section panels ── */
function GeneralPanel() {
  const [org, setOrg] = useState('Acme Corp SRE');
  const [tz, setTz] = useState('UTC');
  const [slug, setSlug] = useState('acme-corp');
  return (
    <div className="space-y-5">
      <SectionCard title="Organization">
        <Field label="Organization Name">
          <TextInput value={org} onChange={setOrg} placeholder="My Organization" />
        </Field>
        <Field label="Slug" help="Used in API endpoints and report URLs.">
          <div className="flex items-center gap-0">
            <span className="bg-[#0d0d0d] border border-r-0 border-[#2a2a2a] rounded-l-lg px-3 py-2.5 text-sm text-gray-500">incidentmind.io/</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 bg-[#111] border border-[#2a2a2a] focus:border-[#00e5c3]/60 rounded-r-lg px-3 py-2.5 text-sm text-gray-200 outline-none transition-colors"
            />
          </div>
        </Field>
        <Field label="Timezone">
          <SelectInput value={tz} onChange={setTz} options={['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo', 'Asia/Singapore']} />
        </Field>
      </SectionCard>

      <SectionCard title="Preferences">
        <Toggle enabled={true}  onChange={() => {}} label="Dark mode (always on)" />
        <Toggle enabled={true}  onChange={() => {}} label="Auto-refresh dashboard every 30s" />
        <Toggle enabled={false} onChange={() => {}} label="Show resolved incidents in main feed" />
        <Toggle enabled={true}  onChange={() => {}} label="Display cost savings estimates" />
      </SectionCard>

      <SectionCard title="Danger Zone">
        <p className="text-gray-400 text-sm mb-4">Irreversible and destructive actions.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex items-center gap-2 border border-red-700/50 text-red-400 hover:bg-red-950/20 text-sm px-4 py-2 rounded-lg transition-colors">
            <Trash2 size={14} />
            Delete All Incident Data
          </button>
          <button className="flex items-center gap-2 border border-red-700/50 text-red-400 hover:bg-red-950/20 text-sm px-4 py-2 rounded-lg transition-colors">
            <Trash2 size={14} />
            Delete Organization
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

function AlertsPanel() {
  const [cpuThreshold, setCpuThreshold] = useState('85');
  const [memThreshold, setMemThreshold] = useState('90');
  const [latencyThreshold, setLatencyThreshold] = useState('500');
  const [emailNotif, setEmailNotif] = useState(true);
  const [slackNotif, setSlackNotif] = useState(true);
  const [pagerNotif, setPagerNotif] = useState(false);
  const [smsNotif, setSmsNotif] = useState(false);
  return (
    <div className="space-y-5">
      <SectionCard title="Alert Thresholds">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="CPU Usage (%)" help="Alert when CPU exceeds this value.">
            <div className="flex items-center gap-3">
              <input
                type="range" min={50} max={100} value={cpuThreshold}
                onChange={(e) => setCpuThreshold(e.target.value)}
                className="flex-1 accent-[#00e5c3]"
              />
              <span className="text-[#00e5c3] font-mono text-sm w-10 text-right">{cpuThreshold}%</span>
            </div>
          </Field>
          <Field label="Memory Usage (%)" help="Alert when memory exceeds this value.">
            <div className="flex items-center gap-3">
              <input
                type="range" min={50} max={100} value={memThreshold}
                onChange={(e) => setMemThreshold(e.target.value)}
                className="flex-1 accent-[#00e5c3]"
              />
              <span className="text-[#00e5c3] font-mono text-sm w-10 text-right">{memThreshold}%</span>
            </div>
          </Field>
          <Field label="Latency (ms)" help="Alert when p99 latency exceeds this.">
            <TextInput value={latencyThreshold} onChange={setLatencyThreshold} placeholder="500" />
          </Field>
          <Field label="Error Rate (%)" help="Alert when 5xx rate exceeds this.">
            <TextInput value="5" onChange={() => {}} placeholder="5" />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Notification Channels">
        <Toggle enabled={emailNotif}  onChange={setEmailNotif}  label="Email notifications" />
        <Toggle enabled={slackNotif}  onChange={setSlackNotif}  label="Slack notifications" />
        <Toggle enabled={pagerNotif}  onChange={setPagerNotif}  label="PagerDuty escalations" />
        <Toggle enabled={smsNotif}    onChange={setSmsNotif}    label="SMS (critical only)" />
      </SectionCard>

      <SectionCard title="Escalation Policy">
        <Field label="Escalate after (minutes)" help="If not auto-resolved, escalate to on-call engineer.">
          <SelectInput value="5" onChange={() => {}} options={['2', '5', '10', '15', '30', 'Never']} />
        </Field>
        <Field label="On-call rotation">
          <SelectInput value="Primary Team" onChange={() => {}} options={['Primary Team', 'Secondary Team', 'All Engineers', 'Management']} />
        </Field>
      </SectionCard>
    </div>
  );
}

const integrations = [
  { name: 'Slack',      icon: '💬', desc: 'Post incident updates to channels.',              status: 'connected',    color: '#4A154B' },
  { name: 'PagerDuty',  icon: '🚨', desc: 'Trigger and resolve incidents automatically.',    status: 'disconnected', color: '#06AC38' },
  { name: 'Datadog',    icon: '📊', desc: 'Pull metrics and integrate APM traces.',           status: 'connected',    color: '#632CA6' },
  { name: 'GitHub',     icon: '🐙', desc: 'Link incidents to commits and PRs.',              status: 'connected',    color: '#24292E' },
  { name: 'Jira',       icon: '🔵', desc: 'Auto-create tickets for unresolved incidents.',   status: 'disconnected', color: '#0052CC' },
  { name: 'AWS',        icon: '☁️',  desc: 'CloudWatch alarms and EC2/ECS integration.',     status: 'connected',    color: '#FF9900' },
  { name: 'GCP',        icon: '🌐', desc: 'Cloud Monitoring and GKE metrics.',               status: 'disconnected', color: '#4285F4' },
  { name: 'Webhook',    icon: '🔗', desc: 'Send event payloads to any HTTP endpoint.',       status: 'disconnected', color: '#555' },
];

function IntegrationsPanel() {
  return (
    <div className="space-y-5">
      <SectionCard title="API Keys">
        <div className="space-y-3">
          {[
            { label: 'Production API Key', key: 'im_prod_••••••••••••4a2f' },
            { label: 'Development API Key', key: 'im_dev_••••••••••••9c1b' },
          ].map((k) => (
            <div key={k.label} className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">{k.label}</div>
                <div className="flex items-center gap-2 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2">
                  <Key size={13} className="text-gray-600 flex-shrink-0" />
                  <span className="font-mono text-sm text-gray-300 flex-1">{k.key}</span>
                  <button className="text-gray-500 hover:text-gray-200 text-xs transition-colors">Copy</button>
                </div>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-700/40 px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
                <Trash2 size={12} />
                Revoke
              </button>
            </div>
          ))}
          <button className="flex items-center gap-2 text-[#00e5c3] hover:text-[#00ccad] text-sm transition-colors mt-1">
            <Plus size={14} />
            Generate new key
          </button>
        </div>
      </SectionCard>

      <div>
        <h3 className="text-white font-semibold mb-3">Available Integrations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {integrations.map((intg) => (
            <div key={intg.name} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-[#111] border border-[#2a2a2a]">
                {intg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium">{intg.name}</div>
                <div className="text-gray-500 text-xs mt-0.5 truncate">{intg.desc}</div>
              </div>
              <button
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border whitespace-nowrap flex-shrink-0 transition-colors ${
                  intg.status === 'connected'
                    ? 'bg-green-900/30 text-green-400 border-green-700/40 hover:bg-green-900/50'
                    : 'bg-[#1a1a1a] text-gray-400 border-[#333] hover:border-[#555] hover:text-gray-200'
                }`}
              >
                {intg.status === 'connected' ? 'Connected' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const agents = [
  { name: 'Watcher',      role: 'Monitors metrics and detects anomalies',           enabled: true,  model: 'gemini-2.5-pro',   interval: '30s'  },
  { name: 'Diagnoser',    role: 'Performs root cause analysis',                     enabled: true,  model: 'gemini-2.5-flash', interval: 'On alert' },
  { name: 'Orchestrator', role: 'Coordinates recovery strategy and agent handoffs', enabled: true,  model: 'gemini-2.5-pro',   interval: 'On trigger' },
  { name: 'Patcher',      role: 'Executes safe configuration and code patches',     enabled: true,  model: 'gemini-2.5-flash', interval: 'On demand' },
  { name: 'Communicator', role: 'Sends status updates to stakeholders',             enabled: false, model: 'gemini-2.5-flash', interval: 'Post-resolve' },
];

function AgentsPanel() {
  const [agentStates, setAgentStates] = useState(agents.map((a) => a.enabled));
  const [autoApprove, setAutoApprove] = useState(false);
  const [dryRun, setDryRun] = useState(true);

  return (
    <div className="space-y-5">
      <SectionCard title="Global Agent Policies">
        <Toggle enabled={autoApprove} onChange={setAutoApprove} label="Auto-approve agent patches (skip human review)" />
        <Toggle enabled={dryRun}      onChange={setDryRun}      label="Dry-run mode (simulate patches, don't apply)" />
        <Toggle enabled={true}        onChange={() => {}}        label="Log all agent decisions for audit trail" />
        <Toggle enabled={true}        onChange={() => {}}        label="Notify on-call when agent confidence < 80%" />
      </SectionCard>

      <SectionCard title="Agent Configuration">
        <div className="space-y-3">
          {agents.map((agent, i) => (
            <div key={agent.name} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${agentStates[i] ? 'bg-[#0d2d24] border border-[#00e5c3]/30' : 'bg-[#1a1a1a] border border-[#2a2a2a]'}`}>
                    <Bot size={15} className={agentStates[i] ? 'text-[#00e5c3]' : 'text-gray-600'} />
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{agent.name}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{agent.role}</div>
                  </div>
                </div>
                <button
                  onClick={() => setAgentStates((s) => s.map((v, idx) => idx === i ? !v : v))}
                  className={`relative rounded-full transition-colors flex-shrink-0`}
                  style={{ height: '22px', width: '40px', background: agentStates[i] ? '#00e5c3' : '#2a2a2a' }}
                >
                  <span className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${agentStates[i] ? 'translate-x-[19px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-gray-600 mb-1 uppercase tracking-wider">Model</div>
                  <div className="text-xs text-gray-300 font-mono">{agent.model}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-600 mb-1 uppercase tracking-wider">Trigger</div>
                  <div className="text-xs text-gray-300 font-mono">{agent.interval}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

const teamMembers = [
  { name: 'Alex Chen',     email: 'alex.chen@acme.io',     role: 'Owner',    avatar: 'AC', status: 'active'  },
  { name: 'Maria Santos',  email: 'maria@acme.io',         role: 'Admin',    avatar: 'MS', status: 'active'  },
  { name: 'James Wright',  email: 'j.wright@acme.io',      role: 'Engineer', avatar: 'JW', status: 'active'  },
  { name: 'Priya Kapoor',  email: 'priya.k@acme.io',       role: 'Engineer', avatar: 'PK', status: 'active'  },
  { name: 'Tom Becker',    email: 'tbecker@acme.io',       role: 'Viewer',   avatar: 'TB', status: 'invited' },
];

const roleColors: Record<string, string> = {
  Owner:    'bg-purple-900/40 text-purple-300 border-purple-700/40',
  Admin:    'bg-blue-900/30 text-blue-300 border-blue-700/40',
  Engineer: 'bg-[#0d2d24] text-[#00e5c3] border-[#00e5c3]/30',
  Viewer:   'bg-[#1a1a1a] text-gray-400 border-[#333]',
};

function TeamPanel() {
  const [email, setEmail] = useState('');
  return (
    <div className="space-y-5">
      <SectionCard title="Invite Member">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 flex-1">
            <Mail size={14} className="text-gray-500 flex-shrink-0" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="bg-transparent text-sm text-gray-200 placeholder-gray-600 outline-none w-full"
            />
          </div>
          <SelectInput value="Engineer" onChange={() => {}} options={['Viewer', 'Engineer', 'Admin']} />
          <button className="flex items-center justify-center gap-2 bg-[#00e5c3] hover:bg-[#00ccad] text-[#0a1f1c] font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap">
            <Plus size={14} />
            Invite
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Members">
        <div className="space-y-1">
          {teamMembers.map((m) => (
            <div key={m.email} className="flex items-center gap-3 py-3 border-b border-[#1a1a1a] last:border-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-cyan-800 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {m.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">{m.name}</span>
                  {m.status === 'invited' && (
                    <span className="text-[10px] text-yellow-400 bg-yellow-900/20 border border-yellow-700/30 px-1.5 py-0.5 rounded">Invited</span>
                  )}
                </div>
                <div className="text-gray-500 text-xs truncate">{m.email}</div>
              </div>
              <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border ${roleColors[m.role]}`}>{m.role}</span>
              {m.role !== 'Owner' && (
                <button className="text-gray-600 hover:text-red-400 transition-colors ml-1">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Security">
        <Toggle enabled={true}  onChange={() => {}} label="Require two-factor authentication" />
        <Toggle enabled={false} onChange={() => {}} label="Enforce SSO (SAML 2.0)" />
        <Toggle enabled={true}  onChange={() => {}} label="Session timeout after 8 hours" />
        <Toggle enabled={false} onChange={() => {}} label="IP allowlist" />
      </SectionCard>
    </div>
  );
}

const panelComponents: Record<Section, React.ReactNode> = {
  general:      <GeneralPanel />,
  alerts:       <AlertsPanel />,
  integrations: <IntegrationsPanel />,
  agents:       <AgentsPanel />,
  team:         <TeamPanel />,
};

export default function Settings() {
  const [active, setActive] = useState<Section>('general');

  return (
    <div className="min-h-screen bg-[#0f0f0f] pt-[52px] flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full pt-8 pb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-white font-extrabold text-2xl sm:text-3xl">Settings</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your organization, agents &amp; integrations.</p>
          </div>
          <button className="flex items-center gap-2 bg-[#00e5c3] hover:bg-[#00ccad] text-[#0a1f1c] font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
            <Save size={14} />
            <span className="hidden sm:inline">Save Changes</span>
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-5 pb-8 flex-1">
        {/* Sidebar nav */}
        <aside className="md:w-56 lg:w-64 flex-shrink-0">
          {/* Mobile: horizontal scroll tabs */}
          <div className="md:hidden flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    active === s.id
                      ? 'bg-[#0d2d24] text-[#00e5c3] border border-[#00e5c3]/30'
                      : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a] hover:text-gray-200'
                  }`}
                >
                  <Icon size={14} />
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Desktop: vertical list */}
          <nav className="hidden md:block card p-2 space-y-0.5">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    active === s.id
                      ? 'bg-[#0d2d24] text-[#00e5c3]'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]'
                  }`}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{s.label}</div>
                    <div className="text-[10px] text-gray-600 truncate">{s.desc}</div>
                  </div>
                  <ChevronRight size={13} className={active === s.id ? 'text-[#00e5c3]' : 'text-gray-700'} />
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {panelComponents[active]}
        </div>
      </div>

      <Footer />
    </div>
  );
}
