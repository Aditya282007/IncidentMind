const NOTIFICATION_MATRIX = {
  ESCALATE: {
    slack:      { send: true,  urgency: 'high',   mention: '@channel' },
    pagerduty:  { send: true },
    github:     { send: true,  createPR: true },
    email:      { send: true }
  },
  WATCH: {
    slack:      { send: true,  urgency: 'normal',  mention: '' },
    pagerduty:  { send: false },
    github:     { send: true,  createPR: true },
    email:      { send: false }
  },
  AUTO: {
    slack:      { send: false },
    pagerduty:  { send: false },
    github:     { send: false },
    email:      { send: false }
  }
};

function getNotificationPlan(attentionLevel, policy) {
  const matrix = JSON.parse(JSON.stringify(NOTIFICATION_MATRIX[attentionLevel] || NOTIFICATION_MATRIX.AUTO));
  
  const hour = new Date().getHours();
  const inQuietHours = hour >= policy.quietHours.start || hour < policy.quietHours.end;
  
  if (inQuietHours && attentionLevel !== 'ESCALATE') {
    matrix.slack.send = false;
    matrix.pagerduty.send = false;
  }
  
  return { matrix, inQuietHours };
}

module.exports = { getNotificationPlan, NOTIFICATION_MATRIX };