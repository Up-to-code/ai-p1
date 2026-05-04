# Threat Model

Purpose: Explains actors, attack surfaces, and mitigations.

## Scope

This folder owns small, focused documentation files for threat model.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Actors](actors.md) | Actors include platform admin, publisher, integration partner, auditor, legal observer, external attacker, compromised client, and internal support user. |
| [Attack Surfaces](attack-surfaces.md) | Surfaces include OAuth, ingestion APIs, webhooks, admin UI, documents, exports, and SDK callbacks. |
| [Mitigations](mitigations.md) | Mitigations include PKCE, rate limiting, Zod, redaction, trusted URL validation, HMAC webhooks, and audit logs. |

## Read Order

1. [Actors](actors.md)
2. [Attack Surfaces](attack-surfaces.md)
3. [Mitigations](mitigations.md)

## Related Domains

- [Security](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
