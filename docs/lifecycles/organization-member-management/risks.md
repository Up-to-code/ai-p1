# Risks

- If organization role permissions are too broad, admins may remove members they should not. Keep Better Auth `member:delete` permission and Qentrah owner-safety checks together.
- If platform-admin checks are kept in this path, valid organization owners can be blocked by environment allowlist drift.
- If Better Auth role definitions change, Workspace capabilities and server authorization must remain aligned.
- Audit recording failure currently happens after Better Auth removal; retry/compensation is not handled in this small fix.

## Rollback

Restore the platform-admin gate only if organization membership actions are intentionally reclassified as operator-only, then update UI capabilities and copy to avoid exposing impossible actions.
