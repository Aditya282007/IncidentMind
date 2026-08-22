# Redis Config Commands Reference

## Memory Management
```bash
# Set memory policy
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Set maxmemory (requires restart for persistence)
redis-cli CONFIG SET maxmemory 2gb

# Check memory usage
redis-cli INFO memory
redis-cli MEMORY STATS
redis-cli MEMORY USAGE session:abc123
```

## TTL Management
```bash
# Set TTL on pattern (requires Lua script)
redis-cli EVAL "local keys = redis.call('KEYS', ARGV[1]) if #keys > 0 then return redis.call('EXPIRE', keys[1], ARGV[2]) end return 0" 0 "session:*" 3600

# Scan for keys without TTL
redis-cli --scan --pattern "session:*" | while read key; do redis-cli TTL "$key"; done | grep -E "^\-1$" | head -20
```

## Connection Pool Config (Client-side)
```bash
# Env vars for Node.js ioredis
REDIS_POOL_MAX=50
REDIS_POOL_MIN=10
REDIS_POOL_MAX_LIFETIME=60000
REDIS_POOL_IDLE_TIMEOUT=30000
REDIS_CONNECT_TIMEOUT=10000
REDIS_COMMAND_TIMEOUT=5000
```

## Cluster Commands
```bash
# Check cluster health
redis-cli CLUSTER INFO
redis-cli CLUSTER NODES

# Manual failover (if master unhealthy)
redis-cli CLUSTER FAILOVER

# Check slot distribution
redis-cli CLUSTER SLOTS
```