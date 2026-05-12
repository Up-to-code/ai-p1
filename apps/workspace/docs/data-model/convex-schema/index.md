# Convex Schema

Purpose: Explains table rules, indexes, validators, and versioning.

## Scope

This folder owns small, focused documentation files for convex schema.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Table Rules](table-rules.md) | Tables have one responsibility. |
| [Indexes](indexes.md) | Indexes must match queries. |
| [Validators](validators.md) | Convex validators protect function args and schema. |
| [Versioning](versioning.md) | Canonical property changes are versioned. |

## Read Order

1. [Table Rules](table-rules.md)
2. [Indexes](indexes.md)
3. [Validators](validators.md)
4. [Versioning](versioning.md)

## Related Domains

- [Data Model](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
