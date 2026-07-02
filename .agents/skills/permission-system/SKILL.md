# Permission System Skill

## When to Use

Use this skill when working on any feature that involves:
- User access control and permissions
- Space or project scoping
- MCP worker creation or scoping
- Resource visibility (who can see what)
- Member management (adding/removing members from spaces/projects)
- Role-based access control (RBAC)

## Core Concepts

### Three-Layer Hierarchy

```
Organization (Top Level)
  └── Spaces (Departments/Functional Areas)
      └── Projects (Work Containers)
```

**Organization**: Top-level tenant. All data belongs to an organization.

**Space**: Grouping of projects within an organization. Represents departments (Marketing, Finance, Engineering). A project can belong to multiple spaces.

**Project**: Container for tasks, docs, calendar events, and team collaboration.

### Permission Inheritance

Permissions cascade downward:
- Organization Owner → Access to all spaces (as Space Admin) → Access to all projects
- Organization Admin → Access to public spaces → Access to projects based on membership
- Organization Member → Access to public spaces (viewer) → Access to projects via space/project membership

### Visibility Levels

**Spaces**: `private` (members only), `public` (all org members can view), `request_only` (discoverable, requires approval)

**Projects**: `private` (project members only), `space_members` (all members of linked spaces), `organization` (all org members)

### Many-to-Many Relationships

Projects can belong to multiple spaces. This enables:
- Cross-functional projects (e.g., "Q4 Launch" in Marketing + Sales + Product)
- Departmental oversight (e.g., Finance space sees all budget-related projects)

## Implementation Guidelines

### Backend (Convex)

**Always check permissions before:**
- Reading resources (filter by user's accessible scope)
- Creating resources (check if user has create permission)
- Updating resources (check if user has edit permission)
- Deleting resources (check if user has delete permission)

**Pattern for listing accessible resources:**
```typescript
export const listProjects = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const accessibleProjects = await getAccessibleProjects(ctx, args.userId);
    return accessibleProjects;
  },
});
```

**Pattern for creating resources with space association:**
```typescript
export const createProject = mutation({
  args: {
    name: v.string(),
    spaceIds: v.array(v.string()),
    // ... other fields
  },
  handler: async (ctx, args) => {
    // Validate user has permission to create in these spaces
    // Create project
    // Link to spaces via projectSpaces junction table
  },
});
```

### Frontend

**Use permission-aware hooks:**
```typescript
const { data: accessibleSpaces } = useQuery(api.spaces.listAccessible, { userId });
const { data: accessibleProjects } = useQuery(api.projects.listAccessible, { userId });
```

**Gate UI elements by permissions:**
```typescript
{canCreateSpace && <Button>Create Space</Button>}
```

**Handle permission errors gracefully:**
```typescript
try {
  await createProject(args);
} catch (error) {
  if (error.code === "PERMISSION_DENIED") {
    toast.error("You don't have permission to create a project in this space");
  }
}
```

## MCP Worker Scoping

### MCP Creation Rules

1. MCP workers must be explicitly scoped during creation
2. Scope types: `organization`, `space`, `project`
3. MCP permissions are derived from creator's permissions at time of creation
4. MCP cannot have more permissions than the creator
5. MCP scope is automatically updated if creator loses access

### MCP Scope Selection UI

When creating MCP workers:
- Show only spaces/projects the user has admin or member access to
- Display user's role in each space/project
- Allow filtering by space for project selection
- Show scope summary before confirmation

### MCP Tool Execution

Always filter MCP tool results by scope:
```typescript
function filterMcpResults(results: any[], mcpScope: McpScope): any[] {
  if (mcpScope.type === "organization") return results;
  if (mcpScope.type === "space") {
    return results.filter(item => item.spaceId && mcpScope.spaceIds.includes(item.spaceId));
  }
  if (mcpScope.type === "project") {
    return results.filter(item => item.projectId && mcpScope.projectIds.includes(item.projectId));
  }
  return [];
}
```

## Common Anti-Patterns to Avoid

### ❌ Don't filter permissions on the client only

```typescript
// Bad: List all resources, filter in frontend
const allProjects = await getAllProjects();
const accessible = allProjects.filter(p => userCanAccess(p));
```

### ✅ Do filter on the server

```typescript
// Good: Query only accessible resources
const accessibleProjects = await getAccessibleProjects(userId);
```

### ❌ Don't create resources without space validation

```typescript
// Bad: Create project without space validation
await createProject({ name, organizationId });
```

### ✅ Do validate space access before creation

```typescript
// Good: Validate space access before creation
const canCreate = await canCreateProjectInSpace(userId, spaceId);
if (!canCreate) throw new Error("PERMISSION_DENIED");
await createProject({ name, spaceIds: [spaceId], organizationId });
```

## Schema Changes Required

### New Tables

1. **spaces** - Organization-level spaces
   - `organizationId`, `name`, `description`, `icon`, `color`, `slug`
   - `visibility` (private/public/request_only)
   - `defaultProjectVisibility`

2. **spaceMembers** - Space membership
   - `organizationId`, `spaceId`, `userId`, `role` (admin/member/viewer)

3. **projectSpaces** (junction table) - Many-to-many relationship
   - `organizationId`, `projectId`, `spaceId`, `isPrimary`

### Modified Tables

1. **projects** - Add `spaceIds` array field

## Testing

### Unit Tests

Test permission logic:
```typescript
describe("Space Permissions", () => {
  it("should allow space admin to create projects", async () => {
    const spaceAdmin = await createSpaceAdmin();
    const canCreate = await canCreateProjectInSpace(spaceAdmin.id, spaceId);
    expect(canCreate).toBe(true);
  });
});
```

### Integration Tests

Test MCP scoping:
```typescript
describe("MCP Scoping", () => {
  it("should filter results by MCP scope", async () => {
    const mcp = await createMcpWithScope({ type: "space", spaceIds: [spaceId] });
    const results = await executeMcpTool(mcp.id, "projects_list");
    expect(results.every(p => p.spaceId === spaceId)).toBe(true);
  });
});
```

## Security Checklist

Before implementing any permission-related feature:

- [ ] Server-side permission validation (never trust client)
- [ ] Default deny (no access unless explicitly granted)
- [ ] Audit logging for permission changes
- [ ] Scope validation on every MCP tool execution
- [ ] No permission escalation (MCP ≤ creator permissions)
- [ ] Proper cascading deletes (space delete ≠ project delete)
- [ ] Role constraints (can't remove last admin without replacement)

## References

- **Design Document**: `docs/decisions/three-layer-permission-system.md`
- **Permission Rules**: `docs/decisions/permission-rules-specification.md`
- **MCP Scoping**: `docs/decisions/mcp-worker-scoping-design.md`
- **Agent Guide**: `docs/agents/permission-system-guide.md`
- **Schema**: `convex/schema/domains.ts`
- **MCP Tool Registry**: `convex/mcp/toolRegistry.ts`
