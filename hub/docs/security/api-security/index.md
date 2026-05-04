# Api Security

Purpose: Explains API keys, request validation, rate limiting, and IP blocking.

## Scope

This folder owns small, focused documentation files for api security.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Api Key Security](api-key-security.md) | API keys are hashed, scoped, revocable, and audited. |
| [Request Validation](request-validation.md) | Validate content type, size, auth, idempotency, and Zod schema. |
| [Rate Limiting](rate-limiting.md) | Rate-limit auth, ingestion, webhook tests, exports, and retries. |
| [Ip Blocking](ip-blocking.md) | Use edge/WAF for broad blocking. |

## Read Order

1. [Api Key Security](api-key-security.md)
2. [Request Validation](request-validation.md)
3. [Rate Limiting](rate-limiting.md)
4. [Ip Blocking](ip-blocking.md)

## Related Domains

- [Security](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
