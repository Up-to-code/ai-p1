# Webhooks

Purpose: Explains SDK webhook middleware and verification.

## Scope

This folder owns small, focused documentation files for webhooks.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Middleware](middleware.md) | Webhook middleware verifies signature, timestamp, and replay. |
| [Signature Verification](signature-verification.md) | Use HMAC verification with constant-time compare where available. |
| [Replay Protection](replay-protection.md) | Reject old timestamps. |

## Read Order

1. [Middleware](middleware.md)
2. [Signature Verification](signature-verification.md)
3. [Replay Protection](replay-protection.md)

## Related Domains

- [Sdk](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
