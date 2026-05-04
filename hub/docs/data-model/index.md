# Data Model

Purpose: Defines data shapes, table responsibilities, relationships, indexes, validators, and versioning rules.

## Scope

This domain owns documentation for data model decisions in the Saudi Arabia Central Real Estate Data Hub.

This domain does not own unrelated CRM, marketplace, lead pipeline, or deal pipeline behavior.

## Files

| Folder | Purpose |
| --- | --- |
| `property/index.md` | Explains property identity, location, lifecycle, Saudi identifiers, and ownership references. |
| `submission/index.md` | Explains submission records and validation, approval, and rejection states. |
| `organizations/index.md` | Explains organization, membership, and publisher profiles. |
| `integrations/index.md` | Explains connected platforms, OAuth clients, webhook endpoints, and API key records. |
| `visibility/index.md` | Focused documentation folder. |
| `audit/index.md` | Explains audit logs, exports, evidence retention, and distribution events where applicable. |
| `convex-schema/index.md` | Explains table rules, indexes, validators, and versioning. |

## Read Order

1. [Property](property/index.md)
2. [Submission](submission/index.md)
3. [Organizations](organizations/index.md)
4. [Integrations](integrations/index.md)
5. [Visibility](visibility/index.md)
6. [Audit](audit/index.md)
7. [Convex Schema](convex-schema/index.md)

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
