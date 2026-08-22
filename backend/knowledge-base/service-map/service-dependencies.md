# Service Dependency Map

## Core Services

### Load Balancer Layer
- **lb-03** (AWS ALB)
  - Routes to: api-server-01, api-server-02, api-server-03
  - Health check: /health endpoint
  - SSL termination: Yes

### API Server Layer
- **api-server-01** (Node.js v2.1.0)
  - Depends on: database-01 (PostgreSQL), cache-redis (Redis Cluster), queue-worker (RabbitMQ)
  - Ports: 3000 (HTTP), 3001 (gRPC)
  - Replicas: 3

- **api-server-02** (Node.js v2.1.0)
  - Depends on: database-01 (PostgreSQL), cache-redis (Redis Cluster), queue-worker (RabbitMQ)
  - Ports: 3000 (HTTP), 3001 (gRPC)
  - Replicas: 3
  - **AFFECTED IN CURRENT INCIDENT**

- **api-server-03** (Node.js v2.1.0)
  - Depends on: database-01 (PostgreSQL), cache-redis (Redis Cluster), queue-worker (RabbitMQ)
  - Ports: 3000 (HTTP), 3001 (gRPC)
  - Replicas: 3

### Data Layer
- **database-01** (PostgreSQL 15.4, Primary)
  - Depends on: None (infrastructure)
  - Used by: api-server-01, api-server-02, api-server-03
  - Connection pool: 100 max connections
  - Read replicas: database-02 (async replica)

- **cache-redis** (Redis Cluster 7.2, 6 shards)
  - Depends on: None (infrastructure)
  - Used by: api-server-01, api-server-02, api-server-03 (session cache, rate limiting)
  - Memory policy: allkeys-lru
  - TTL defaults: session=3600s, ratelimit=60s

- **queue-worker** (RabbitMQ 3.12, 3-node cluster)
  - Depends on: database-01 (for message persistence)
  - Used by: api-server-01, api-server-02, api-server-03 (async job processing)
  - Queues: email, notifications, webhooks, reports
  - HA policy: all queues mirrored

### Auth Service
- **auth-service-v2** (Go 1.21)
  - Depends on: database-01, cache-redis
  - Ports: 8080 (HTTP), 9090 (gRPC)
  - Replicas: 4
  - Circuit breaker: fail-open after 5 failures in 10s

### Monitoring
- **prometheus** (v2.47)
- **grafana** (v10.2)
- **alertmanager** (v0.26)
- **loki** (v2.9) - log aggregation