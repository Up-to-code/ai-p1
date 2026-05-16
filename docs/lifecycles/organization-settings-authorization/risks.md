# Risks

- Removing platform-admin gates is correct for organization-owned settings, but it increases reliance on Better Auth role permissions being accurate.
- Custom roles with broad permissions can manage sensitive settings; keep UI and Convex permission checks aligned.
- Some settings create secrets or one-time links; failed refresh after creation can feel like a failed save even when the secret was created.
- Platform-only admin routes must remain separate from organization routes.
- Stale Convex deployments can keep old authorization behavior active if unrelated schema validation fails during function preparation.
- The capability snapshot is an optimization for UI state only; write/read enforcement must continue using assertive permission checks at the action route or Convex mutation boundary.
- Dynamic Better Auth role permissions are JSON strings; invalid custom role permission JSON must deny that dynamic override instead of granting access.

## Rollback

Rollback by reintroducing platform-admin gates only for actions intentionally reclassified as operator-only, then hide those controls from normal organization users.
