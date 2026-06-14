export type AgentName = 'Orchestrator' | 'Watcher' | 'Diagnoser' | 'Patcher' | 'Communicator';
export type SSEEventType = 'agent_start' | 'agent_complete' | 'analysis_complete';
export type Severity = 'critical' | 'high' | 'medium';

export interface WatcherResult {
  anomalyDetected: boolean;
  confidence: number;
  description: string;
  severity: string;
  affectedComponents: string[];
}

export interface DiagnoserResult {
  rootCause: string;
  contributingFactors: string[];
  confidence: number;
  likelyImpact: string;
  suggestedInvestigation: string[];
}

export interface PatcherResult {
  recommendedFix: string;
  fixType: string;
  commands: string[];
  rollbackPlan: string;
  estimatedTime: string;
  riskLevel: string;
}

export interface CommunicatorResult {
  slackMessage: string;
  incidentReport: string;
  runbookEntry: string;
  priority: string;
  notificationChannels: string[];
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

export type SSEEvent = AgentStartEvent | AgentCompleteEvent | AnalysisCompleteEvent;

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
  events: SSEEvent[];
}
