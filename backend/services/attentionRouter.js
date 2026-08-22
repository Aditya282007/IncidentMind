const { getAttentionPolicy } = require('./attentionPolicyService');

async function computeAttentionScore(incident, diagnosis, db) {
  let score = 50;

  const severityScores = { LOW: -25, MEDIUM: 0, HIGH: +20, CRITICAL: +40 };
  score += severityScores[incident.severity] ?? 0;

  const policy = await getAttentionPolicy(db);

  const recentSimilar = await db.collection('incidents').countDocuments({
    service: incident.service,
    severity: incident.severity,
    triggeredAt: { $gte: new Date(Date.now() - policy.recurrenceWindowDays * 24 * 60 * 60 * 1000) }
  });
  if (recentSimilar > policy.recurrenceThreshold) score -= 20;
  if (recentSimilar === 0) score += 15;

  const totalForService = await db.collection('incidents')
    .countDocuments({ service: incident.service });
  const autoResolvedForService = await db.collection('incidents')
    .countDocuments({ service: incident.service, status: 'AUTO_RESOLVED' });
  const autoResolveRate = totalForService > 0
    ? autoResolvedForService / totalForService : 0;
  if (autoResolveRate > 0.7) score -= 15;

  const hour = new Date().getHours();
  const isQuietHours = hour < policy.quietHours.end || hour >= policy.quietHours.start;
  if (isQuietHours && incident.severity !== 'CRITICAL') score -= 10;

  if (diagnosis.confidence && diagnosis.confidence < policy.minAutoConfidence) score += 20;

  if (policy.alwaysEscalateServices.includes(incident.service)) score = 100;
  if (policy.alwaysAutoServices.includes(incident.service)) score = 0;

  return Math.max(0, Math.min(100, score));
}

function scoreToLevel(score) {
  if (score >= 70) return 'ESCALATE';
  if (score >= 30) return 'WATCH';
  return 'AUTO';
}

function buildReason(score, incident, details = {}) {
  const parts = [];
  if (details.severityWeight !== undefined) parts.push(`${incident.severity} severity (${details.severityWeight > 0 ? '+' : ''}${details.severityWeight})`);
  if (details.recurring) parts.push(`recurring (${details.recurring}x in window)`);
  if (details.novel) parts.push('novel incident');
  if (details.autoResolveRate !== undefined) parts.push(`${Math.round(details.autoResolveRate * 100)}% auto-resolve rate`);
  if (details.quietHours) parts.push('quiet hours');
  if (details.lowConfidence) parts.push('low diagnosis confidence');
  if (details.alwaysEscalate) parts.push('service marked always-escalate');
  if (details.alwaysAuto) parts.push('service marked always-auto');
  return `Score: ${score} — ${parts.join(' + ') || 'baseline'}`;
}

module.exports = { computeAttentionScore, scoreToLevel, buildReason };