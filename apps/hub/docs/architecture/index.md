# Architecture

Purpose: Defines the technical structure of the Saudi Arabia Central Real Estate Data Hub as a synchronization engine.

## Scope

This domain owns documentation for architecture decisions in the Saudi Arabia Central Real Estate Data Hub.

This domain does not own unrelated CRM, marketplace, lead pipeline, or deal pipeline behavior.

## Files

| Folder | Purpose |
| --- | --- |
| `overview/index.md` | Explains the system context, platform boundary, and source-of-truth rules. |
| `frontend/index.md` | Explains frontend architecture using Next.js App Router, ShadCN/UI, Tailwind CSS, Lucide React, and Convex realtime data. |
| `backend/index.md` | Explains backend domain services, Convex functions, repositories, and error behavior. |
| `convex/index.md` | Explains Convex-specific backend boundaries, queries, mutations, actions, schema, and HTTP routes. |
| `infrastructure/index.md` | Explains runtime environments, scaling, caching, and observability. |
| `data-flow/index.md` | Explains the movement of data through ingestion, approval, canonical state, and outbound sync. |

## Read Order

1. [Overview](overview/index.md)
2. [Frontend](frontend/index.md)
3. [Backend](backend/index.md)
4. [Convex](convex/index.md)
5. [Infrastructure](infrastructure/index.md)
6. [Data Flow](data-flow/index.md)

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
