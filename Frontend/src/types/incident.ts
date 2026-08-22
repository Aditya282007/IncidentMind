export type AgentName = 'Orchestrator' | 'Watcher' | 'Diagnoser' | 'AttentionRouter' | 'Patcher' | 'Communicator';
export type SSEEventType = 'agent_start' | 'agent_complete' | 'analysis_complete' | 'attention_routed' | 'notification_routed';
export type Severity = 'critical' | 'high' | 'medium';

export interface WatcherResult {
  anomalyDetected: boolean;
  confidence: number;
  description: string;
  severity: string;
  affectedComponents: string[];
}

export interface RetrievedContext {
  pastIncidents?: Array<{ content: string; metadata: Record<string, any> }>;
  runbooks?: Array<{ content: string; metadata: Record<string, any> }>;
  patchCommands?: Array<{ content: string; metadata: Record<string, any> }>;
}

export interface DiagnoserResult {
  rootCause: string;
  contributingFactors: string[];
  confidence: number;
  likelyImpact: string;
  suggestedInvestigation: string[];
  retrievedContext?: RetrievedContext;
}

export interface PatcherResult {
  recommendedFix: string;
  fixType: string;
  commands: string[];
  rollbackPlan: string;
  estimatedTime: string;
  riskLevel: string;
  retrievedContext?: RetrievedContext;
}

export interface CommunicatorResult {
  slackMessage: string;
  incidentReport: string;
  runbookEntry: string;
  priority: string;
  notificationChannels: string[];
  retrievedContext?: RetrievedContext;
}

export interface OrchestratorResult {
  sequence: AgentName[];
  context: Record<string, any>;
  instructions: string;
}

export type AgentResult = WatcherResult | DiagnoserResult | PatcherResult | CommunicatorResult;
export type AgentResultExtended = AgentResult | OrchestratorResult;

export interface AgentStartEvent {
  type: 'agent_start';
  agent: AgentName;
}

export interface AgentCompleteEvent {
  type: 'agent_complete';
  agent: AgentName;
  result: AgentResultExtended;
}

export interface AnalysisCompleteEvent {
  type: 'analysis_complete';
  result: {
    incidentId: string;
    status: string;
    timestamp: string;
    orchestrator: OrchestratorResult;
    watcher: WatcherResult;
    diagnoser: DiagnoserResult;
    patcher: PatcherResult;
    communicator: CommunicatorResult;
  };
}

export interface AttentionRoutedEvent {
  type: 'attention_routed';
  attentionLevel: 'AUTO' | 'WATCH' | 'ESCALATE';
  attentionScore: number;
  reason: string;
}

export interface NotificationRoutedEvent {
  type: 'notification_routed';
  attentionLevel: 'AUTO' | 'WATCH' | 'ESCALATE';
  channelsSent: string[];
  channelsSuppressed: string[];
  suppressedReason: string | null;
}

export type SSEEvent = AgentStartEvent | AgentCompleteEvent | AnalysisCompleteEvent | AttentionRoutedEvent | NotificationRoutedEvent;

export interface AgentState {
  status: 'idle' | 'active' | 'complete';
  result?: AgentResultExtended;
  startedAt?: number;
  completedAt?: number;
}

export interface IncidentScenario {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  component: string;
  tags: string[];
  metrics: {
    cpu: number;
    latency: number;
    errorRate: number;
    memory: number;
  };
  attentionLevel?: 'AUTO' | 'WATCH' | 'ESCALATE';
  attentionScore?: number;
  attentionReason?: string;
  notificationPlan?: {
    slack: { sent: boolean; reason?: string };
    pagerduty: { sent: boolean; reason?: string };
    github: { sent: boolean; reason?: string };
  };
  events: SSEEvent[];
}
