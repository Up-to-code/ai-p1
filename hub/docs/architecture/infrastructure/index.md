# Infrastructure

Purpose: Explains runtime environments, scaling, caching, and observability.

## Scope

This folder owns small, focused documentation files for infrastructure.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Environments](environments.md) | Use separate sandbox and production environments. |
| [Scaling](scaling.md) | Use Workpool for heavy async jobs. |
| [Caching](caching.md) | Convex realtime data is primary for admin state. |
| [Observability](observability.md) | Track ingestion volume, approval queue depth, webhook failures, dead-letter count, and visibility suppression events. |

## Read Order

1. [Environments](environments.md)
2. [Scaling](scaling.md)
3. [Caching](caching.md)
4. [Observability](observability.md)

## Related Domains

- [Architecture](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
