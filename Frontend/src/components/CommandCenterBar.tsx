import { Activity, AlertTriangle, Bot, CheckCircle2, Radio, ShieldCheck, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

const events = [
  'Watcher detected elevated CPU utilization',
  'Diagnoser correlated recent deployment logs',
  'Attention Router scored incident for AUTO response',
  'Patcher prepared a remediation plan',
  'Communicator drafted operator notification',
];

const agents = [
  ['Orchestrator', 'CONTROL'],
  ['Watcher', 'DETECT'],
  ['Diagnoser', 'ANALYZE'],
  ['Router', 'DECIDE'],
  ['Patcher', 'REMEDIATE'],
  ['Communicator', 'REPORT'],
];

export default function CommandCenterBar() {
  const [eventIndex, setEventIndex] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setEventIndex(i => (i + 1) % events.length), 2600);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="command-center-bar" aria-label="IncidentMind command center">
      <div className="command-center-top">
        <div className="command-center-title">
          <div className="command-center-icon"><ShieldCheck size={16} /></div>
          <div>
            <div className="command-center-kicker"><span className="live-dot command-live-dot" /> AI OPERATIONS COMMAND CENTER</div>
            <div className="command-center-heading">Autonomous response network <span>online</span></div>
          </div>
        </div>
        <div className="command-center-health"><Radio size={12} /> SSE CONNECTED <strong>99.98%</strong></div>
      </div>

      <div className="command-agent-row">
        {agents.map(([name, role], index) => (
          <div className="command-agent" key={name}>
            <div className="command-agent-number">0{index + 1}</div>
            <div><strong>{name}</strong><small>{role}</small></div>
            <span className="command-agent-status"><CheckCircle2 size={11} /></span>
          </div>
        ))}
      </div>

      <div className="command-center-bottom">
        <div className="command-stream-label"><Activity size={12} /> LIVE EVENT STREAM</div>
        <div className="command-stream-event" key={eventIndex}>
          <span className="event-dot" /> {events[eventIndex]}
        </div>
        <div className="command-stream-meta"><Bot size={11} /> 6 agents <span>•</span> <Zap size={11} /> autonomous mode</div>
      </div>
    </section>
  );
}
