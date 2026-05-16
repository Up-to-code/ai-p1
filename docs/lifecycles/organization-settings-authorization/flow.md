# Flow

## Organization Settings Write

1. UI loads organization capabilities from `/api/v1/organizations/:organizationId/capabilities`.
2. Hono calls one authenticated Convex capability snapshot query instead of faning out one query per permission.
3. Convex authenticates the user once, reads the organization member role and dynamic role records, evaluates Qentrah capability flags locally, and adds platform-admin-only flags from the platform email allowlist.
4. UI enables controls based on organization permission capabilities.
5. User submits a profile, invitation, member, role, invite-link, API-key, or agent-link action.
6. Hono validates route params and request body.
7. Service/Convex write code still checks Better Auth organization permission for the requested resource/action.
8. Domain policy checks run where needed, such as last-owner and built-in-role protections.
9. Better Auth or Convex persists the organization-owned change.
10. Convex records an organization audit event.
11. UI invalidates relevant queries and shows success/error toast.

## Previous Slow Capability Flow

The old capability endpoint performed roughly one authenticated Convex query for every UI capability plus a platform-admin query. Each query recreated the Better Auth permission API path, which caused repeated Better Auth warnings and multi-second settings loads.

## Source Of Truth

- Better Auth: organization membership, roles, and permission decisions.
- Workspace Convex: Qentrah organization profile, invite links, API keys, agent links, and audit events.
- Platform admin allowlist: internal operator/admin actions only.
