# Auth

Purpose: Defines Better Auth, OAuth 2.1 Provider behavior, Organization authorization, consent, scopes, and credentials.

## Scope

This domain owns documentation for auth decisions in the Saudi Arabia Central Real Estate Data Workspace.

This domain does not own unrelated CRM, marketplace, lead pipeline, or deal pipeline behavior.

## Files

| Folder | Purpose |
| --- | --- |
| `better-auth/index.md` | Explains Better Auth installation and Convex integration. |
| `oauth-provider/index.md` | Explains the OAuth 2.1 Provider and Continue with Anand flow. |
| `organizations/index.md` | Explains organization, membership, and publisher profiles. |
| `scopes/index.md` | Explains OAuth scopes and their mapping to workspace permissions. |
| `credentials/index.md` | Explains tokens, client secrets, and API keys. |

## Read Order

1. [Better Auth](better-auth/index.md)
2. [Oauth Provider](oauth-provider/index.md)
3. [Organizations](organizations/index.md)
4. [Scopes](scopes/index.md)
5. [Credentials](credentials/index.md)

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
