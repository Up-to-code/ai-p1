# Cache

## Purpose
Backend cache architecture boundary for scoped cache contracts and future cache policy implementation.

## What Belongs Here
- Cache scope contracts
- Cache key contracts
- Per-user and per-checker cache boundaries
- Invalidation and read-through placeholders

## What Must Not Live Here
- Live cache stores
- Redis, KV, database, or Web Cache API implementation
- Hard-coded user or tenant values
- Domain business logic

## Public Export Expectations
Export cache contracts only until a cache provider and runtime are selected.

## Agent And Programmer Rules
- Every future cache must declare scope: global, per-user, per-organization, per-team, or per-checker.
- Cache keys must avoid secrets and raw PII.
- Invalidation must be designed before writes are cached.

## Future Implementation Notes
Hono cache middleware may be used only where the runtime supports the Web Cache API; otherwise use project-owned contracts here.
