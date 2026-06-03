# Files

- `apps/workspace/src/domains/organization/components/organization-screens.tsx`: UI entrypoint for members, role changes, invitations, and removal confirmations.
- `apps/workspace/src/domains/organization/api/workos-organization.ts`: browser API wrapper for organization action routes.
- `apps/workspace/src/server/domains/organization/routing/router.ts`: Hono route registration for organization membership actions.
- `apps/workspace/src/server/domains/organization/handlers/actions.ts`: HTTP handlers and JSON/error response boundary for membership actions.
- `apps/workspace/src/server/domains/organization/services/action-workflow.ts`: shared workflow Module for permission assertion, WorkOS list helpers, action execution, and audit writes.
- `apps/workspace/src/server/domains/organization/services/actions.ts`: orchestration for WorkOS calls, organization permission checks, policy checks, and audit writes.
- `apps/workspace/src/server/domains/organization/services/workos-organization-adapter.ts`: WorkOS Adapter for organization members, invitations, custom roles, and permission slugs.
- `apps/workspace/src/server/domains/organization/services/access-policy.ts`: Qentrah-specific member and role safety rules, including shared owner-retention policy for removals and role changes.
- `apps/workspace/src/packages/authz/permissions.ts`: Workspace organization role permission catalog.
- `apps/workspace/convex/organizations/profile/access.ts`: Convex WorkOS projection permission check used by Workspace server helpers.
- `apps/workspace/src/server/utils/organization/platform-admin.ts`: platform operator allowlist helper; should not gate ordinary organization member removal.
