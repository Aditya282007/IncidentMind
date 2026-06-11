console.log('Server file loaded');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
console.log('Environment variables loaded:');
console.log('OLLAMA_HOST:', process.env.OLLAMA_HOST);
console.log('OLLAMA_MODEL:', process.env.OLLAMA_MODEL);
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('__dirname:', __dirname);
console.log('process.cwd():', process.cwd());

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock incident data
const mockIncidents = [
  {
    id: 'incident-001',
    title: 'CPU spike detected on api-server-2',
    description: 'CPU usage exceeded 95% for 5 minutes on api-server-2',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    metrics: {
      cpuUsage: 97,
      memoryUsage: 78,
      requestLatency: 250,
      errorRate: 0.02
    }
  },
  {
    id: 'incident-002',
    title: 'Database connection pool exhaustion',
    description: 'Database connection pool exhausted causing query timeouts',
    timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    metrics: {
      cpuUsage: 45,
      memoryUsage: 82,
      requestLatency: 1200,
      errorRate: 0.15
    }
  }
];

// Agent definitions
const AGENTS = {
  WATCHER: {
    name: 'Watcher',
    role: 'Sensor',
    systemPrompt: `You are the Watcher agent in IncidentMind. Your role is to monitor system metrics and logs for anomalies.
    You receive raw metrics data and determine if there's an anomaly that requires attention.
    Output should be a structured JSON with:
    - anomalyDetected: boolean
    - confidence: number (0-1)
    - description: string describing what was detected
    - severity: string ('low', 'medium', 'high', 'critical')
    - affectedComponents: array of strings

    Only output valid JSON, no additional text.`
  },
  DIAGNOSER: {
    name: 'Diagnoser',
    role: 'Analyst',
    systemPrompt: `You are the Diagnoser agent in IncidentMind. Your role is to analyze anomaly context and determine the root cause.
    You receive the Watcher's output and the original metrics, then use your expertise to diagnose the issue.
    Output should be a structured JSON with:
    - rootCause: string describing the root cause
    - contributingFactors: array of strings
    - confidence: number (0-1)
    - likelyImpact: string describing potential impact
    - suggestedInvestigation: array of strings with next steps

    Only output valid JSON, no additional text.`
  },
  PATCHER: {
    name: 'Patcher',
    role: 'Fixer',
    systemPrompt: `You are the Patcher agent in IncidentMind. Your role is to generate recommended fixes based on the diagnosis.
    You receive the Diagnoser's output and produce actionable remediation steps.
    Output should be a structured JSON with:
    - recommendedFix: string describing the fix
    - fixType: string ('configChange', 'rollback', 'codePatch', 'scaleUp', 'restartService')
    - commands: array of strings with specific commands to execute
    - rollbackPlan: string describing how to rollback if needed
    - estimatedTime: string (e.g., '5 minutes')
    - riskLevel: string ('low', 'medium', 'high')

    Only output valid JSON, no additional text.`
  },
  COMMUNICATOR: {
    name: 'Communicator',
    role: 'Notifier',
    systemPrompt: `You are the Communicator agent in IncidentMind. Your role is to draft notifications and reports based on the patcher's recommendations.
    You receive the Patcher's output and create clear, actionable communications for the on-call team.
    Output should be a structured JSON with:
    - slackMessage: string formatted for Slack (can include markdown)
    - incidentReport: string with detailed incident report
    - runbookEntry: string suggesting runbook documentation
    - priority: string ('low', 'medium', 'high', 'critical')
    - notificationChannels: array of strings ('slack', 'email', 'pagerduty', etc.)

    Only output valid JSON, no additional text.`
  }
};

// Orchestrator function to run the agent chain
async function runAgentChain(incident) {
  console.log(`Starting incident analysis for: ${incident.title}`);

  // Step 1: Watcher - Detect anomaly
  const watcherPrompt = `
    Metrics data:
    ${JSON.stringify(incident.metrics, null, 2)}

    Incident description: ${incident.description}

    Determine if this represents an anomaly requiring attention.`;

  const watcherResult = await callOllamaAPI(AGENTS.WATCHER, watcherPrompt);
  console.log('Watcher result:', watcherResult);

  if (!watcherResult.anomalyDetected || watcherResult.confidence < 0.3) {
    return {
      incidentId: incident.id,
      status: 'no_action_needed',
      message: 'No significant anomaly detected',
      watcher: watcherResult
    };
  }

  // Step 2: Diagnoser - Find root cause
  const diagnoserPrompt = `
    Watcher analysis:
    ${JSON.stringify(watcherResult, null, 2)}

    Original metrics:
    ${JSON.stringify(incident.metrics, null, 2)}

    Incident description: ${incident.description}

    Analyze this to determine the root cause.`;

  const diagnoserResult = await callOllamaAPI(AGENTS.DIAGNOSER, diagnoserPrompt);
  console.log('Diagnoser result:', diagnoserResult);

  // Step 3: Patcher - Generate fix
  const patcherPrompt = `
    Diagnoser analysis:
    ${JSON.stringify(diagnoserResult, null, 2)}

    Watcher analysis:
    ${JSON.stringify(watcherResult, null, 2)}

    Original metrics:
    ${JSON.stringify(incident.metrics, null, 2)}

    Generate a recommended fix for this issue.`;

  const patcherResult = await callOllamaAPI(AGENTS.PATCHER, patcherPrompt);
  console.log('Patcher result:', patcherResult);

  // Step 4: Communicator - Draft notifications
  const communicatorPrompt = `
    Patcher recommendations:
    ${JSON.stringify(patcherResult, null, 2)}

    Diagnoser analysis:
    ${JSON.stringify(diagnoserResult, null, 2)}

    Watcher analysis:
    ${JSON.stringify(watcherResult, null, 2)}

    Original incident:
    ${JSON.stringify(incident, null, 2)}

    Draft appropriate notifications and reports.`;

  const communicatorResult = await callOllamaAPI(AGENTS.COMMUNICATOR, communicatorPrompt);

  return {
    incidentId: incident.id,
    status: 'analyzed',
    timestamp: new Date().toISOString(),
    watcher: watcherResult,
    diagnoser: diagnoserResult,
    patcher: patcherResult,
    communicator: communicatorResult
  };
}

function parseAgentJsonResponse(rawResponse, agentName) {
  const normalized = rawResponse
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/, '')
    .trim();

  try {
    return JSON.parse(normalized);
  } catch (error) {
    const firstBrace = normalized.indexOf('{');
    const lastBrace = normalized.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const extracted = normalized.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(extracted);
      } catch (nestedError) {
        // Fall through to the final error below
      }
    }

    throw new Error(
      `${agentName} returned non-JSON output. Raw response: ${normalized.slice(0, 300)}`
    );
  }
}

// Function to call Ollama API (local LLM)
async function callOllamaAPI(agent, prompt) {
  const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
  const ollamaModel = process.env.OLLAMA_MODEL || 'qwen3:latest';

  const fullPrompt = `${agent.systemPrompt}\n\n${prompt}`;

  const response = await fetch(`${ollamaHost}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: ollamaModel,
      prompt: fullPrompt,
      stream: false,
      format: 'json'
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Ollama request failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  if (!data || typeof data.response !== 'string') {
    throw new Error('Invalid Ollama response payload');
  }

  return parseAgentJsonResponse(data.response, agent.name);
}

// SSE endpoint for streaming agent thoughts
app.get('/api/incidents/:id/analyze', (req, res) => {
  const incidentId = req.params.id;
  const incident = mockIncidents.find(i => i.id === incidentId);

  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send initial comment to establish connection
  res.write(': Establishing connection\n\n');

  // Process the incident analysis and stream results
  (async () => {
    try {
      // Step 1: Watcher
      console.error(' About to write agent_start for Watcher');
      res.write(`data: ${JSON.stringify({ type: 'agent_start', agent: 'Watcher' })}\n\n`);

      const watcherPrompt = `
        Metrics data:
        ${JSON.stringify(incident.metrics, null, 2)}

        Incident description: ${incident.description}

        Determine if this represents an anomaly requiring attention.`;

      console.log(' About to call callOllamaAPI for Watcher');
      const watcherResult = await callOllamaAPI(AGENTS.WATCHER, watcherPrompt);

      if (!watcherResult.anomalyDetected || watcherResult.confidence < 0.3) {
        res.write(`data: ${JSON.stringify({ type: 'analysis_complete', result: {
          incidentId: incident.id,
          status: 'no_action_needed',
          message: 'No significant anomaly detected',
          watcher: watcherResult
        }})}\n\n`);
        res.end();
        return;
      }

      res.write(`data: ${JSON.stringify({ type: 'agent_complete', agent: 'Watcher', result: watcherResult })}\n\n`);

      // Step 2: Diagnoser
      res.write(`data: ${JSON.stringify({ type: 'agent_start', agent: 'Diagnoser' })}\n\n`);

      const diagnoserPrompt = `
        Watcher analysis:
        ${JSON.stringify(watcherResult, null, 2)}

        Original metrics:
        ${JSON.stringify(incident.metrics, null, 2)}

        Incident description: ${incident.description}

        Analyze this to determine the root cause.`;

      const diagnoserResult = await callOllamaAPI(AGENTS.DIAGNOSER, diagnoserPrompt);

      res.write(`data: ${JSON.stringify({ type: 'agent_complete', agent: 'Diagnoser', result: diagnoserResult })}\n\n`);

      // Step 3: Patcher
      res.write(`data: ${JSON.stringify({ type: 'agent_start', agent: 'Patcher' })}\n\n`);

      const patcherPrompt = `
        Diagnoser analysis:
        ${JSON.stringify(diagnoserResult, null, 2)}

        Watcher analysis:
        ${JSON.stringify(watcherResult, null, 2)}

        Original metrics:
        ${JSON.stringify(incident.metrics, null, 2)}

        Generate a recommended fix for this issue.`;

      const patcherResult = await callOllamaAPI(AGENTS.PATCHER, patcherPrompt);

      res.write(`data: ${JSON.stringify({ type: 'agent_complete', agent: 'Patcher', result: patcherResult })}\n\n`);

      // Step 4: Communicator
      res.write(`data: ${JSON.stringify({ type: 'agent_start', agent: 'Communicator' })}\n\n`);

      const communicatorPrompt = `
        Patcher recommendations:
        ${JSON.stringify(patcherResult, null, 2)}

        Diagnoser analysis:
        ${JSON.stringify(diagnoserResult, null, 2)}

        Watcher analysis:
        ${JSON.stringify(watcherResult, null, 2)}

        Original incident:
        ${JSON.stringify(incident, null, 2)}

        Draft appropriate notifications and reports.`;

      const communicatorResult = await callOllamaAPI(AGENTS.COMMUNICATOR, communicatorPrompt);

      res.write(`data: ${JSON.stringify({ type: 'agent_complete', agent: 'Communicator', result: communicatorResult })}\n\n`);

      // Final result
      const finalResult = {
        incidentId: incident.id,
        status: 'analyzed',
        timestamp: new Date().toISOString(),
        watcher: watcherResult,
        diagnoser: diagnoserResult,
        patcher: patcherResult,
        communicator: communicatorResult
      };

      res.write(`data: ${JSON.stringify({ type: 'analysis_complete', result: finalResult })}\n\n`);
      res.end();
    } catch (error) {
      console.error('Error during analysis:', error);
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
      res.end();
    }
  })();
});

// REST endpoint for getting incidents
app.get('/api/incidents', (req, res) => {
  res.json(mockIncidents);
});

// REST endpoint for getting a specific incident
app.get('/api/incidents/:id', (req, res) => {
  const incident = mockIncidents.find(i => i.id === req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json(incident);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`IncidentMind backend running on port ${PORT}`);
});

module.exports = app;