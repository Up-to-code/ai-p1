# Webhooks

Purpose: Explains SDK webhook middleware and verification.

## Scope

This folder owns small, focused documentation files for webhooks.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Webhook Setup](webhook-setup.md) | Developers register webhook URL and signing secret handling. |
| [Test Delivery](test-delivery.md) | Test delivery sends signed sample event. |
| [Delivery Debugging](delivery-debugging.md) | Debug delivery by event ID, status, attempts, response code, and safe error metadata. |

## Read Order

1. [Webhook Setup](webhook-setup.md)
2. [Test Delivery](test-delivery.md)
3. [Delivery Debugging](delivery-debugging.md)

## Related Domains

- [Developer Experience](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
