import type { IncidentScenario } from '../types/incident';

export const SCENARIOS: IncidentScenario[] = [
  {
    id: 'incident-001',
    title: 'CPU Spike on api-server-2',
    description: 'CPU usage exceeded 95% for 5+ minutes. Risk of cascading failures across load balancer cluster.',
    severity: 'critical',
    component: 'api-server-2',
    tags: ['CPU', 'Performance', 'Infrastructure'],
    metrics: { cpu: 97, latency: 250, errorRate: 2, memory: 78 },
    attentionLevel: 'ESCALATE',
    attentionScore: 85,
    attentionReason: 'CRITICAL severity (+40) + novel incident (+15) + low auto-resolve rate (+20)',
    notificationPlan: {
      slack: { sent: true, reason: 'ESCALATE level triggers Slack with @channel' },
      pagerduty: { sent: true, reason: 'ESCALATE level triggers PagerDuty' },
      github: { sent: true, reason: 'ESCALATE level creates PR' }
    },
    events: [
      { type: 'agent_start', agent: 'Watcher' },
      {
        type: 'agent_complete',
        agent: 'Watcher',
        result: {
          anomalyDetected: true,
          confidence: 0.95,
          description: 'CPU usage exceeded 95% for 5 minutes on api-server-2, currently at 97%',
          severity: 'high',
          affectedComponents: ['api-server-2'],
        },
      },
      { type: 'agent_start', agent: 'Diagnoser' },
      {
        type: 'agent_complete',
        agent: 'Diagnoser',
        result: {
          rootCause: 'High CPU usage on api-server-2 likely due to inefficient request processing or resource-intensive operations',
          contributingFactors: [
            'CPU utilization at 97% indicates resource exhaustion',
            'Request latency of 250ms suggests processing bottlenecks',
            'Memory usage at 78% may indicate memory pressure contributing to CPU overhead',
            'Error rate of 2% could be a symptom of resource contention',
          ],
          confidence: 0.85,
          likelyImpact: 'Degraded API response times, potential service timeouts, and risk of cascading failures if not addressed',
          suggestedInvestigation: [
            'Check application logs for api-server-2 to identify resource-intensive operations',
            'Review recent deployments or code changes that might have introduced performance regressions',
            'Analyze CPU profiling data to identify hotspots in the application code',
            'Examine garbage collection logs if running JVM-based applications',
            'Review auto-scaling configuration to ensure proper resource allocation',
            'Check for any stuck or long-running processes on the affected server',
          ],
          retrievedContext: {
            pastIncidents: [
              {
                content: 'INC-1923: api-server-01 CPU spike → memory leak in v2.1.0 (3 months ago). Root cause: Unclosed database connections in request handler. Fix: Rollback to v2.0.9.',
                metadata: { filename: 'incident-1923.json', category: 'past-incidents' }
              },
              {
                content: 'INC-2104: worker-queue CPU 88% → unclosed DB connections (6 weeks ago). Root cause: Connection pool leak under high load. Fix: Added connection timeout and max lifetime config.',
                metadata: { filename: 'incident-2104.json', category: 'past-incidents' }
              },
              {
                content: 'INC-2256: api-gateway CPU 92% → inefficient regex in middleware (1 month ago). Root cause: Catastrophic backtracking in request validation. Fix: Rewrote validation with RE2-compatible patterns.',
                metadata: { filename: 'incident-2256.json', category: 'past-incidents' }
              }
            ],
            runbooks: [
              {
                content: '# Node.js Service High CPU\n## Section 3.2: Memory Leak Diagnosis\n1. Check heap snapshots for retained objects\n2. Look for unclosed connections, event listeners, timers\n3. Verify connection pool config: maxLifetime, idleTimeout\n4. Profile with clinic.js or 0x',
                metadata: { filename: 'runbook-nodejs-high-cpu.md', category: 'runbooks' }
              },
              {
                content: '# CPU Spike Investigation Runbook\n## Step 1: Identify Hot Code Paths\n- Use `perf top` or `clinic flame` to find CPU hotspots\n- Check for GC pressure (high GC CPU %)\n- Verify no infinite loops or recursive calls',
                metadata: { filename: 'runbook-cpu-investigation.md', category: 'runbooks' }
              }
            ]
          },
        },
      },
      { type: 'agent_start', agent: 'Patcher' },
      {
        type: 'agent_complete',
        agent: 'Patcher',
        result: {
          recommendedFix: 'Restart the api-server-2 service to temporarily free up resources and reset any stuck processes, while investigating the root cause through logs and profiling data.',
          fixType: 'restartService',
          commands: [
            'ssh user@api-server-2',
            'sudo systemctl restart api-server',
            'exit',
          ],
          rollbackPlan: 'If restarting causes further instability or does not resolve the issue, revert by restarting the service again or rolling back to a previous stable deployment if applicable.',
          estimatedTime: '2 minutes',
          riskLevel: 'low',
          retrievedContext: {
            runbooks: [
              {
                content: '# Service Restart Runbook\n## Node.js Service Graceful Restart\n1. Drain connections: `kubectl cordon <node>`\n2. Scale down: `kubectl scale deployment/api-server --replicas=0`\n3. Scale up: `kubectl scale deployment/api-server --replicas=3`\n4. Verify health: `kubectl get pods -l app=api-server`\n5. Uncordon: `kubectl uncordon <node>`',
                metadata: { filename: 'runbook-service-restart.md', category: 'runbooks' }
              }
            ],
            patchCommands: [
              {
                content: '# Restart Commands Reference\nkubectl rollout restart deployment/api-server\nkubectl rollout status deployment/api-server\nkubectl get pods -l app=api-server -w',
                metadata: { filename: 'patch-restart-commands.md', category: 'patch-commands' }
              }
            ]
          },
        },
      },
      { type: 'agent_start', agent: 'Communicator' },
      {
        type: 'agent_complete',
        agent: 'Communicator',
        result: {
          slackMessage: ':warning: *Incident Update: CPU Spike on api-server-2*\n\nA high CPU usage (97%) has been detected on `api-server-2`, impacting API performance. Recommended action: restart the `api-server` service to temporarily relieve resource contention.\n\n:arrow_forward: *Next steps:*\n- Investigate root cause using logs and profiling data\n- Monitor for recurrence after restart\n\n:stopwatch: Estimated resolution time: ~2 minutes\n:level_slider: Risk level: Low\n\n:technologist: Please acknowledge and proceed with the restart if approved.',
          incidentReport: 'Incident ID: incident-001\nTitle: CPU spike detected on api-server-2\nDescription: CPU usage exceeded 95% for 5 minutes on api-server-2. Currently at 97%.\n\nRoot Cause: High CPU usage likely due to inefficient request processing.\n\nContributing Factors:\n- CPU utilization at 97% indicates resource exhaustion\n- Request latency of 250ms suggests processing bottlenecks\n- Memory usage at 78% may indicate memory pressure\n- Error rate of 2% could be a symptom of resource contention\n\nRecommended Fix: Restart api-server-2 service.\nEstimated Time: 2 minutes\nRisk Level: Low',
          runbookEntry: '### Runbook Entry: CPU Spike on API Server\n\n#### Symptoms\n- High CPU usage (>95%)\n- Increased request latency\n- Elevated error rates\n\n#### Immediate Action\n1. SSH into the affected server\n2. Restart the `api-server` service\n3. Monitor metrics post-restart\n\n#### Investigation Steps\n- Check application logs for resource-intensive operations\n- Review recent deployments\n- Analyze CPU profiling data\n\n#### Escalation\nIf issue persists or recurs, escalate to performance team.',
          priority: 'high',
          notificationChannels: ['slack', 'email'],
          retrievedContext: {
            runbooks: [
              {
                content: '# Incident Notification Template\n## High/Critical Severity\n- Title: INC-{id} | {service} | {severity}\n- Root Cause: {rootCause}\n- Fix: {fixType} - {estimatedTime}\n- Risk: {riskLevel}\n- Channels: Slack #incidents, PagerDuty, Email\n- Runbook: Link to relevant runbook section',
                metadata: { filename: 'runbook-notification-template.md', category: 'runbooks' }
              }
            ]
          },
        },
      },
      {
        type: 'analysis_complete',
        result: {
          incidentId: 'incident-001',
          status: 'analyzed',
          timestamp: '2026-06-11T09:09:44.359Z',
          watcher: {
            anomalyDetected: true,
            confidence: 0.95,
            description: 'CPU usage exceeded 95% for 5 minutes on api-server-2, currently at 97%',
            severity: 'high',
            affectedComponents: ['api-server-2'],
          },
          diagnoser: {
            rootCause: 'High CPU usage on api-server-2 likely due to inefficient request processing or resource-intensive operations',
            contributingFactors: [
              'CPU utilization at 97% indicates resource exhaustion',
              'Request latency of 250ms suggests processing bottlenecks',
              'Memory usage at 78% may indicate memory pressure',
              'Error rate of 2% could be a symptom of resource contention',
            ],
            confidence: 0.85,
            likelyImpact: 'Degraded API response times, potential service timeouts, and risk of cascading failures',
            suggestedInvestigation: [
              'Check application logs for api-server-2',
              'Review recent deployments',
              'Analyze CPU profiling data',
            ],
          },
          patcher: {
            recommendedFix: 'Restart api-server-2 to free up resources.',
            fixType: 'restartService',
            commands: ['ssh user@api-server-2', 'sudo systemctl restart api-server', 'exit'],
            rollbackPlan: 'Rollback to previous stable deployment if restart fails.',
            estimatedTime: '2 minutes',
            riskLevel: 'low',
          },
          communicator: {
            slackMessage: ':warning: *Incident Update: CPU Spike on api-server-2* — Resolved.',
            incidentReport: 'Incident ID: incident-001 — Resolved.',
            runbookEntry: '### CPU Spike Runbook — Complete.',
            priority: 'high',
            notificationChannels: ['slack', 'email'],
          },
        },
      },
    ],
  },

  {
    id: 'incident-002',
    title: 'Database Connection Pool Exhaustion',
    description: 'Connection pool maxed out causing query timeouts. High concurrent load overwhelming available connections.',
    severity: 'high',
    component: 'db-cluster-primary',
    tags: ['Database', 'Connections', 'Timeout'],
    metrics: { cpu: 64, latency: 1850, errorRate: 12, memory: 91 },
    attentionLevel: 'WATCH',
    attentionScore: 55,
    attentionReason: 'HIGH severity (+20) + seen 2x before (-20) + medium auto-resolve rate',
    notificationPlan: {
      slack: { sent: true, reason: 'WATCH level triggers Slack' },
      pagerduty: { sent: false, reason: 'WATCH level suppresses PagerDuty' },
      github: { sent: true, reason: 'WATCH level creates PR' }
    },
    events: [
      { type: 'agent_start', agent: 'Watcher' },
      {
        type: 'agent_complete',
        agent: 'Watcher',
        result: {
          anomalyDetected: true,
          confidence: 0.85,
          description: 'High request latency and elevated error rate indicative of database connection pool exhaustion and query timeouts',
          severity: 'high',
          affectedComponents: ['database', 'application-server'],
        },
      },
      { type: 'agent_start', agent: 'Diagnoser' },
      {
        type: 'agent_complete',
        agent: 'Diagnoser',
        result: {
          rootCause: 'Database connection pool exhaustion leading to query timeouts and subsequent request latency',
          contributingFactors: [
            'Insufficient database connection pool size configuration',
            'Long-running database queries consuming connections',
            'High concurrent request volume overwhelming available connections',
            'Lack of connection timeout configuration causing connection leaks',
          ],
          confidence: 0.9,
          likelyImpact: 'Degraded application performance, increased user-facing errors, and potential service unavailability if the issue persists',
          suggestedInvestigation: [
            'Review current database connection pool configuration and maximum pool size settings',
            'Analyze slow query logs to identify long-running database queries',
            'Examine application code for proper connection handling and cleanup patterns',
            'Monitor connection pool utilization metrics to confirm exhaustion pattern',
            'Check for connection leaks or unclosed database connections in application code',
          ],
        },
      },
      { type: 'agent_start', agent: 'Patcher' },
      {
        type: 'agent_complete',
        agent: 'Patcher',
        result: {
          recommendedFix: 'Increase database connection pool size and implement connection timeout configurations to prevent pool exhaustion under high load',
          fixType: 'configChange',
          commands: [
            "kubectl patch configmap app-config -p '{\"data\":{\"DB_POOL_SIZE\": \"100\", \"DB_CONNECTION_TIMEOUT\": \"30s\", \"DB_MAX_LIFETIME\": \"10m\"}}'",
            'kubectl rollout restart deployment/app-deployment',
            "kubectl exec -it $(kubectl get pods -l app=app-deployment -o jsonpath='{.items[0].metadata.name}') -- curl -X POST http://localhost:8080/actuator/refresh",
          ],
          rollbackPlan: 'Revert the configmap changes to previous pool size values and restart the deployment to restore original configuration',
          estimatedTime: '10 minutes',
          riskLevel: 'medium',
        },
      },
      { type: 'agent_start', agent: 'Communicator' },
      {
        type: 'agent_complete',
        agent: 'Communicator',
        result: {
          slackMessage: ':warning: *Incident Detected: Database Connection Pool Exhaustion*\n\n*Summary:*\nHigh request latency and error rates observed due to database connection pool exhaustion.\n\n*Recommended Fix:* Increase DB connection pool size and set connection timeout configurations.\n\n:hourglass_flowing_sand: *Estimated Time:* 10 minutes\n:rotating_light: *Risk Level:* Medium',
          incidentReport: 'Incident ID: incident-002\nTitle: Database connection pool exhaustion\nDescription: Database connection pool exhausted causing query timeouts\n\nRoot Cause: Connection pool exhaustion leading to query timeouts and latency.\n\nFix Type: Configuration Change\nRisk Level: Medium\nEstimated Time: 10 minutes',
          runbookEntry: 'Title: Database Connection Pool Exhaustion\n\nProblem: High latency and errors due to connection pool exhaustion.\n\nSolution:\n1. Increase the database connection pool size via configmap.\n2. Set connection timeout and max lifetime settings.\n3. Restart deployment to apply changes.\n\nRollback: Revert configmap and restart.',
          priority: 'high',
          notificationChannels: ['slack', 'pagerduty'],
        },
      },
      {
        type: 'analysis_complete',
        result: {
          incidentId: 'incident-002',
          status: 'analyzed',
          timestamp: '2026-06-11T09:34:55.053Z',
          watcher: {
            anomalyDetected: true,
            confidence: 0.85,
            description: 'High request latency and elevated error rate indicative of database connection pool exhaustion',
            severity: 'high',
            affectedComponents: ['database', 'application-server'],
          },
          diagnoser: {
            rootCause: 'Database connection pool exhaustion leading to query timeouts',
            contributingFactors: ['Insufficient pool size', 'Long-running queries', 'High concurrent load'],
            confidence: 0.9,
            likelyImpact: 'Degraded performance and potential service unavailability',
            suggestedInvestigation: ['Review pool config', 'Analyze slow queries', 'Check connection leaks'],
          },
          patcher: {
            recommendedFix: 'Increase connection pool size and add timeout config.',
            fixType: 'configChange',
            commands: ["kubectl patch configmap app-config -p '{\"data\":{\"DB_POOL_SIZE\": \"100\"}}'", 'kubectl rollout restart deployment/app-deployment'],
            rollbackPlan: 'Revert configmap changes.',
            estimatedTime: '10 minutes',
            riskLevel: 'medium',
          },
          communicator: {
            slackMessage: ':warning: *DB Connection Pool Exhaustion* — Resolved.',
            incidentReport: 'Incident ID: incident-002 — Resolved.',
            runbookEntry: '### DB Connection Pool Runbook.',
            priority: 'high',
            notificationChannels: ['slack', 'pagerduty'],
          },
        },
      },
    ],
  },

  {
    id: 'incident-003',
    title: 'Memory Leak in auth-service-v2',
    description: 'Heap usage climbing 2.4GB/min. Redis connection pool leaking during failed retry cycles. Service degradation imminent.',
    severity: 'critical',
    component: 'auth-service-v2',
    tags: ['Memory', 'Auth', 'Redis'],
    metrics: { cpu: 72, latency: 433, errorRate: 5.8, memory: 94 },
    attentionLevel: 'AUTO',
    attentionScore: 18,
    attentionReason: 'CRITICAL severity (+40) but recurring service (-20) + high auto-resolve rate (-15) + always-auto service',
    notificationPlan: {
      slack: { sent: false, reason: 'AUTO level suppresses Slack' },
      pagerduty: { sent: false, reason: 'AUTO level suppresses PagerDuty' },
      github: { sent: false, reason: 'AUTO level suppresses GitHub PR' }
    },
    events: [
      { type: 'agent_start', agent: 'Watcher' },
      {
        type: 'agent_complete',
        agent: 'Watcher',
        result: {
          anomalyDetected: true,
          confidence: 0.92,
          description: 'Heap memory growing at 2.4GB/min in auth-service-v2. Redis connection pool leaking under retry pressure. Memory at 94% and climbing.',
          severity: 'critical',
          affectedComponents: ['auth-service-v2', 'redis-cluster', 'go-service-cluster'],
        },
      },
      { type: 'agent_start', agent: 'Diagnoser' },
      {
        type: 'agent_complete',
        agent: 'Diagnoser',
        result: {
          rootCause: 'Memory leak identified in the Redis connection pool within the Go-service-cluster, specifically during failed retry cycles causing connections to not be returned to the pool',
          contributingFactors: [
            'Redis connection pool not releasing connections on failed retries',
            'Go garbage collector unable to reclaim leaked connection objects',
            'Retry backoff logic creating connection accumulation under load',
            'Missing connection pool max-lifetime enforcement',
            'Circuit breaker not triggering due to incorrect threshold configuration',
          ],
          confidence: 0.91,
          likelyImpact: 'Auth service OOM crash within 8-12 minutes. Downstream services will begin failing auth checks causing cascading 401s across the platform.',
          suggestedInvestigation: [
            'Inspect Redis connection pool implementation in go-service-cluster',
            'Review retry logic in auth-service for connection handling on failure',
            'Check circuit breaker threshold configuration',
            'Examine heap dump for connection object accumulation',
            'Review Go pprof memory profiles for allocation hotspots',
          ],
        },
      },
      { type: 'agent_start', agent: 'Patcher' },
      {
        type: 'agent_complete',
        agent: 'Patcher',
        result: {
          recommendedFix: 'Apply hot-patch to auth-service to enforce connection pool max-lifetime and fix retry logic connection handling. Force GC cycle to reclaim existing leaks.',
          fixType: 'hotPatch',
          commands: [
            'kubectl set env deployment/auth-service REDIS_POOL_MAX_LIFETIME=60s REDIS_POOL_IDLE_TIMEOUT=30s',
            'kubectl rollout restart deployment/auth-service-v2',
            "kubectl exec -it $(kubectl get pods -l app=auth-service -o jsonpath='{.items[0].metadata.name}') -- curl -X POST http://localhost:8080/debug/gc",
            "kubectl patch deployment auth-service -p '{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"auth-service\",\"resources\":{\"limits\":{\"memory\":\"4Gi\"}}}]}}}}'",
          ],
          rollbackPlan: 'Revert environment variables to previous values and restart deployment. Previous stable version: auth-service:v2.0-stable available for full rollback.',
          estimatedTime: '4 minutes',
          riskLevel: 'low',
        },
      },
      { type: 'agent_start', agent: 'Communicator' },
      {
        type: 'agent_complete',
        agent: 'Communicator',
        result: {
          slackMessage: ':rotating_light: *CRITICAL: Memory Leak — auth-service-v2*\n\nHeap memory growing at 2.4GB/min. Redis connection pool leak confirmed during retry cycles.\n\n*Action taken:* Hot-patch deployed — connection pool max-lifetime enforced, GC triggered.\n\n:white_check_mark: Auth service stabilizing. Monitor for 5 minutes post-patch.\n\n:hourglass: *ETA:* 4 minutes | :level_slider: *Risk:* Low',
          incidentReport: 'Incident ID: incident-003\nTitle: Memory Leak in auth-service-v2\nDescription: Redis connection pool leak causing heap growth at 2.4GB/min.\n\nRoot Cause: Connection pool not releasing on failed retries in Go service.\n\nFix Applied: Hot-patch with pool max-lifetime enforcement + forced GC cycle.\nEstimated Time: 4 minutes | Risk Level: Low',
          runbookEntry: '### Memory Leak: Redis Connection Pool\n\n#### Symptoms\n- Heap growing >1GB/min\n- Redis connection count climbing\n- Auth latency >400ms\n\n#### Immediate Action\n1. Set REDIS_POOL_MAX_LIFETIME env var\n2. Restart auth-service deployment\n3. Trigger manual GC via debug endpoint\n\n#### Prevention\n- Add connection pool max-lifetime to all service configs\n- Set circuit breaker thresholds for Redis\n- Add heap growth alerting at 80% threshold',
          priority: 'critical',
          notificationChannels: ['slack', 'pagerduty', 'email'],
        },
      },
      {
        type: 'analysis_complete',
        result: {
          incidentId: 'incident-003',
          status: 'analyzed',
          timestamp: new Date().toISOString(),
          watcher: {
            anomalyDetected: true,
            confidence: 0.92,
            description: 'Heap memory growing at 2.4GB/min in auth-service-v2',
            severity: 'critical',
            affectedComponents: ['auth-service-v2', 'redis-cluster'],
          },
          diagnoser: {
            rootCause: 'Redis connection pool not releasing on failed retry cycles',
            contributingFactors: ['Connection pool leak', 'GC pressure', 'Missing max-lifetime'],
            confidence: 0.91,
            likelyImpact: 'OOM crash in 8-12 minutes',
            suggestedInvestigation: ['Inspect pool implementation', 'Review retry logic'],
          },
          patcher: {
            recommendedFix: 'Hot-patch with pool max-lifetime enforcement.',
            fixType: 'hotPatch',
            commands: ['kubectl set env deployment/auth-service REDIS_POOL_MAX_LIFETIME=60s', 'kubectl rollout restart deployment/auth-service-v2'],
            rollbackPlan: 'Rollback to auth-service:v2.0-stable',
            estimatedTime: '4 minutes',
            riskLevel: 'low',
          },
          communicator: {
            slackMessage: ':rotating_light: Memory Leak auth-service-v2 — Resolved.',
            incidentReport: 'Incident ID: incident-003 — Resolved.',
            runbookEntry: '### Memory Leak Runbook — Complete.',
            priority: 'critical',
            notificationChannels: ['slack', 'pagerduty', 'email'],
          },
        },
      },
    ],
  },
];
