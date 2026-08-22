const { connectDB, mongoAvailable } = require('./mongoService');

const DEFAULT_POLICY = {
  _id: 'default',
  severityDefaults: {
    LOW: 'AUTO',
    MEDIUM: 'WATCH',
    HIGH: 'ESCALATE',
    CRITICAL: 'ESCALATE'
  },
  alwaysEscalateServices: ['payment-service', 'auth-service'],
  alwaysAutoServices: ['cache-redis', 'cdn-edge'],
  quietHours: { start: 22, end: 7 },
  minAutoConfidence: 0.70,
  recurrenceWindowDays: 7,
  recurrenceThreshold: 2,
  updatedAt: new Date()
};

async function getAttentionPolicy(db) {
  if (!mongoAvailable) return DEFAULT_POLICY;
  
  try {
    const policy = await db.collection('attention_policy').findOne({ _id: 'default' });
    if (policy) return { ...DEFAULT_POLICY, ...policy };
    return DEFAULT_POLICY;
  } catch (error) {
    console.error('Error fetching attention policy:', error);
    return DEFAULT_POLICY;
  }
}

async function saveAttentionPolicy(db, updates) {
  if (!mongoAvailable) return { success: false, error: 'MongoDB not available', skipped: true };
  
  try {
    const policy = {
      ...DEFAULT_POLICY,
      ...updates,
      updatedAt: new Date()
    };
    
    await db.collection('attention_policy').updateOne(
      { _id: 'default' },
      { $set: policy },
      { upsert: true }
    );
    
    return { success: true, policy };
  } catch (error) {
    console.error('Error saving attention policy:', error);
    return { success: false, error: error.message };
  }
}

async function generateDefaultsFromHistory(db) {
  if (!mongoAvailable) return { success: true, policy: DEFAULT_POLICY };
  
  try {
    const pipeline = [
      {
        $group: {
          _id: '$service',
          total: { $sum: 1 },
          autoResolved: { $sum: { $cond: [{ $eq: ['$status', 'AUTO_RESOLVED'] }, 1, 0] } },
          severities: { $push: '$severity' }
        }
      }
    ];
    
    const serviceStats = await db.collection('incidents').aggregate(pipeline).toArray();
    
    const alwaysAuto = serviceStats
      .filter(s => s.total > 0 && s.autoResolved / s.total > 0.7)
      .map(s => s._id);
    
    const alwaysEscalate = serviceStats
      .filter(s => s.severities.every(sev => sev === 'CRITICAL'))
      .map(s => s._id);
    
    const avgRecurrenceWindow = 7;
    
    const suggestedPolicy = {
      ...DEFAULT_POLICY,
      alwaysAutoServices: [...new Set([...DEFAULT_POLICY.alwaysAutoServices, ...alwaysAuto])],
      alwaysEscalateServices: [...new Set([...DEFAULT_POLICY.alwaysEscalateServices, ...alwaysEscalate])],
      recurrenceWindowDays: avgRecurrenceWindow
    };
    
    return { success: true, policy: suggestedPolicy };
  } catch (error) {
    console.error('Error generating defaults from history:', error);
    return { success: false, error: error.message, policy: DEFAULT_POLICY };
  }
}

module.exports = { getAttentionPolicy, saveAttentionPolicy, generateDefaultsFromHistory, DEFAULT_POLICY };