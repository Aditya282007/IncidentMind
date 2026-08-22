# Database Config Commands Reference

## Connection Pool Configuration
```bash
# Patch ConfigMap for pool settings
kubectl patch configmap app-config -p '{"data":{"DB_POOL_SIZE":"100","DB_STATEMENT_TIMEOUT":"30000","DB_IDLE_TIMEOUT":"10000","DB_MAX_LIFETIME":"600000"}}'

# Apply and restart
kubectl rollout restart deployment/app-deployment
kubectl rollout status deployment/app-deployment
```

## PostgreSQL Runtime Config
```bash
# Set statement timeout (per session)
psql -c "SET statement_timeout = '30s';"

# Set idle timeout (per session)
psql -c "SET idle_in_transaction_session_timeout = '10s';"

# Kill long-running queries
psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state='idle in transaction' AND now() - state_change > interval '30s';"

# Check pool usage
psql -c "SELECT count(*) as active_connections FROM pg_stat_activity WHERE state='active';"
psql -c "SELECT count(*) as idle_connections FROM pg_stat_activity WHERE state='idle';"
```

## Vacuum Commands
```bash
# Manual vacuum freeze (prevent wraparound)
psql -c "VACUUM FREEZE;"

# Check vacuum progress
psql -c "SELECT * FROM pg_stat_progress_vacuum;"

# Check oldest xmin
psql -c "SELECT datname, age(datfrozenxid) FROM pg_database ORDER BY age(datfrozenxid) DESC LIMIT 5;"
```