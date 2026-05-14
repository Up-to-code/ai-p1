# Package

Purpose: Explains SDK package identity, exports, and build targets.

## Scope

This folder owns small, focused documentation files for package.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Package Name](package-name.md) | Primary SDK package is @qentrah/sdk. |
| [Exports](exports.md) | Exports include OAuth client, API client, webhook utilities, types, and errors. |
| [Build Targets](build-targets.md) | Build ESM first. |

## Read Order

1. [Package Name](package-name.md)
2. [Exports](exports.md)
3. [Build Targets](build-targets.md)

## Related Domains

- [Sdk](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
