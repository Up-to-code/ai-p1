# Permissions System

The agent's permission model flows through three layers:

1. **Clerk Auth (Channel)** — validates the user's session and extracts `organizationId` + `userId` from the request. The `clerkAuth` handler in `agent/channels/auth.ts` sets these into Eve's `SessionAuthContext.attributes`.

2. **Organization Capabilities (Convex)** — for every action, the tool calls `requireOrganizationAction(ctx, orgId, resource, action)` which queries `api.organizations.profile.access.canUseResourceAction`. This Convex query checks the user's role against the organization's permission statement.

3. **Access Policy (Local)** — for sensitive operations (member removal, role deletion), additional policy checks from `agent/lib/access-policy.ts` verify business rules:
   - Cannot remove last owner
   - Cannot self-remove
   - Cannot modify built-in roles
   - Cannot delete a role that is in use

## Permission Check Pattern

Every tool that modifies data must call `requireOrganizationAction` before performing the operation:

```ts
import { requireOrganizationAction } from "../lib/action-workflow";

const orgId = requireOrgId(ctx);
await requireOrganizationAction(ctx, orgId, "client", "update");
// ... perform update
```

## Read-Only Tools

Read-only tools (list, get) trust the Eve channel auth for session validation. The Convex query or mutation itself performs its own auth check via `organizationId`.
