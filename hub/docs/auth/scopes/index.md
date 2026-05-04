# Scopes

Purpose: Explains OAuth scopes and their mapping to hub permissions.

## Scope

This folder owns small, focused documentation files for scopes.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Scope Catalog](scope-catalog.md) | Required scopes include openid, profile, email, offline_access, organization.read, properties.read, properties.write, properties.sync, webhook.manage, integrations.manage, audit.read, and MCP scopes. |
| [Scope To Permission Map](scope-to-permission-map.md) | Scopes are coarse OAuth grants. |
| [High Risk Scopes](high-risk-scopes.md) | High-risk scopes include properties.write, properties.sync, properties.visibility.write, submissions.review, webhook.manage, integrations.manage, audit.read, and mcp.tools.call. |

## Read Order

1. [Scope Catalog](scope-catalog.md)
2. [Scope To Permission Map](scope-to-permission-map.md)
3. [High Risk Scopes](high-risk-scopes.md)

## Related Domains

- [Auth](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
