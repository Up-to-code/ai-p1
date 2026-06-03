# Files

- `apps/workspace/src/domains/organization/components/organization-screens.tsx`: UI for organization settings tabs and capability-driven buttons.
- `apps/workspace/src/domains/organization/settings-view-model.ts`: Organization settings view-model Module for tab names, role templates, permission work areas, Agent/API key permission projections and toggle commands, role permission toggles, role labels, member/date formatting helpers, settings counts, Agent link buckets, and API key stats.
- `apps/workspace/src/domains/organization/organization-logo-view-model.ts`: Organization logo view-model Module for crop output size, cover layout, and crop position clamping.
- `apps/workspace/src/domains/organization/api/organization-request.ts`: browser organization request Module for route segment encoding, JSON request construction, and error fallback behavior.
- `apps/workspace/src/server/domains/organization/services/actions.ts`: Hono service orchestration for identity, email invitations, members, and work roles.
- `apps/workspace/src/server/domains/organization/services/update-profile.ts`: organization profile write bridge to Convex.
- `apps/workspace/src/server/domains/organization/services/invite-links.ts`: invite-link create/cancel/accept bridge to Convex.
- `apps/workspace/convex/organizations/profile/write.ts`: audited organization profile persistence.
- `apps/workspace/convex/organizations/inviteLinks/write.ts`: audited invite-link persistence and acceptance.
- `apps/workspace/src/server/domains/organization/services/workos-organization-adapter.ts`: WorkOS Adapter for organization identity, members, invitations, custom roles, and role permission slugs.
- `apps/workspace/convex/organizations/profile/access.ts`: WorkOS projection permission enforcement.
- `apps/workspace/src/packages/authz/permissions.ts`: organization role permission catalog.
- `apps/workspace/src/packages/authz/capabilities.ts`: shared capability snapshot map and pure role evaluator for settings UI access flags.
- `apps/workspace/src/server/utils/organization/access-checker.ts`: server bridge for Convex organization permission assertions and capability snapshots.
- `apps/workspace/src/server/domains/organization/handlers/actions.ts`: Hono capability handler and slow-load timing visibility.
- `apps/workspace/src/server/utils/organization/platform-admin.ts` and `apps/workspace/convex/platform/access.ts`: platform/operator helpers that should stay out of normal organization settings writes.
