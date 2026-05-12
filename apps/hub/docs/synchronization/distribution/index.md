# Distribution

Purpose: Explains distribution events, webhooks, retries, dead-letter, and suppression.

## Scope

This folder owns small, focused documentation files for distribution.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Distribution Events](distribution-events.md) | Distribution events represent outbound sync intent. |
| [Webhook Delivery](webhook-delivery.md) | Webhook payloads are signed. |
| [Retries](retries.md) | Retries are bounded and idempotent. |
| [Dead Letter](dead-letter.md) | Dead-letter state records exhausted delivery attempts. |
| [Suppression Events](suppression-events.md) | Suppression events withdraw or hide data downstream. |

## Read Order

1. [Distribution Events](distribution-events.md)
2. [Webhook Delivery](webhook-delivery.md)
3. [Retries](retries.md)
4. [Dead Letter](dead-letter.md)
5. [Suppression Events](suppression-events.md)

## Related Domains

- [Synchronization](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
