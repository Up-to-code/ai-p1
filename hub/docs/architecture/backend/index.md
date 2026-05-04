# Backend

Purpose: Explains backend domain services, Convex functions, repositories, and error behavior.

## Scope

This folder owns small, focused documentation files for backend.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Convex Functions](convex-functions.md) | Queries read and redact data. |
| [Domain Services](domain-services.md) | Domain services are pure TypeScript modules where possible. |
| [Repository Pattern](repository-pattern.md) | Repositories isolate table access patterns. |
| [Error Handling](error-handling.md) | Errors use stable codes. |

## Read Order

1. [Convex Functions](convex-functions.md)
2. [Domain Services](domain-services.md)
3. [Repository Pattern](repository-pattern.md)
4. [Error Handling](error-handling.md)

## Related Domains

- [Architecture](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
