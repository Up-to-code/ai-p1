# Data Flow

Purpose: Explains the movement of data through ingestion, approval, canonical state, and outbound sync.

## Scope

This folder owns small, focused documentation files for data flow.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Inbound Flow](inbound-flow.md) | Authenticate request, rate-limit, check idempotency, validate payload, normalize Saudi fields, and create submission or direct approved update as policy allows. |
| [Approval Flow](approval-flow.md) | Approval is required for sensitive or authority-changing updates. |
| [Canonical State Flow](canonical-state-flow.md) | Approved changes create property versions. |
| [Outbound Sync Flow](outbound-sync-flow.md) | Visibility evaluation creates scoped payloads. |

## Read Order

1. [Inbound Flow](inbound-flow.md)
2. [Approval Flow](approval-flow.md)
3. [Canonical State Flow](canonical-state-flow.md)
4. [Outbound Sync Flow](outbound-sync-flow.md)

## Related Domains

- [Architecture](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
