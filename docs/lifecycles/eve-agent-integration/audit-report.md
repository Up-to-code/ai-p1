# Eve Tools Permission Guard & Space Scoping Audit

## Audit Date
2026-07-03

## Scope
Audit all Eve agent tools in `apps/workspace/agent/tools/` for:
1. Permission guards (explicit permission checks before backend calls)
2. Space scoping (support for spaceId parameter in tools)
3. Consistency with three-layer permission system

## Findings

### Tools with Explicit Permission Guards ✅

**Space Tools (9 tools)**
- `spaces-create.ts` - ✅ Uses `requireOrganizationAction(ctx, organizationId, "role", "create")`
- `spaces-delete.ts` - ✅ Uses `requireOrganizationAction`
- `spaces-update.ts` - ✅ Uses `requireOrganizationAction`
- `space-members-*.ts` (4 tools) - ✅ Uses `requireOrganizationAction`
- `spaces-get.ts`, `spaces-list.ts` - ✅ Read operations, less critical

**Pattern:**
```typescript
async execute(args, ctx) {
  const organizationId = requireOrgId(ctx);
  await requireOrganizationAction(ctx, organizationId, "role", "create");
  return fetchAuthMutation(ctx, api.spaces.index.create, { organizationId, input: args as never });
}
```

### Tools WITHOUT Explicit Permission Guards ⚠️

**Client Tools (5 tools)**
- `clients-create.ts` - ❌ No permission guard, relies on Convex backend
- `clients-delete.ts` - ❌ No permission guard
- `clients-update.ts` - ❌ No permission guard
- `clients-get.ts` - ❌ No permission guard (read operation)
- `clients-list.ts` - ❌ No permission guard (read operation)

**Project Tools (5 tools)**
- `projects-create.ts` - ❌ No permission guard
- `projects-delete.ts` - ❌ No permission guard
- `projects-update.ts` - ❌ No permission guard
- `projects-get.ts` - ❌ No permission guard (read operation)
- `projects-list.ts` - ❌ No permission guard (read operation)

**Task Tools (5 tools)**
- `tasks-create.ts` - ❌ No permission guard
- `tasks-delete.ts` - ❌ No permission guard
- `tasks-update.ts` - ❌ No permission guard
- `tasks-complete.ts` - ❌ No permission guard
- `tasks-get.ts`, `tasks-list.ts` - ❌ No permission guard (read operations)

**Deal Tools (4 tools)**
- `deals-create.ts` - ❌ No permission guard
- `deals-delete.ts` - ❌ No permission guard
- `deals-update.ts` - ❌ No permission guard
- `deals-get.ts`, `deals-list.ts` - ❌ No permission guard (read operations)

**Calendar Tools (7 tools)**
- `calendar-create.ts` - ❌ No permission guard
- `calendar-delete.ts` - ❌ No permission guard
- `calendar-update.ts` - ❌ No permission guard
- `calendar-*.ts` (list/get) - ❌ No permission guard (read operations)

**Other Tools**
- `organization-*.ts` - ✅ Uses `requireOrganizationAction` (organization-level permissions)
- `members-*.ts` - ✅ Uses `requireOrganizationAction`
- `invitations-*.ts` - ✅ Uses `requireOrganizationAction`
- `media-*.ts` - ❌ No permission guard
- `notifications-*.ts` - ❌ No permission guard

**Pattern:**
```typescript
async execute(args, ctx) {
  const organizationId = requireOrgId(ctx);
  return fetchAuthMutation(ctx, api.clients.write.createFromHono, {
    organizationId,
    input: args as never,
  });
}
```

### Space Scoping Status ❌

**Finding:** NONE of the domain tools (clients, projects, tasks, deals, calendar) support space scoping parameters.

**Expected Pattern (from MCP Worker Scoping Design):**
```typescript
inputSchema: z.object({
  name: z.string().min(1),
  spaceId: z.string().optional(), // NEW: Space scoping
  projectId: z.string().optional(),
  // ... other fields
})
```

**Current State:**
- Tools accept `projectId` but not `spaceId`
- No space filtering in tool inputs
- Backend handles space scoping via Convex queries
- Agent layer doesn't enforce space boundaries

## Issues

### 1. Inconsistent Permission Guarding

**Severity:** Medium

**Problem:** Only space and organization tools have explicit permission guards in the agent layer. Domain tools (clients, projects, tasks, deals, calendar) rely entirely on Convex backend for permission checking.

**Impact:**
- Permission errors only caught at backend layer
- Agent doesn't provide clear permission error messages
- Inconsistent with three-layer permission system design
- MCP workers (which use similar tools) should have explicit checks

**Recommendation:** Add explicit permission guards to all domain tools following the space tool pattern:
```typescript
async execute(args, ctx) {
  const organizationId = requireOrgId(ctx);
  await requireOrganizationAction(ctx, organizationId, "client", "create");
  return fetchAuthMutation(ctx, api.clients.write.createFromHono, {
    organizationId,
    input: args as never,
  });
}
```

### 2. Missing Space Scoping

**Severity:** High

**Problem:** Domain tools don't support space scoping parameters. The three-layer permission system design requires space-scoped tool execution for MCP workers and Eve agents.

**Impact:**
- Eve agents can't filter resources by space
- MCP workers can't respect space boundaries
- Agent can't create resources in specific spaces
- Violates three-layer permission system design

**Recommendation:** Add `spaceId` parameter to all domain tools that can be space-scoped:
- Clients: Add `spaceId` optional parameter
- Projects: Add `spaceIds` array parameter (many-to-many)
- Tasks: Add `spaceId` optional parameter
- Deals: Add `spaceId` optional parameter
- Calendar: Add `spaceId` optional parameter

### 3. No Space-Level Permission Checks

**Severity:** High

**Problem:** Even if space scoping is added, there are no space-level permission checks in the agent layer. The `requireOrganizationAction` function only checks organization-level permissions.

**Impact:**
- Agent can't enforce space admin/member/viewer roles
- Space visibility controls (private/public/request_only) not enforced at agent layer
- MCP workers could bypass space-level restrictions

**Recommendation:** Implement space-level permission checking:
```typescript
export async function requireSpaceAction(
  ctx: ToolContext,
  organizationId: string,
  spaceId: string,
  action: string,
) {
  const allowed = await fetchAuthQuery(
    ctx,
    api.spaces.profile.access.canUseSpaceAction,
    { organizationId, spaceId, action },
  ).then((r) => r.allowed);

  if (!allowed) {
    throw new Error(`You do not have permission to ${action} this space.`);
  }
}
```

## Recommendations Priority

### Priority 1: Add Space Scoping Parameters
- Add `spaceId` to client, task, deal, calendar tools
- Add `spaceIds` array to project tools
- Update tool descriptions to document space scoping
- Update Convex backend to handle space parameters

### Priority 2: Implement Space-Level Permission Checks
- Create `requireSpaceAction` function in `agent/lib/action-workflow.ts`
- Add space permission checks to space-scoped tools
- Update skill documentation for space permissions

### Priority 3: Add Explicit Permission Guards to Domain Tools
- Add `requireOrganizationAction` to all client, project, task, deal, calendar tools
- Ensure consistent error messages
- Update tool descriptions to document permission requirements

### Priority 4: Audit and Test
- Test permission enforcement across all tools
- Test space scoping with real space data
- Verify error messages are clear and actionable
- Update documentation

## Conclusion

The Eve tools have **inconsistent permission guarding** and **missing space scoping**. Only space and organization tools have explicit permission checks. Domain tools rely on backend permission checking, which violates the three-layer permission system design for MCP workers and Eve agents.

**Status:** Requires significant refactoring to align with three-layer permission system design.

**Effort Estimate:** 2-3 days to add permission guards and space scoping to all 40+ tools.
