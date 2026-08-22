const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client initialized');
} else {
  console.warn('Supabase not configured (missing SUPABASE_URL or SUPABASE_KEY)');
}

/**
 * Save incident to database
 */
async function saveIncident(incident, result) {
  if (!supabase) return { success: false, reason: 'Supabase not configured' };

  const startedAt = new Date().toISOString();
  const resolvedAt = result.status === 'completed' ? new Date().toISOString() : null;
  const mttrSeconds = resolvedAt 
    ? Math.floor((new Date(resolvedAt) - new Date(incident.triggered_at || incident.timestamp || Date.now())) / 1000)
    : null;

  const { data, error } = await supabase
    .from('incidents')
    .upsert({
      id: incident.id,
      title: incident.title,
      severity: incident.severity || 'unknown',
      status: result.status === 'completed' ? 'RESOLVED' : 'OPEN',
      service: incident.component || 'unknown',
      triggered_at: incident.triggered_at || incident.timestamp || new Date().toISOString(),
      resolved_at: resolvedAt,
      mttr_seconds: mttrSeconds
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error saving incident:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

/**
 * Save agent execution record
 */
async function saveAgentExecution(incidentId, agentName, status, output, retrievedContext, durationMs) {
  if (!supabase) return { success: false, reason: 'Supabase not configured' };

  const { data, error } = await supabase
    .from('agent_executions')
    .insert({
      incident_id: incidentId,
      agent_name: agentName,
      status,
      output,
      retrieved_context: retrievedContext,
      duration_ms: durationMs
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving agent execution:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

/**
 * Save full incident with all agent executions
 */
async function saveFullIncident(incident, result) {
  if (!supabase) return { success: false, reason: 'Supabase not configured' };

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
          0 // duration not tracked here
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
  if (!supabase) return { success: false, reason: 'Supabase not configured', data: [] };

  let query = supabase
    .from('incidents')
    .select('*', { count: 'exact' })
    .order('triggered_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (severity) query = query.eq('severity', severity);
  if (status) query = query.eq('status', status);
  if (search) query = query.ilike('title', `%${search}%`);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching incidents:', error);
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data: data || [], total: count || 0 };
}

/**
 * Get incident detail with agent executions
 */
async function getIncidentDetail(incidentId) {
  if (!supabase) return { success: false, reason: 'Supabase not configured' };

  const { data: incident, error: incidentError } = await supabase
    .from('incidents')
    .select('*')
    .eq('id', incidentId)
    .single();

  if (incidentError) {
    console.error('Error fetching incident:', incidentError);
    return { success: false, error: incidentError.message };
  }

  const { data: executions, error: execError } = await supabase
    .from('agent_executions')
    .select('*')
    .eq('incident_id', incidentId)
    .order('created_at', { ascending: true });

  if (execError) {
    console.error('Error fetching executions:', execError);
    return { success: false, error: execError.message };
  }

  return { success: true, incident, executions: executions || [] };
}

/**
 * Get dashboard stats
 */
async function getDashboardStats() {
  if (!supabase) return { success: false, reason: 'Supabase not configured' };

  const { data: incidents, error } = await supabase
    .from('incidents')
    .select('severity, status, mttr_seconds, service, triggered_at');

  if (error) {
    console.error('Error fetching stats:', error);
    return { success: false, error: error.message };
  }

  const total = incidents?.length || 0;
  const resolved = incidents?.filter(i => i.status === 'RESOLVED').length || 0;
  const avgMttr = incidents?.filter(i => i.mttr_seconds).reduce((sum, i) => sum + i.mttr_seconds, 0) / (incidents?.filter(i => i.mttr_seconds).length || 1);
  
  const serviceCounts = incidents?.reduce((acc, i) => {
    acc[i.service] = (acc[i.service] || 0) + 1;
    return acc;
  }, {}) || {};

  const mostAffectedService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  return {
    success: true,
    stats: {
      totalIncidents: total,
      resolvedIncidents: resolved,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      avgMttrSeconds: Math.round(avgMttr || 0),
      mostAffectedService,
      severityBreakdown: incidents?.reduce((acc, i) => {
        acc[i.severity] = (acc[i.severity] || 0) + 1;
        return acc;
      }, {}) || {}
    }
  };
}

module.exports = {
  saveIncident,
  saveAgentExecution,
  saveFullIncident,
  getIncidentHistory,
  getIncidentDetail,
  getDashboardStats,
  isConfigured: () => !!supabase
};