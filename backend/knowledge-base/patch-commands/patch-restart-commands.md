# Kubernetes Patch Commands Reference

## Rollout Commands
```bash
# Restart deployment
kubectl rollout restart deployment/api-server

# Check rollout status
kubectl rollout status deployment/api-server --timeout=5m

# Undo rollout (rollback)
kubectl rollout undo deployment/api-server

# View rollout history
kubectl rollout history deployment/api-server
```

## ConfigMap Patches
```bash
# Patch database pool config
kubectl patch configmap app-config -p '{"data":{"DB_POOL_SIZE":"100","DB_STATEMENT_TIMEOUT":"30000","DB_IDLE_TIMEOUT":"10000"}}'

# Patch Redis config
kubectl patch configmap app-config -p '{"data":{"REDIS_SESSION_TTL":"3600","REDIS_MAXMEMORY_POLICY":"allkeys-lru"}}'

# Patch circuit breaker
kubectl patch configmap app-config -p '{"data":{"CB_FAILURE_THRESHOLD":"50","CB_TIMEOUT":"10000"}}'
```

## Environment Variable Patches
```bash
# Set env vars and restart
kubectl set env deployment/auth-service REDIS_POOL_MAX_LIFETIME=60s REDIS_POOL_IDLE_TIMEOUT=30s
kubectl rollout restart deployment/auth-service

# Refresh config without restart (Spring Boot Actuator)
kubectl exec -it $(kubectl get pods -l app=app-deployment -o jsonpath='{.items[0].metadata.name}') -- curl -X POST http://localhost:8080/actuator/refresh
```

## Resource Patches
```bash
# Increase memory limit
kubectl patch deployment auth-service -p '{"spec":{"template":{"spec":{"containers":[{"name":"auth-service","resources":{"limits":{"memory":"8Gi"}}}}]}}}'
```

## Debug Commands
```bash
# Trigger GC in Node.js
kubectl exec -it $(kubectl get pods -l app=auth-service -o jsonpath='{.items[0].metadata.name}') -- curl -X POST http://localhost:8080/debug/gc

# Check pod logs
kubectl logs -l app=api-server --tail=100 -f

# Describe pod for events
kubectl describe pod $(kubectl get pods -l app=api-server -o jsonpath='{.items[0].metadata.name}')
```