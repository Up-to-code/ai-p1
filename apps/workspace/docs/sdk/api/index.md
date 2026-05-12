# Api

Purpose: Explains SDK API client behavior.

## Scope

This folder owns small, focused documentation files for api.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Api Client](api-client.md) | API client sends bearer token, idempotency key, and JSON payload. |
| [Request Signing](request-signing.md) | Use request signing only where required. |
| [Idempotency](idempotency.md) | Inbound requests require idempotency keys. |
| [Errors](errors.md) | SDK errors use stable codes. |

## Read Order

1. [Api Client](api-client.md)
2. [Request Signing](request-signing.md)
3. [Idempotency](idempotency.md)
4. [Errors](errors.md)

## Related Domains

- [Sdk](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
