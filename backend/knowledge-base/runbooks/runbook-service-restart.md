# Service Restart Runbook

## Node.js Service Graceful Restart
1. Drain connections: `kubectl cordon <node>`
2. Scale down: `kubectl scale deployment/api-server --replicas=0`
3. Scale up: `kubectl scale deployment/api-server --replicas=3`
4. Verify health: `kubectl get pods -l app=api-server`
5. Uncordon: `kubectl uncordon <node>`

## Rollback Deployment
`kubectl rollout undo deployment/api-server`
`kubectl rollout status deployment/api-server`

## Rolling Restart
`kubectl rollout restart deployment/api-server`
`kubectl rollout status deployment/api-server --timeout=5m`