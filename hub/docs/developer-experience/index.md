# Developer Experience

Purpose: Defines how external developers register apps, test OAuth, configure webhooks, and integrate APIs.

## Scope

This domain owns documentation for developer experience decisions in the Saudi Arabia Central Real Estate Data Hub.

This domain does not own unrelated CRM, marketplace, lead pipeline, or deal pipeline behavior.

## Files

| Folder | Purpose |
| --- | --- |
| `onboarding/index.md` | Explains developer registration, app registration, and production review. |
| `oauth/index.md` | Explains SDK OAuth helpers and token behavior. |
| `webhooks/index.md` | Explains SDK webhook middleware and verification. |
| `api/index.md` | Explains SDK API client behavior. |
| `guides/index.md` | Explains how to connect common external system types. |

## Read Order

1. [Onboarding](onboarding/index.md)
2. [Oauth](oauth/index.md)
3. [Webhooks](webhooks/index.md)
4. [Api](api/index.md)
5. [Guides](guides/index.md)

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
