# CPU Spike Investigation Runbook

## Step 1: Identify Hot Code Paths
- Use `perf top` or `clinic flame` to find CPU hotspots
- Check for GC pressure (high GC CPU %)
- Verify no infinite loops or recursive calls

## Step 2: Memory Leak Detection
- Take heap snapshots at 5-minute intervals
- Compare retained objects between snapshots
- Look for: unclosed DB connections, event listeners, timers, caches without TTL

## Step 3: Connection Pool Issues
- Check pool stats: active, idle, waiting connections
- Verify maxLifetime, idleTimeout, maxConnections settings
- Look for connection leaks in retry logic

## Step 4: Quick Fixes
- Restart service to reset state (temporary)
- Rollback recent deployment if regression
- Increase pod resources if legitimate load increase