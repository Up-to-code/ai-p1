# Sdk

Purpose: Defines the official developer SDK plan for OAuth, API access, token handling, and webhook verification.

## Scope

This domain owns documentation for sdk decisions in the Qentrah Workspace.

This domain does not own unrelated CRM, marketplace, lead pipeline, or deal pipeline behavior.

## Files

| Folder | Purpose |
| --- | --- |
| `package/index.md` | Explains SDK package identity, exports, and build targets. |
| `oauth/index.md` | Explains SDK OAuth helpers and token behavior. |
| `api/index.md` | Explains SDK API client behavior. |
| `webhooks/index.md` | Explains SDK webhook middleware and verification. |
| `examples/index.md` | Explains concrete SDK implementation examples. |

## Read Order

1. [Package](package/index.md)
2. [Oauth](oauth/index.md)
3. [Api](api/index.md)
4. [Webhooks](webhooks/index.md)
5. [Examples](examples/index.md)

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
- Preserve the platform boundary: synchronization engine, OAuth 2.1 Provider.
