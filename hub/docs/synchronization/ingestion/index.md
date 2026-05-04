# Ingestion

Purpose: Explains inbound claims, payload validation, normalization, and duplicate detection.

## Scope

This folder owns small, focused documentation files for ingestion.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [External Claims](external-claims.md) | Claims include create, update, lifecycle, visibility, document, and media changes. |
| [Payload Validation](payload-validation.md) | Use Zod for public payloads. |
| [Normalization](normalization.md) | Normalize Saudi identifiers, property type, location, lifecycle, and references. |
| [Duplicate Detection](duplicate-detection.md) | Use Saudi identifiers, title deed references, National Address, coordinates, and publisher context. |

## Read Order

1. [External Claims](external-claims.md)
2. [Payload Validation](payload-validation.md)
3. [Normalization](normalization.md)
4. [Duplicate Detection](duplicate-detection.md)

## Related Domains

- [Synchronization](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
