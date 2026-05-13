# Synchronization

Purpose: Defines how external claims become approved canonical state and how that state is synchronized outward.

## Scope

This domain owns documentation for synchronization decisions in the Saudi Arabia Central Real Estate Data Workspace.

This domain does not own unrelated CRM, marketplace, lead pipeline, or deal pipeline behavior.

## Files

| Folder | Purpose |
| --- | --- |
| `engine/index.md` | Explains synchronization engine principles. |
| `ingestion/index.md` | Explains inbound claims, payload validation, normalization, and duplicate detection. |
| `approval/index.md` | Explains review queues, approval, rejection, and compliance review. |
| `distribution/index.md` | Explains distribution events, webhooks, retries, dead-letter, and suppression. |

## Read Order

1. [Engine](engine/index.md)
2. [Ingestion](ingestion/index.md)
3. [Approval](approval/index.md)
4. [Distribution](distribution/index.md)

## Related Domains

- [Architecture](../architecture/index.md)
- [Auth](../auth/index.md)
- [Synchronization](../synchronization/index.md)
- [Visibility](../visibility/index.md)
- [Security](../security/index.md)
- [Compliance](../compliance/index.md)

## Maintenance Rules

- Keep this index current when files are added or removed.
- Keep files small and focused.
- Link to related domains instead of duplicating large sections.
- Preserve the platform boundary: synchronization engine, OAuth 2.1 Provider, Saudi market only.
