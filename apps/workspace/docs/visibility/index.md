# Visibility

Purpose: Defines how the workspace decides which property data is visible to each platform, audience, organization, and channel.

## Scope

This domain owns documentation for visibility decisions in the Saudi Arabia Central Real Estate Data Workspace.

This domain does not own unrelated CRM, marketplace, lead pipeline, or deal pipeline behavior.

## Files

| Folder | Purpose |
| --- | --- |
| `model/index.md` | Explains the visibility evaluation model. |
| `types/index.md` | Explains specific visibility types. |
| `rules/index.md` | Explains lifecycle and platform rules that hide or allow records. |

## Read Order

1. [Model](model/index.md)
2. [Types](types/index.md)
3. [Rules](rules/index.md)

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
