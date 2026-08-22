const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  incidentId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  severity: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
  status: { type: String, enum: ['OPEN', 'RESOLVED', 'IN_PROGRESS', 'AUTO_RESOLVED'], default: 'OPEN' },
  service: { type: String, required: true, index: true },
  triggeredAt: { type: Date, required: true, index: true },
  resolvedAt: { type: Date },
  mttrSeconds: { type: Number },
  attentionLevel: { type: String, enum: ['AUTO', 'WATCH', 'ESCALATE'] },
  attentionScore: { type: Number },
  attentionReason: { type: String },
  agents: {
    orchestrator: mongoose.Schema.Types.Mixed,
    watcher: mongoose.Schema.Types.Mixed,
    diagnoser: mongoose.Schema.Types.Mixed,
    patcher: mongoose.Schema.Types.Mixed,
    communicator: mongoose.Schema.Types.Mixed
  },
  slackNotification: mongoose.Schema.Types.Mixed,
  githubPR: mongoose.Schema.Types.Mixed,
  retryCount: { type: Number, default: 0 }
}, { timestamps: true });

const agentExecutionSchema = new mongoose.Schema({
  incidentId: { type: String, required: true, index: true },
  agentName: { type: String, required: true, enum: ['orchestrator', 'watcher', 'diagnoser', 'patcher', 'communicator'] },
  status: { type: String, enum: ['running', 'done', 'failed'], default: 'running' },
  output: mongoose.Schema.Types.Mixed,
  retrievedContext: mongoose.Schema.Types.Mixed,
  durationMs: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Incident = mongoose.model('Incident', incidentSchema);
const AgentExecution = mongoose.model('AgentExecution', agentExecutionSchema);

let isConnected = false;
let mongoAvailable = false;

async function connectDB() {
  if (isConnected) return;
  
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/incidentmind';
  try {
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,  // 10s for Atlas
      socketTimeoutMS: 45000,
      family: 4,  // Force IPv4
      retryWrites: true,
      w: 'majority'
    });
    isConnected = true;
    mongoAvailable = true;
    console.log('MongoDB Atlas connected');
  } catch (error) {
    console.warn('MongoDB Atlas unavailable, running without persistence:', error.message);
    mongoAvailable = false;
    // Don't throw - allow app to run without MongoDB
  }
}

/**
 * Save incident to database
 */
async function saveIncident(incident, result) {
  await connectDB();
  
  if (!mongoAvailable) {
    console.log('MongoDB unavailable, skipping incident save');
    return { success: false, error: 'MongoDB not available', skipped: true };
  }
  
  const startedAt = incident.triggered_at ? new Date(incident.triggered_at) : new Date();
  const resolvedAt = result.status === 'completed' ? new Date() : null;
  const mttrSeconds = resolvedAt 
    ? Math.floor((resolvedAt - startedAt) / 1000)
    : null;

  try {
    const doc = await Incident.findOneAndUpdate(
      { incidentId: incident.id },
      {
        incidentId: incident.id,
        title: incident.title,
        severity: incident.severity || 'unknown',
        status: result.status === 'completed' ? 'RESOLVED' : 'OPEN',
        service: incident.component || 'unknown',
        triggeredAt: startedAt,
        resolvedAt: resolvedAt,
        mttrSeconds: mttrSeconds,
        attentionLevel: incident.attentionLevel,
        attentionScore: incident.attentionScore,
        attentionReason: incident.attentionReason,
        agents: {
          orchestrator: result.orchestrator,
          watcher: result.watcher,
          diagnoser: result.diagnoser,
          patcher: result.patcher,
          communicator: result.communicator
        },
        slackNotification: result.slackNotification,
        githubPR: result.githubPR,
        retryCount: result.retryCount || 0
      },
      { upsert: true, new: true, runValidators: true }
    );
    return { success: true, data: doc };
  } catch (error) {
    console.error('Error saving incident:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save agent execution record
 */
async function saveAgentExecution(incidentId, agentName, status, output, retrievedContext, durationMs) {
  await connectDB();
  
  if (!mongoAvailable) {
    return { success: false, error: 'MongoDB not available', skipped: true };
  }
  
  try {
    const doc = await AgentExecution.create({
      incident_id: incidentId,
      agent_name: agentName,
      status,
      output,
      retrieved_context: retrievedContext,
      duration_ms: durationMs
    });
    return { success: true, data: doc };
  } catch (error) {
    console.error('Error saving agent execution:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save full incident with all agent executions
 */
async function saveFullIncident(incident, result) {
  await connectDB();
  
  if (!mongoAvailable) {
    console.log('MongoDB unavailable, skipping persistence');
    return { success: false, error: 'MongoDB not available', skipped: true };
  }
  
  // Save incident
  const incidentResult = await saveIncident(incident, result);
  if (!incidentResult.success) return incidentResult;

  // Save all agent executions
  const agents = ['orchestrator', 'watcher', 'diagnoser', 'patcher', 'communicator'];
  const executions = [];

  for (const agent of agents) {
    if (result[agent]) {
      const agentResult = result[agent];
      executions.push(
        saveAgentExecution(
          incident.id,
          agent,
          'done',
          agentResult,
          agentResult.retrievedContext || null,
          0
        )
      );
    }
  }

  await Promise.all(executions);

  return { success: true, incidentId: incident.id };
}

/**
 * Get incident history with pagination and filters
 */
async function getIncidentHistory({ page = 1, limit = 20, severity, status, search } = {}) {
  await connectDB();
  
  if (!mongoAvailable) {
    console.log('MongoDB unavailable, returning empty history');
    return { success: true, data: [], total: 0, offline: true };
  }
  
  const query = {};
  if (severity && severity.length > 0) query.severity = { $in: severity };
  if (status && status.length > 0) query.status = { $in: status };
  if (search) query.title = { $regex: search, $options: 'i' };

  try {
    const [data, total] = await Promise.all([
      Incident.find(query)
        .sort({ triggeredAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Incident.countDocuments(query)
    ]);

    return { success: true, data, total };
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return { success: false, error: error.message, data: [], total: 0 };
  }
}

/**
 * Get incident detail with agent executions
 */
async function getIncidentDetail(incidentId) {
  await connectDB();
  
  if (!mongoAvailable) {
    return { success: false, error: 'MongoDB not available', offline: true };
  }
  
  try {
    const incident = await Incident.findOne({ incidentId }).lean();
    if (!incident) {
      return { success: false, error: 'Incident not found' };
    }

    const executions = await AgentExecution.find({ incident_id: incidentId })
      .sort({ createdAt: 1 })
      .lean();

    return { success: true, incident, executions };
  } catch (error) {
    console.error('Error fetching incident detail:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get dashboard stats
 */
async function getDashboardStats(range = '7d') {
  await connectDB();
  
  if (!mongoAvailable) {
    return { 
      success: true, 
      stats: {
        totalIncidents: 0,
        resolvedIncidents: 0,
        resolutionRate: 0,
        avgMttrSeconds: 0,
        mostAffectedService: 'N/A',
        severityBreakdown: {}
      },
      offline: true
    };
  }
  
  try {
    // Parse time range
    const now = new Date();
    let startDate = new Date(now);
    if (range === '24h') startDate.setHours(now.getHours() - 24);
    else if (range === '7d') startDate.setDate(now.getDate() - 7);
    else if (range === '30d') startDate.setDate(now.getDate() - 30);
    else if (range === '90d') startDate.setDate(now.getDate() - 90);
    
    const query = { triggeredAt: { $gte: startDate } };
    const incidents = await Incident.find(query, 'severity status mttr_seconds service triggeredAt').lean();

    const total = incidents.length;
    const resolved = incidents.filter(i => i.status === 'RESOLVED').length;
    const mttrValues = incidents.filter(i => i.mttr_seconds).map(i => i.mttr_seconds);
    const avgMttr = mttrValues.length > 0 
      ? mttrValues.reduce((sum, v) => sum + v, 0) / mttrValues.length 
      : 0;
    
    const serviceCounts = incidents.reduce((acc, i) => {
      acc[i.service] = (acc[i.service] || 0) + 1;
      return acc;
    }, {});

    const mostAffectedService = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      success: true,
      stats: {
        totalIncidents: total,
        resolvedIncidents: resolved,
        resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
        avgMttrSeconds: Math.round(avgMttr),
        mostAffectedService,
        severityBreakdown: incidents.reduce((acc, i) => {
          acc[i.severity] = (acc[i.severity] || 0) + 1;
          return acc;
        }, {})
      }
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { success: false, error: error.message };
  }
}

function isConfigured() {
  return !!process.env.MONGODB_URI;
}

module.exports = {
  connectDB,
  saveIncident,
  saveAgentExecution,
  saveFullIncident,
  getIncidentHistory,
  getIncidentDetail,
  getDashboardStats,
  isConfigured,
  Incident,
  AgentExecution
};