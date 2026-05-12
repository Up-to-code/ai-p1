# Visibility

Purpose: Defines data shapes, table responsibilities, relationships, indexes, validators, and versioning rules.

## Scope

This folder owns small, focused documentation files for visibility.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Visibility Policy](visibility-policy.md) | Visibility policy defines rules by visibility type, platform, organization, and channel. |
| [Visibility Evaluation](visibility-evaluation.md) | Visibility evaluation stores computed result and reasons. |
| [Suppression Record](suppression-record.md) | Suppression record stores hidden reason and platform impact. |

## Read Order

1. [Visibility Policy](visibility-policy.md)
2. [Visibility Evaluation](visibility-evaluation.md)
3. [Suppression Record](suppression-record.md)

## Related Domains

- [Data Model](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
