# Network Topology

## VPC: vpc-incidentmind-prod (10.0.0.0/16)

### Subnets
- **Public (AZ-a)**: 10.0.1.0/24 - ALB, NAT Gateway
- **Public (AZ-b)**: 10.0.2.0/24 - ALB, NAT Gateway
- **Private App (AZ-a)**: 10.0.11.0/24 - API servers, Workers
- **Private App (AZ-b)**: 10.0.12.0/24 - API servers, Workers
- **Private Data (AZ-a)**: 10.0.21.0/24 - PostgreSQL Primary, Redis
- **Private Data (AZ-b)**: 10.0.22.0/24 - PostgreSQL Replica, Redis

## Security Groups
- **sg-alb**: Inbound 80/443 from 0.0.0.0/0, Outbound to sg-api-servers
- **sg-api-servers**: Inbound 3000/3001 from sg-alb, Outbound to sg-db, sg-redis, sg-rabbitmq
- **sg-db**: Inbound 5432 from sg-api-servers, Outbound none
- **sg-redis**: Inbound 6379 from sg-api-servers, Outbound none
- **sg-rabbitmq**: Inbound 5672/15672 from sg-api-servers, Outbound none

## Load Balancer
- **ALB (lb-03)**: Internal=false, Scheme=internet-facing
  - Listeners: 80->443 (redirect), 443 (HTTPS)
  - Target Groups: api-servers (port 3000, HTTP)
  - Health Check: GET /health, 30s interval, 5s timeout, 2 healthy, 3 unhealthy

## DNS
- **api.incidentmind.io** -> ALB (Route53 Alias)
- **Internal service discovery**: Cloud Map (api-server.service.consul)

## VPC Peering
- **vpc-incidentmind-staging** (10.1.0.0/16) - for testing
- **vpc-shared-services** (10.2.0.0/16) - logging, monitoring