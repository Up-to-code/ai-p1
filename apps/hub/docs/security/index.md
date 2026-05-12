# Security

Purpose: Defines threat controls, token safety, API protection, webhook safety, frontend safety, and secrets handling.

## Scope

This domain owns documentation for security decisions in the Saudi Arabia Central Real Estate Data Hub.

This domain does not own unrelated CRM, marketplace, lead pipeline, or deal pipeline behavior.

## Files

| Folder | Purpose |
| --- | --- |
| `threat-model/index.md` | Explains actors, attack surfaces, and mitigations. |
| `auth-security/index.md` | Explains OAuth, token, session, and client secret security. |
| `api-security/index.md` | Explains API keys, request validation, rate limiting, and IP blocking. |
| `webhook-security/index.md` | Explains signing, timestamp validation, and replay protection. |
| `frontend-security/index.md` | Explains XSS, safe rendering, and CSP. |
| `secrets/index.md` | Explains storage, rotation, and logging redaction for secrets. |

## Read Order

1. [Threat Model](threat-model/index.md)
2. [Auth Security](auth-security/index.md)
3. [Api Security](api-security/index.md)
4. [Webhook Security](webhook-security/index.md)
5. [Frontend Security](frontend-security/index.md)
6. [Secrets](secrets/index.md)

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
