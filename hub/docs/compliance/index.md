# Compliance

Purpose: Defines Saudi regulatory context for REGA, Real Estate Registry, Ejar, PDPL, and auditability.

## Scope

This domain owns documentation for compliance decisions in the Saudi Arabia Central Real Estate Data Hub.

This domain does not own unrelated CRM, marketplace, lead pipeline, or deal pipeline behavior.

## Files

| Folder | Purpose |
| --- | --- |
| `saudi/index.md` | Explains Saudi regulatory posture and legal disclaimer. |
| `rega/index.md` | Explains REGA-related context and fields. |
| `real-estate-registry/index.md` | Explains property number, title deed, real estate record, and geospatial identity concepts. |
| `ejar/index.md` | Explains Ejar lease references and visibility impact. |
| `pdpl/index.md` | Explains personal data, breach notification, minimization, and data residency. |
| `audit/index.md` | Explains audit logs, exports, evidence retention, and distribution events where applicable. |

## Read Order

1. [Saudi](saudi/index.md)
2. [Rega](rega/index.md)
3. [Real Estate Registry](real-estate-registry/index.md)
4. [Ejar](ejar/index.md)
5. [Pdpl](pdpl/index.md)
6. [Audit](audit/index.md)

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
