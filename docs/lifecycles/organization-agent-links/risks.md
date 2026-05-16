# Risks

- Agent links can grant broad delegated access. Keep the delegated-permission check before key creation.
- UI capability checks are convenience only; Convex permission checks remain the enforcement boundary.
- Removing platform-admin gates is correct for organization-owned links, but platform-only operational tools must stay separate.
- One-time secrets cannot be re-shown after modal close; failed list refresh can make the create result feel unsaved.

## Rollback

Restore platform-admin checks only if agent links are intentionally reclassified as operator-only, then remove or hide the organization settings UI from normal organization owners.
