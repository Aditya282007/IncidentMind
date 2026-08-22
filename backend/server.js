const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { body, param, validationResult } = require('express-validator');
require('dotenv').config();

const { initializeKnowledgeBase, getDiagnoserContext, getPatcherContext, getCommunicatorContext, buildDiagnoserRagContext, buildPatcherRagContext, buildCommunicatorRagContext } = require('./services/ragService');
const { runAgentChain } = require('./services/agentService');
const { parseAgentJsonResponse } = require('./utils/agentParser');
const { computeAttentionScore, scoreToLevel, buildReason } = require('./services/attentionRouter');
const { getAttentionPolicy, saveAttentionPolicy, generateDefaultsFromHistory } = require('./services/attentionPolicyService');
const { getNotificationPlan } = require('./services/notificationRouter');
const { connectDB, mongoAvailable } = require('./services/mongoService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Validation middleware
const validateId = [
  param('id').notEmpty().withMessage('Incident ID is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Initialize knowledge base on startup
initializeKnowledgeBase().catch(console.error);

console.log('Environment variables loaded:');
console.log('OLLAMA_HOST:', process.env.OLLAMA_HOST);
console.log('OLLAMA_MODEL:', process.env.OLLAMA_MODEL);
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Mock incident data
const mockIncidents = [
  {
    id: 'incident-001',
    title: 'CPU spike detected on api-server-2',
    description: 'CPU usage exceeded 95% for 5 minutes on api-server-2',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    metrics: {
      cpuUsage: 97,
      memoryUsage: 78,
      requestLatency: 250,
      errorRate: 0.02
    },
    component: 'api-server-2',
    severity: 'high'
  },
  {
    id: 'incident-002',
    title: 'Database connection pool exhaustion',
    description: 'Database connection pool exhausted causing query timeouts',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    metrics: {
      cpuUsage: 45,
      memoryUsage: 82,
      requestLatency: 1200,
      errorRate: 0.15
    },
    component: 'db-cluster-primary',
    severity: 'high'
  },
  {
    id: 'incident-003',
    title: 'Memory Leak in auth-service-v2',
    description: 'Heap usage climbing 2.4GB/min. Redis connection pool leaking during failed retry cycles.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    metrics: {
      cpuUsage: 72,
      memoryUsage: 94,
      requestLatency: 433,
      errorRate: 0.058
    },
    component: 'auth-service-v2',
    severity: 'critical'
  }
];

// SSE endpoint for streaming agent thoughts
app.get('/api/incidents/:id/analyze', validateId, async (req, res) => {
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
  try {
    // Step 1: Orchestrator
    res.write(`data: ${JSON.stringify({ type: 'agent_start', agent: 'Orchestrator' })}\n\n`);
    
    const orchestratorResult = await runOrchestrator(incident);
    
    res.write(`data: ${JSON.stringify({ type: 'agent_complete', agent: 'Orchestrator', result: orchestratorResult })}\n\n`);

    // Step 2: Watcher (pure JS)
    res.write(`data: ${JSON.stringify({ type: 'agent_start', agent: 'Watcher' })}\n\n`);
    
    const watcherResult = runWatcher(incident.metrics, incident.component);
    
    if (!watcherResult.anomalyDetected || watcherResult.confidence < 0.3) {
      res.write(`data: ${JSON.stringify({ type: 'analysis_complete', result: {
        incidentId: incident.id,
        status: 'no_action_needed',
        message: 'No significant anomaly detected',
        orchestrator: orchestratorResult,
        watcher: watcherResult
      }})}\n\n`);
      res.end();
      return;
    }
    
    res.write(`data: ${JSON.stringify({ type: 'agent_complete', agent: 'Watcher', result: watcherResult })}\n\n`);

    // Step 3: Diagnoser
    res.write(`data: ${JSON.stringify({ type: 'agent_start', agent: 'Diagnoser' })}\n\n`);
    
    const { pastIncidents, runbooks: diagnoserRunbooks } = await getDiagnoserContext(
      incident.component || 'unknown',
      watcherResult.description || 'anomaly'
    );
    const diagnoserRagContext = buildDiagnoserRagContext(pastIncidents, diagnoserRunbooks);

    const diagnoserPrompt = `
      Watcher's analysis:
      ${JSON.stringify(watcherResult, null, 2)}

      Original metrics:
      ${JSON.stringify(incident.metrics, null, 2)}

      Incident description: ${incident.description}

      ${diagnoserRagContext}

      Analyze the anomaly context and determine the root cause.
    `;

    const { callLLM } = require('./services/ollamaService');
    const { AGENTS } = require('./config/agents');
    const diagnoserResult = await callLLM('DIAGNOSER', diagnoserPrompt);
    diagnoserResult.retrievedContext = { pastIncidents, runbooks: diagnoserRunbooks };
    
    res.write(`data: ${JSON.stringify({ type: 'agent_complete', agent: 'Diagnoser', result: diagnoserResult })}\n\n`);

    // Attention Router step (NEW - runs after Diagnoser, before Patcher)
    res.write(`data: ${JSON.stringify({ type: 'agent_start', agent: 'AttentionRouter' })}\n\n`);
    
    const db = (await connectDB(), require('mongoose').connection.db);
    const attentionScore = await computeAttentionScore(
      { ...incident, severity: incident.severity.toUpperCase(), service: incident.component },
      diagnoserResult,
      db
    );
    const attentionLevel = scoreToLevel(attentionScore);
    const attentionReason = buildReason(attentionScore, { ...incident, severity: incident.severity.toUpperCase(), service: incident.component }, {
      severityWeight: { LOW: -25, MEDIUM: 0, HIGH: +20, CRITICAL: +40 }[incident.severity.toUpperCase()] || 0
    });

    incident.attentionLevel = attentionLevel;
    incident.attentionScore = attentionScore;
    incident.attentionReason = attentionReason;

    res.write(`data: ${JSON.stringify({
      type: 'agent_complete',
      agent: 'AttentionRouter',
      result: {
        attentionLevel,
        attentionScore,
        attentionReason
      }
    })}\n\n`);

    // Save attention decision to MongoDB
    if (mongoAvailable) {
      await db.collection('incidents').updateOne(
        { incidentId: incident.id },
        { $set: { attentionLevel, attentionScore, attentionReason } },
        { upsert: true }
      ).catch(err => console.error('Failed to save attention decision:', err.message));
    }

    // Stream attention decision to frontend via SSE
    res.write(`data: ${JSON.stringify({
      type: 'attention_routed',
      attentionLevel,
      attentionScore,
      reason: attentionReason
    })}\n\n`);

    // Step 4: Patcher
    res.write(`data: ${JSON.stringify({ type: 'agent_start', agent: 'Patcher' })}\n\n`);
    
    const { runbooks: patcherRunbooks, patchCommands } = await getPatcherContext(
      diagnoserResult.rootCause || 'unknown issue',
      incident.component || 'service'
    );
    const patcherRagContext = buildPatcherRagContext(patcherRunbooks, patchCommands);

    const patcherPrompt = `
      Diagnoser's analysis:
      ${JSON.stringify(diagnoserResult, null, 2)}

      ${patcherRagContext}

      Based on the confirmed diagnosis, generate a recommended fix.
    `;
    
    const patcherResult = await callLLM('PATCHER', patcherPrompt);
    patcherResult.retrievedContext = { runbooks: patcherRunbooks, patchCommands };
    
    res.write(`data: ${JSON.stringify({ type: 'agent_complete', agent: 'Patcher', result: patcherResult })}\n\n`);

    // Step 5: Communicator
    res.write(`data: ${JSON.stringify({ type: 'agent_start', agent: 'Communicator' })}\n\n`);
    
    const communicatorResult = await runCommunicator(incident, watcherResult, diagnoserResult, patcherResult);
    
    res.write(`data: ${JSON.stringify({ type: 'agent_complete', agent: 'Communicator', result: communicatorResult })}\n\n`);

    // Notification Routing (NEW - uses attentionLevel to decide what to send)
    const dbForNotifications = (await connectDB(), require('mongoose').connection.db);
    const policyForNotifications = await getAttentionPolicy(dbForNotifications);
    const { matrix: notificationPlan, inQuietHours } = getNotificationPlan(incident.attentionLevel, policyForNotifications);

    // Stream notification routing decision to frontend
    const channelsSent = Object.entries(notificationPlan).filter(([, v]) => v.send).map(([k]) => k);
    const channelsSuppressed = Object.entries(notificationPlan).filter(([, v]) => !v.send).map(([k]) => k);
    
    res.write(`data: ${JSON.stringify({
      type: 'notification_routed',
      attentionLevel: incident.attentionLevel,
      channelsSent,
      channelsSuppressed,
      suppressedReason: inQuietHours ? 'quiet_hours' : null
    })}\n\n`);

    // Auto-retry loop
    let finalDiagnoserResult = diagnoserResult;
    let finalPatcherResult = patcherResult;
    let retryCount = 0;
    const maxRetries = 2;
    
    while ((!finalPatcherResult.confidence || finalPatcherResult.confidence < 0.70) && retryCount < maxRetries) {
      console.log(`Patch confidence ${finalPatcherResult.confidence || 'unknown'} below threshold, retrying diagnosis (attempt ${retryCount + 1}/${maxRetries})`);
      retryCount++;
      
      const { pastIncidents: retryIncidents, runbooks: retryRunbooks } = await getDiagnoserContext(
        incident.component || 'unknown',
        watcherResult.description || 'anomaly'
      );
      const retryRagContext = buildDiagnoserRagContext(retryIncidents, retryRunbooks);
      
      const retryPrompt = `
        Previous diagnosis had low patch confidence. Re-analyze with broader context.
        
        Watcher's analysis:
        ${JSON.stringify(watcherResult, null, 2)}

        Original metrics:
        ${JSON.stringify(incident.metrics, null, 2)}

        Incident description: ${incident.description}

        ${retryRagContext}

        Previous root cause: ${finalDiagnoserResult.rootCause}
        Previous patch confidence: ${finalPatcherResult.confidence || 'unknown'}

        Provide a more specific, actionable root cause for better patch generation.
      `;
      
      const { callLLM } = require('./services/ollamaService'); // We'll use the ollama service for retry
      const { AGENTS } = require('./config/agents');
      const retryDiagnoserResult = await callLLM('DIAGNOSER', retryPrompt);
      retryDiagnoserResult.retrievedContext = { pastIncidents: retryIncidents, runbooks: retryRunbooks };
      finalDiagnoserResult = retryDiagnoserResult;
      
      const { runbooks: retryPatcherRunbooks, patchCommands: retryPatchCommands } = await getPatcherContext(
        retryDiagnoserResult.rootCause || 'unknown issue',
        incident.component || 'service'
      );
      const retryPatcherRagContext = buildPatcherRagContext(retryPatcherRunbooks, retryPatchCommands);
      
      const retryPatcherPrompt = `
        Improved diagnosis:
        ${JSON.stringify(retryDiagnoserResult, null, 2)}

        ${retryPatcherRagContext}

        Generate a high-confidence fix for this issue.
      `;
      
      const retryPatcherResult = await callLLM('PATCHER', retryPatcherPrompt);
      retryPatcherResult.retrievedContext = { runbooks: retryPatcherRunbooks, patchCommands: retryPatchCommands };
      finalPatcherResult = retryPatcherResult;
    }
    
    if (retryCount > 0) {
      console.log(`Auto-retry completed after ${retryCount} iteration(s), final patch confidence: ${finalPatcherResult.confidence || 'unknown'}`);
    }

    // External integrations - respect notification plan
    const { sendSlackNotification, createGitHubPR } = require('./services/agentService');
    let slackResult = { success: false, reason: 'suppressed' };
    let githubResult = { success: false, reason: 'suppressed' };

    if (notificationPlan.slack.send) {
      slackResult = await sendSlackNotification(incident, watcherResult, finalDiagnoserResult, finalPatcherResult, communicatorResult);
    }
    if (notificationPlan.github.createPR) {
      githubResult = await createGitHubPR(incident, finalPatcherResult, finalDiagnoserResult);
    }

    // Persist to MongoDB
    const { saveFullIncident } = require('./services/mongoService');
    const incidentWithTrigger = { ...incident, triggered_at: incident.timestamp };
    const fullResult = {
      orchestrator: orchestratorResult,
      watcher: watcherResult,
      diagnoser: finalDiagnoserResult,
      patcher: finalPatcherResult,
      communicator: communicatorResult,
      slackNotification: slackResult,
      githubPR: githubResult,
      notificationPlan,
      retryCount,
      status: 'completed'
    };
    
    await saveFullIncident(incidentWithTrigger, fullResult).catch(err => 
      console.error('MongoDB persistence failed:', err.message)
    );

    // Final result
    const finalResult = {
      incidentId: incident.id,
      status: 'analyzed',
      timestamp: new Date().toISOString(),
      orchestrator: orchestratorResult,
      watcher: watcherResult,
      diagnoser: finalDiagnoserResult,
      patcher: finalPatcherResult,
      communicator: communicatorResult,
      slackNotification: slackResult,
      githubPR: githubResult,
      retryCount
    };

    res.write(`data: ${JSON.stringify({ type: 'analysis_complete', result: finalResult })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Error during analysis:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
});

// Helper functions (extracted from agentService for SSE streaming)
async function runOrchestrator(incident) {
  const { callLLM } = require('./services/ollamaService');
  const { AGENTS } = require('./config/agents');
  
  const orchestratorPrompt = `
    Incident triggered: ${incident.title}
    Description: ${incident.description}
    Metrics: ${JSON.stringify(incident.metrics, null, 2)}

    Determine the appropriate agent sequence and any initial context for handling this incident.
  `;

  return await callLLM('ORCHESTRATOR', orchestratorPrompt);
}

function runWatcher(metrics, component) {
  const cpuUsage = metrics.cpuUsage ?? metrics.cpu ?? 0;
  const memoryUsage = metrics.memoryUsage ?? metrics.memory ?? 0;
  const errorRate = metrics.errorRate ?? 0;
  const requestLatency = metrics.requestLatency ?? metrics.latency ?? 0;

  const anomalyDetected = cpuUsage > 90 || memoryUsage > 85 || errorRate > 0.1 || requestLatency > 500;
  const confidence = anomalyDetected ? 0.95 : 0.1;
  const description = anomalyDetected
    ? `High CPU usage: ${cpuUsage}%` + (memoryUsage > 85 ? `, Memory: ${memoryUsage}%` : '') + (errorRate > 0.1 ? `, Error rate: ${(errorRate * 100).toFixed(1)}%` : '')
    : 'Normal metrics';
  const severity = anomalyDetected ? 'high' : 'low';
  const affectedComponents = anomalyDetected ? [component || 'api-server'] : [];

  return {
    anomalyDetected,
    confidence,
    description,
    severity,
    affectedComponents
  };
}

async function runDiagnoserAndPatcherParallel(incident, watcherResult, instructions) {
  const { 
    getDiagnoserContext, 
    getPatcherContext,
    buildDiagnoserRagContext,
    buildPatcherRagContext 
  } = require('./services/ragService');
  const { callLLM } = require('./services/ollamaService');
  const { AGENTS } = require('./config/agents');

  // Prepare Diagnoser prompt
  const { pastIncidents, runbooks: diagnoserRunbooks } = await getDiagnoserContext(
    incident.component || 'unknown',
    watcherResult.description || 'anomaly'
  );
  const diagnoserRagContext = buildDiagnoserRagContext(pastIncidents, diagnoserRunbooks);

  const diagnoserPrompt = `
    Watcher's analysis:
    ${JSON.stringify(watcherResult, null, 2)}

    Original metrics:
    ${JSON.stringify(incident.metrics, null, 2)}

    Incident description: ${incident.description}

    ${diagnoserRagContext}

    Analyze the anomaly context and determine the root cause.
  `;

  // Prepare Patcher prompt (preliminary)
  const { runbooks: patcherRunbooks, patchCommands } = await getPatcherContext(
    'pending_diagnosis',
    incident.component || 'service'
  );
  const patcherRagContext = buildPatcherRagContext(patcherRunbooks, patchCommands);

  const preliminaryPatcherPrompt = `
    Watcher's analysis:
    ${JSON.stringify(watcherResult, null, 2)}

    Original metrics:
    ${JSON.stringify(incident.metrics, null, 2)}

    Incident description: ${incident.description}

    ${patcherRagContext}

    Generate a preliminary recommended fix based on the anomaly signals. 
    The final diagnosis will be available shortly to refine this fix.
  `;

  // Run both agents in PARALLEL
  console.log('Running Diagnoser and Patcher in parallel...');
  const [diagnoserResult, preliminaryPatcherResult] = await Promise.all([
    callLLM('DIAGNOSER', diagnoserPrompt),
    callLLM('PATCHER', preliminaryPatcherPrompt)
  ]);
  
  diagnoserResult.retrievedContext = { pastIncidents, runbooks: diagnoserRunbooks };
  preliminaryPatcherResult.retrievedContext = { runbooks: patcherRunbooks, patchCommands };

  // Refine Patcher result with actual diagnosis
  const refinedPatcherPrompt = `
    Diagnoser's analysis:
    ${JSON.stringify(diagnoserResult, null, 2)}

    Preliminary fix draft:
    ${JSON.stringify(preliminaryPatcherResult, null, 2)}

    ${patcherRagContext}

    Based on the confirmed diagnosis, refine and finalize the recommended fix.
  `;
  
  const patcherResult = await callLLM('PATCHER', refinedPatcherPrompt);
  patcherResult.retrievedContext = { runbooks: patcherRunbooks, patchCommands };

  return { diagnoserResult, patcherResult };
}

async function runCommunicator(incident, watcherResult, diagnoserResult, patcherResult) {
  const { getCommunicatorContext, buildCommunicatorRagContext } = require('./services/ragService');
  const { callLLM } = require('./services/ollamaService');
  const { AGENTS } = require('./config/agents');

  const { runbooks: communicatorRunbooks } = await getCommunicatorContext(
    `${incident.title} - ${diagnoserResult.rootCause}`,
    watcherResult.severity || 'high'
  );
  const communicatorRagContext = buildCommunicatorRagContext(communicatorRunbooks);

  const communicatorPrompt = `
    Diagnosis: ${JSON.stringify(diagnoserResult, null, 2)}
    Patch: ${JSON.stringify(patcherResult, null, 2)}

    ${communicatorRagContext}

    Draft a clear, concise message for the team summarizing the incident, diagnosis, and recommended actions.
  `;

  const communicatorResult = await callLLM('COMMUNICATOR', communicatorPrompt);
  communicatorResult.retrievedContext = { runbooks: communicatorRunbooks };

  return communicatorResult;
}

// History endpoints (MongoDB-backed)
app.get('/api/history', async (req, res) => {
  const { getIncidentHistory } = require('./services/mongoService');
  const { page = 1, limit = 20, severity, status, search } = req.query;
  
  // Handle multiple severity/status values (sent as repeated query params)
  const severities = Array.isArray(severity) ? severity : (severity ? [severity] : undefined);
  const statuses = Array.isArray(status) ? status : (status ? [status] : undefined);
  
  const result = await getIncidentHistory({ 
    page: parseInt(page), 
    limit: parseInt(limit), 
    severity: severities,
    status: statuses,
    search 
  });
  if (!result.success) {
    return res.status(500).json({ error: result.error, data: [], total: 0 });
  }
  res.json({ incidents: result.data, total: result.total, page: parseInt(page), limit: parseInt(limit) });
});

app.get('/api/history/stats', async (req, res) => {
  console.log('=== /api/history/stats called ===');
  const { getDashboardStats } = require('./services/mongoService');
  console.log('Module loaded, calling getDashboardStats...');
  const range = req.query.range || '7d';
  const result = await getDashboardStats(range);
  console.log('Result:', result);
  if (!result.success) {
    console.log('Result not success:', result.error);
    return res.status(500).json({ error: result.error });
  }
  console.log('Returning stats:', result.stats);
  res.json(result.stats);
});

app.get('/api/history/:id', async (req, res) => {
  const { getIncidentDetail } = require('./services/mongoService');
  const result = await getIncidentDetail(req.params.id);
  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }
  res.json(result);
});

// REST endpoint for getting incidents
app.get('/api/incidents', (req, res) => {
  res.json(mockIncidents);
});

app.get('/api/incidents/:id', validateId, (req, res) => {
  const incident = mockIncidents.find(i => i.id === req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json(incident);
});

// Attention Policy endpoints
app.get('/api/attention-policy', async (req, res) => {
  try {
    const db = (await connectDB(), require('mongoose').connection.db);
    const policy = await getAttentionPolicy(db);
    res.json({ success: true, policy });
  } catch (error) {
    console.error('Error fetching attention policy:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/attention-policy', async (req, res) => {
  try {
    const db = (await connectDB(), require('mongoose').connection.db);
    const updates = req.body;
    const result = await saveAttentionPolicy(db, updates);
    if (result.success) {
      res.json({ success: true, policy: result.policy });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error saving attention policy:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/attention-policy/defaults', async (req, res) => {
  try {
    const db = (await connectDB(), require('mongoose').connection.db);
    const result = await generateDefaultsFromHistory(db);
    res.json(result);
  } catch (error) {
    console.error('Error generating defaults from history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analytics attention endpoint
app.get('/api/analytics/attention', async (req, res) => {
  try {
    const db = (await connectDB(), require('mongoose').connection.db);
    
    if (!mongoAvailable) {
      return res.json({
        success: true,
        data: {
          attentionBreakdown: { AUTO: 0, WATCH: 0, ESCALATE: 0 },
          notificationsSuppressed: 0,
          timeSavedHours: 0,
          mostNoisyService: { service: 'N/A', count: 0, avgMttr: 0 },
          attentionScoreTrend: []
        },
        offline: true
      });
    }

    const [attentionBreakdown, notificationsSuppressed, mostNoisyService, attentionScoreTrend] = await Promise.all([
      db.collection('incidents').aggregate([
        { $group: { _id: '$attentionLevel', count: { $sum: 1 } } }
      ]).toArray(),
      db.collection('incidents').aggregate([
        { $match: {
          triggeredAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          attentionLevel: { $in: ['AUTO', 'WATCH'] }
        }},
        { $count: 'suppressed' }
      ]).toArray(),
      db.collection('incidents').aggregate([
        { $match: { attentionLevel: 'AUTO' } },
        { $group: { _id: '$service', count: { $sum: 1 }, avgMttr: { $avg: '$mttrSeconds' } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]).toArray(),
      db.collection('incidents').aggregate([
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$triggeredAt' } },
          avgScore: { $avg: '$attentionScore' }
        }},
        { $sort: { _id: 1 } }
      ]).toArray()
    ]);

    const breakdown = { AUTO: 0, WATCH: 0, ESCALATE: 0 };
    attentionBreakdown.forEach(item => {
      if (item._id) breakdown[item._id] = item.count;
    });

    const suppressedCount = notificationsSuppressed[0]?.suppressed || 0;
    const autoCount = breakdown.AUTO || 0;
    const timeSavedHours = (autoCount * 25) / 60;

    const noisy = mostNoisyService[0] || { _id: 'N/A', count: 0, avgMttr: 0 };

    res.json({
      success: true,
      data: {
        attentionBreakdown: breakdown,
        notificationsSuppressed: suppressedCount,
        timeSavedHours: Math.round(timeSavedHours * 10) / 10,
        mostNoisyService: {
          service: noisy._id,
          count: noisy.count,
          avgMttr: Math.round(noisy.avgMttr || 0)
        },
        attentionScoreTrend: attentionScoreTrend.map(item => ({
          date: item._id,
          avgScore: Math.round(item.avgScore || 0)
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching attention analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = {
  app,
  parseAgentJsonResponse
};