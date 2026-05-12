# Credentials

Purpose: Explains tokens, client secrets, and API keys.

## Scope

This folder owns small, focused documentation files for credentials.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Token Handling](token-handling.md) | Access tokens are short-lived. |
| [Client Secrets](client-secrets.md) | Client secrets are confidential-client only. |
| [Api Keys](api-keys.md) | API keys are secondary to OAuth. |

## Read Order

1. [Token Handling](token-handling.md)
2. [Client Secrets](client-secrets.md)
3. [Api Keys](api-keys.md)

## Related Domains

- [Auth](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
