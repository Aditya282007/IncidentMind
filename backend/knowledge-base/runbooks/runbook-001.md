# Node.js Service High CPU

## Section 1: Overview
This runbook provides guidance for diagnosing and fixing high CPU usage in Node.js services.

## Section 2: Diagnosis
Check CPU usage, memory usage, and event loop delay.

## Section 3: Fix
If due to memory leak, rollback to previous version or restart service.

## Section 3.2: Memory Leak Diagnosis
1. Check heap snapshots for retained objects
2. Look for unclosed connections, event listeners, timers
3. Verify connection pool config: maxLifetime, idleTimeout
4. Profile with clinic.js or 0x

## Section 4: Event Loop Lag
If event loop delay > 100ms:
- Check for synchronous operations in hot path
- Move crypto/bcrypt to worker_threads
- Reduce JSON.parse/stringify in hot path