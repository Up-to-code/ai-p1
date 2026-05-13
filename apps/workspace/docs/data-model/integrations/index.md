# Integrations

Purpose: Explains connected platforms, OAuth clients, webhook endpoints, and API key records.

## Scope

This folder owns small, focused documentation files for integrations.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Connected Platform](connected-platform.md) | Connected platform represents external CRM, app, marketplace, workspace, or partner system. |
| [Oauth Client Profile](oauth-client-profile.md) | OAuth client profile stores workspace approval state for Better Auth OAuth client. |
| [Webhook Endpoint](webhook-endpoint.md) | Webhook endpoint stores URL, status, signing configuration reference, last test, and approval state. |
| [Api Key Record](api-key-record.md) | API key record stores hash, prefix, scopes, status, organization, platform, expiry, and audit metadata. |

## Read Order

1. [Connected Platform](connected-platform.md)
2. [Oauth Client Profile](oauth-client-profile.md)
3. [Webhook Endpoint](webhook-endpoint.md)
4. [Api Key Record](api-key-record.md)

## Related Domains

- [Data Model](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
