# Oauth Provider

Purpose: Explains the OAuth 2.1 Provider and Continue with Qentrah flow.

## Scope

This folder owns small, focused documentation files for oauth provider.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Continue With Qentrah](continue-with-qentrah.md) | Continue with Qentrah is OAuth 2.1 Authorization Code plus PKCE. |
| [Authorization Code Pkce](authorization-code-pkce.md) | Only response_type=code is allowed. |
| [Consent Screen](consent-screen.md) | Show app name, owner organization, selected organization, requested scopes, offline access, and risk. |
| [Token Endpoints](token-endpoints.md) | Token endpoint exchanges code and verifier for access token. |
| [Client Registration](client-registration.md) | Developer apps register redirect URIs, allowed origins, webhook URLs, and requested scopes. |

## Read Order

1. [Continue With Qentrah](continue-with-qentrah.md)
2. [Authorization Code Pkce](authorization-code-pkce.md)
3. [Consent Screen](consent-screen.md)
4. [Token Endpoints](token-endpoints.md)
5. [Client Registration](client-registration.md)

## Related Domains

- [Auth](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
