# Oauth

Purpose: Explains SDK OAuth helpers and token behavior.

## Scope

This folder owns small, focused documentation files for oauth.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Oauth Client](oauth-client.md) | SDK OAuth client builds authorization URL and manages popup or redirect flow. |
| [Popup Flow](popup-flow.md) | Popup opens centered authorization window. |
| [Pkce](pkce.md) | Generate high-entropy verifier. |
| [Token Store](token-store.md) | Browser token store is transient by default. |

## Read Order

1. [Oauth Client](oauth-client.md)
2. [Popup Flow](popup-flow.md)
3. [Pkce](pkce.md)
4. [Token Store](token-store.md)

## Related Domains

- [Sdk](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
