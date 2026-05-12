# Engine

Purpose: Explains synchronization engine principles.

## Scope

This folder owns small, focused documentation files for engine.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Sync Principles](sync-principles.md) | The hub is the synchronization engine. |
| [Canonical Wins](canonical-wins.md) | Canonical property version is the distribution source. |
| [Idempotency](idempotency.md) | Inbound requests require idempotency keys. |
| [Conflict Resolution](conflict-resolution.md) | Conflicts become reviewable submissions. |

## Read Order

1. [Sync Principles](sync-principles.md)
2. [Canonical Wins](canonical-wins.md)
3. [Idempotency](idempotency.md)
4. [Conflict Resolution](conflict-resolution.md)

## Related Domains

- [Synchronization](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
