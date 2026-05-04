# Secrets

Purpose: Explains storage, rotation, and logging redaction for secrets.

## Scope

This folder owns small, focused documentation files for secrets.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Storage](storage.md) | Secrets live in environment or approved secret store. |
| [Rotation](rotation.md) | Rotate secrets after compromise, schedule, or admin request. |
| [Logging Redaction](logging-redaction.md) | Logs redact tokens, client secrets, API keys, personal data, and sensitive documents. |

## Read Order

1. [Storage](storage.md)
2. [Rotation](rotation.md)
3. [Logging Redaction](logging-redaction.md)

## Related Domains

- [Security](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
