# Risks

- If organization role permissions are too broad, admins may remove members they should not. Keep WorkOS `member:delete` permission slugs and Qentrah owner-safety checks together.
- If platform-admin checks are kept in this path, valid organization owners can be blocked by environment allowlist drift.
- If WorkOS role definitions change, Workspace capabilities and server authorization must remain aligned through the Convex projection.
- Audit recording failure currently happens after WorkOS removal; retry/compensation is not handled in this small fix.

## Rollback

Restore the platform-admin gate only if organization membership actions are intentionally reclassified as operator-only, then update UI capabilities and copy to avoid exposing impossible actions.
