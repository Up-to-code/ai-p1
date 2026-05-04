# Api

Purpose: Explains SDK API client behavior.

## Scope

This folder owns small, focused documentation files for api.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Authentication](authentication.md) | APIs use OAuth bearer token or approved API key. |
| [Payloads](payloads.md) | Payloads use JSON and Zod-defined schemas. |
| [Errors](errors.md) | SDK errors use stable codes. |
| [Sandbox](sandbox.md) | Sandbox isolates test apps and data. |

## Read Order

1. [Authentication](authentication.md)
2. [Payloads](payloads.md)
3. [Errors](errors.md)
4. [Sandbox](sandbox.md)

## Related Domains

- [Developer Experience](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
