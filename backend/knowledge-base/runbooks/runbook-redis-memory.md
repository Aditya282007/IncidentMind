# Redis Memory Pressure Runbook

## Symptoms
- Redis memory > 90%
- High eviction rate (>1000 keys/sec)
- Increased latency on cache operations
- OOM errors in dependent services

## Root Causes
1. Missing TTL on keys (session cache, rate limiting)
2. Large objects stored without compression
3. Cache stampede on cold start
4. Pub/sub message accumulation

## Immediate Actions
1. Set memory policy: `CONFIG SET maxmemory-policy allkeys-lru`
2. Add TTL to session keys: `EXPIRE session:* 3600`
3. Scan for large keys: `MEMORY USAGE key` / `redis-cli --bigkeys`
4. Enable lazy expiration

## Prevention
- Mandatory TTL on all Redis keys
- Monitor memory % alert at 80%
- Use Redis Cluster for horizontal scaling
- Compress large values (snappy/lz4)