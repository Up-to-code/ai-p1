# Agent Permission System Guide

## Overview

This guide explains the three-layer permission system (Organization → Space → Project) for agents working on the Qentrah codebase. Understanding this system is critical for implementing features that respect access controls and user permissions.

## Core Concepts

### Three-Layer Hierarchy

```
Organization (Top Level)
  └── Spaces (Departments/Functional Areas)
      └── Projects (Work Containers)
```

**Organization**: The top-level tenant. All data belongs to an organization.

**Space**: A grouping of projects within an organization. Spaces represent departments (Marketing, Finance, Engineering) or functional areas. A project can belong to multiple spaces.

**Project**: A container for tasks, docs, calendar events, and team collaboration.

### Key Principles

1. **Explicit Scoping**: Users only have access to resources they've been explicitly granted access to
2. **Permission Inheritance**: Permissions cascade downward (Org Owner → Space Admin → Project Admin)
3. **Visibility Controls**: Each layer has visibility settings that control who can see resources
4. **MCP Boundaries**: MCP workers respect space/project boundaries through explicit scoping

## Permission Layers

### Layer 1: Organization

**Roles**: `owner`, `admin`, `member`

**Owner**: Full administrative control over the entire organization. Can manage members, roles, spaces, and all resources.

**Admin**: Can manage most resources but cannot delete the organization or remove owners.

**Member**: Standard user with limited permissions. Access to resources depends on space/project membership.

### Layer 2: Space

**Roles**: `admin`, `member`, `viewer`

**Visibility**: `private`, `public`, `request_only`

**Space Admin**: Can manage the space, add/remove members, create projects within the space.

**Space Member**: Can participate in the space, create projects (if allowed), edit space resources.

**Space Viewer**: Read-only access to the space and its projects.

**Visibility Levels**:
- `private`: Only explicitly added members can access
- `public`: All organization members can view, join to participate
- `request_only`: All org members can discover, must request to join

### Layer 3: Project

**Roles**: `admin`, `member`, `viewer`

**Visibility**: `private`, `space_members`, `organization`

**Project Admin**: Can manage the project, add/remove members, link/unlink spaces.

**Project Member**: Can edit project content (tasks, docs, calendar).

**Project Viewer**: Read-only access to the project.

**Visibility Levels**:
- `private`: Only project members
- `space_members`: All members of linked spaces
- `organization`: All organization members

## Permission Inheritance

### Access Cascade

```
Organization Owner
  → Access to all spaces (as Space Admin)
    → Access to all projects in those spaces (as Project Admin)

Organization Admin
  → Access to public spaces (as Space Member)
  → Access to private spaces only if explicitly added
    → Access to projects based on space membership

Organization Member
  → Access to public spaces (as Space Viewer)
  → Access to private spaces only if explicitly added
    → Access to projects based on:
      - Direct project membership
      - Space membership (if project visibility = space_members)
      - Organization membership (if project visibility = organization)
```

### Many-to-Many Relationships

A project can belong to multiple spaces, and a space can contain multiple projects. This enables:
- Cross-functional projects (e.g., "Q4 Launch" in Marketing + Sales + Product spaces)
- Departmental oversight (e.g., Finance space sees all budget-related projects)

## Implementation Guidelines for Agents

### When Working with Resources

**Always check permissions before:**
- Reading resources (filter by user's accessible scope)
- Creating resources (check if user has create permission)
- Updating resources (check if user has edit permission)
- Deleting resources (check if user has delete permission)

### Backend (Convex) Implementation

**Use permission checking utilities:**

```typescript
// Check if user can access a resource
function canAccessResource(userId: string, resource: Resource, action: Action): boolean {
  // Implementation in convex/permissions/
}
```

**Filter query results by scope:**

```typescript
// When listing projects, only return accessible ones
export const listProjects = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const accessibleProjects = await getAccessibleProjects(ctx, args.userId);
    return accessibleProjects;
  },
});
```

**Add space/project to mutations:**

```typescript
// When creating a project, associate with spaces
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

### Frontend Implementation

**Show only accessible resources:**

```typescript
// Use hooks that respect permissions
const { data: accessibleSpaces } = useQuery(api.spaces.listAccessible, { userId });
const { data: accessibleProjects } = useQuery(api.projects.listAccessible, { userId });
```

**Gate UI elements by permissions:**

```typescript
// Only show "Create Space" button if user has permission
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

### MCP Creation Flow

When creating an MCP worker in member settings:

1. **Scope Selection**: User selects scope type (organization/space/project)
2. **Resource Selection**: User selects specific spaces/projects they have access to
3. **Permission Derivation**: MCP inherits user's permissions at selected scope
4. **Scope Boundaries**: MCP cannot access resources outside designated scope

### MCP Permission Rules

- MCP workers are explicitly scoped during creation
- MCP permissions are derived from creator's permissions at time of creation
- MCP cannot have more permissions than the creator
- MCP scope is automatically updated if creator loses access
- All MCP scope changes are logged for audit

### Implementing MCP Scoping

**Add scope to MCP configuration:**

```typescript
{
  scope: {
    type: "space" | "project" | "organization";
    spaceIds?: string[];
    projectIds?: string[];
  }
}
```

**Filter MCP tool results by scope:**

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

## Common Patterns

### Pattern 1: List Accessible Resources

```typescript
// Bad: List all resources, filter in frontend
const allProjects = await getAllProjects();
const accessible = allProjects.filter(p => userCanAccess(p));

// Good: Query only accessible resources
const accessibleProjects = await getAccessibleProjects(userId);
```

### Pattern 2: Create Resource in Space

```typescript
// Bad: Create project without space validation
await createProject({ name, organizationId });

// Good: Validate space access before creation
const canCreate = await canCreateProjectInSpace(userId, spaceId);
if (!canCreate) throw new Error("PERMISSION_DENIED");
await createProject({ name, spaceIds: [spaceId], organizationId });
```

### Pattern 3: Cross-Space Projects

```typescript
// Good: Allow multiple spaces
await createProject({
  name: "Q4 Launch",
  spaceIds: [marketingSpaceId, salesSpaceId, productSpaceId],
  organizationId,
});
```

## Testing Permissions

### Unit Tests

```typescript
describe("Space Permissions", () => {
  it("should allow space admin to create projects", async () => {
    const spaceAdmin = await createSpaceAdmin();
    const canCreate = await canCreateProjectInSpace(spaceAdmin.id, spaceId);
    expect(canCreate).toBe(true);
  });

  it("should deny space viewer from creating projects", async () => {
    const spaceViewer = await createSpaceViewer();
    const canCreate = await canCreateProjectInSpace(spaceViewer.id, spaceId);
    expect(canCreate).toBe(false);
  });
});
```

### Integration Tests

```typescript
describe("MCP Scoping", () => {
  it("should filter results by MCP scope", async () => {
    const mcp = await createMcpWithScope({ type: "space", spaceIds: [spaceId] });
    const results = await executeMcpTool(mcp.id, "projects_list");
    expect(results.every(p => p.spaceId === spaceId)).toBe(true);
  });
});
## Security Considerations

1. **Default Deny**: Users have no access unless explicitly granted
2. **Server-Side Validation**: Always check permissions on the server, never trust client
3. **Audit Trail**: Log all permission changes for compliance
4. **Scope Validation**: Validate MCP scope on every tool execution
5. **No Escalation**: MCP cannot have more permissions than creator
6. **Cascading Deletes**: Deleting a space should not delete projects (just dissociate)

## References

- **Design Document**: `docs/decisions/three-layer-permission-system.md`
- **Permission Rules**: `docs/decisions/permission-rules-specification.md`
- **MCP Scoping**: `docs/decisions/mcp-worker-scoping-design.md`
- **Schema**: `convex/schema/domains.ts`
- **MCP Tool Registry**: `convex/mcp/toolRegistry.ts`
