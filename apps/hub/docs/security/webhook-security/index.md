# Webhook Security

Purpose: Explains signing, timestamp validation, and replay protection.

## Scope

This folder owns small, focused documentation files for webhook security.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Signing](signing.md) | Webhook signatures use HMAC over raw body and timestamp. |
| [Timestamp Validation](timestamp-validation.md) | Webhook timestamp window prevents delayed replay. |
| [Replay Protection](replay-protection.md) | Reject old timestamps. |

## Read Order

1. [Signing](signing.md)
2. [Timestamp Validation](timestamp-validation.md)
3. [Replay Protection](replay-protection.md)

## Related Domains

- [Security](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
