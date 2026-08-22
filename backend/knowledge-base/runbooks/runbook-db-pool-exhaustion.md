# Database Connection Pool Exhaustion Runbook

## Symptoms
- Query timeouts (>30s)
- "Connection pool exhausted" errors
- High latency, elevated error rate
- pg_stat_activity shows many idle connections

## Root Causes
1. Missing statement_timeout
2. Missing idle_in_transaction_session_timeout
3. Connection leak in retry logic
4. Pool size too small for workload

## Immediate Actions
1. Increase pool size: `DB_POOL_SIZE=100`
2. Set timeouts:
   - `statement_timeout=30000`
   - `idle_in_transaction_session_timeout=10000`
3. Kill long-running queries: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state='idle in transaction' AND now() - state_change > interval '30s';`

## Prevention
- Default pool config template for all services
- Connection leak detection in CI
- Monitoring: pool usage > 80% alert