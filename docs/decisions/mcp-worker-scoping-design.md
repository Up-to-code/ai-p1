# MCP Worker Scoping and Creation Flow

## Overview

This document describes the design for MCP (Model Context Protocol) worker scoping, ensuring that MCP workers respect the three-layer permission system (Organization → Space → Project). MCP workers should only have access to resources that their creator has access to, and this access should be explicitly scoped during creation.

## Current State

The current MCP system:
- Has role-based permissions at the organization level (owner, admin, member)
- MCP workers inherit permissions based on their connection's role
- No space or project-level scoping
- All MCP workers with the same role have identical access

## New Design Principles

1. **Explicit Scoping**: MCP workers must be explicitly scoped to specific spaces/projects during creation
2. **Permission Derivation**: MCP worker permissions are derived from the creator's permissions at the time of creation
3. **Scope Boundaries**: MCP workers cannot access resources outside their designated scope
4. **Dynamic Visibility**: MCP creation UI only shows spaces/projects the user can access
5. **Audit Trail**: All MCP scope changes are logged

## MCP Creation Flow

### Step 1: Access MCP Creation

**Location**: Member Settings → MCP Workers → Create New MCP

**Prerequisites**:
- User must be logged in
- User must have organization membership
- User must have permission to create MCP workers (org admin or space admin)

### Step 2: Scope Selection UI

The MCP creation wizard presents a multi-step scope selection:

#### Step 2a: Choose Scope Type

```
┌─────────────────────────────────────────┐
│  Select MCP Scope                        │
├─────────────────────────────────────────┤
│  ○ Organization                         │
│    Access all resources in organization │
│                                          │
│  ○ Space                                 │
│    Access specific spaces               │
│                                          │
│  ○ Project                               │
│    Access specific projects             │
└─────────────────────────────────────────┘
```

#### Step 2b: Select Spaces (if Space scope chosen)

```
┌─────────────────────────────────────────┐
│  Select Spaces                           │
├─────────────────────────────────────────┤
│  Available Spaces (3)                    │
│                                          │
│  ☑ Marketing                             │
│     Space Admin • 12 projects           │
│                                          │
│  ☑ Sales                                 │
│     Space Member • 8 projects            │
│                                          │
│  ☐ Finance                               │
│     (No access)                          │
│                                          │
│  ☐ Engineering                           │
│     Space Viewer • 15 projects          │
└─────────────────────────────────────────┘
```

**Rules**:
- Only show spaces where user has admin or member access
- Show user's role in each space
- Show project count for context
- Viewer-only spaces are not selectable (read-only MCP not useful)

#### Step 2c: Select Projects (if Project scope chosen)

```
┌─────────────────────────────────────────┐
│  Select Projects                         │
├─────────────────────────────────────────┤
│  Filter by Space: [All Spaces ▼]         │
│                                          │
│  ☑ Q4 Marketing Campaign                 │
│     Marketing • Project Admin            │
│                                          │
│  ☑ Website Redesign                      │
│     Marketing • Project Member           │
│                                          │
│  ☐ Sales Q1 Forecast                     │
│     Sales • (No access)                  │
│                                          │
│  ☐ Budget Planning                       │
│     Finance • Project Viewer             │
└─────────────────────────────────────────┘
```

**Rules**:
- Only show projects where user has admin or member access
- Group by space for organization
- Show user's role in each project
- Allow filtering by space
- Viewer-only projects are not selectable

#### Step 2d: Review Scope Summary

```
┌─────────────────────────────────────────┐
│  Scope Summary                           │
├─────────────────────────────────────────┤
│  Scope Type: Space                       │
│                                          │
│  Selected Spaces (2):                    │
│  • Marketing (Space Admin)              │
│  • Sales (Space Member)                 │
│                                          │
│  This MCP will have access to:           │
│  • 20 projects across 2 spaces          │
│  • All tasks, docs, calendar in those    │
│  • Client and deal data in those spaces  │
│                                          │
│  The MCP will NOT have access to:       │
│  • Finance space                         │
│  • Engineering space                    │
│  • Organization settings                 │
└─────────────────────────────────────────┘
```

### Step 3: MCP Configuration

Standard MCP configuration (name, description, model, etc.) with scope summary displayed:

```
┌─────────────────────────────────────────┐
│  MCP Configuration                       │
├─────────────────────────────────────────┤
│  Name: [Marketing Assistant            ] │
│  Description: [Helps with marketing     ] │
│              [projects and campaigns     ] │
│                                          │
│  Model: [GPT-4 ▼]                        │
│                                          │
│  ─────────────────────────────────────  │
│  Scope: Space (Marketing, Sales)        │
│  ─────────────────────────────────────  │
│                                          │
│  [Cancel]  [Create MCP]                  │
└─────────────────────────────────────────┘
```

## Schema Changes

### New Table: `mcpWorkers`

```typescript
{
  organizationId: string;
  name: string;
  description?: string;
  model: string;
  createdByUserId: string;
  scope: {
    type: "organization" | "space" | "project";
    spaceIds?: string[]; // If space-scoped
    projectIds?: string[]; // If project-scoped
  };
  permissions: McpPermission[]; // Derived permissions
  status: "active" | "inactive" | "deleted";
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}
```

### New Table: `mcpPermissionAudit`

```typescript
{
  organizationId: string;
  mcpWorkerId: string;
  actorUserId: string;
  action: "create" | "update_scope" | "delete";
  oldScope?: any;
  newScope?: any;
  oldPermissions?: McpPermission[];
  newPermissions?: McpPermission[];
  timestamp: number;
}
```

## Permission Derivation Logic

### Derive Permissions from User Access

```typescript
function deriveMcpPermissions(
  userId: string,
  scope: McpScope,
  organizationId: string
): McpPermission[] {
  const permissions: McpPermission[] = [];

  if (scope.type === "organization") {
    // Get user's organization role
    const orgMembership = getOrganizationMembership(userId, organizationId);
    const orgPermissions = getOrgPermissions(orgMembership.role);
    permissions.push(...orgPermissions);
  }

  if (scope.type === "space") {
    // For each space, get user's space role and derive permissions
    for (const spaceId of scope.spaceIds) {
      const spaceMembership = getSpaceMembership(userId, spaceId);
      if (spaceMembership) {
        const spacePermissions = getSpacePermissions(
          spaceMembership.role,
          spaceId
        );
        permissions.push(...spacePermissions);
      }
    }
  }

  if (scope.type === "project") {
    // For each project, get user's project role and derive permissions
    for (const projectId of scope.projectIds) {
      const projectMembership = getProjectMembership(userId, projectId);
      if (projectMembership) {
        const projectPermissions = getProjectPermissions(
          projectMembership.role,
          projectId
        );
        permissions.push(...projectPermissions);
      }
    }
  }

  return deduplicatePermissions(permissions);
}

function deduplicatePermissions(permissions: McpPermission[]): McpPermission[] {
  // Merge permissions by resource, keeping the union of actions
  const byResource = new Map<string, Set<string>>();

  for (const perm of permissions) {
    if (!byResource.has(perm.resource)) {
      byResource.set(perm.resource, new Set());
    }
    const actions = byResource.get(perm.resource)!;
    perm.actions.forEach(action => actions.add(action));
  }

  return Array.from(byResource.entries()).map(([resource, actions]) => ({
    resource: resource as McpResource,
    actions: Array.from(actions) as McpAction[],
  }));
}
```

### Space Permission Mapping

```typescript
function getSpacePermissions(role: string, spaceId: string): McpPermission[] {
  const basePermissions: McpPermission[] = [
    { resource: "space", actions: ["read"] },
  ];

  if (role === "admin") {
    return [
      ...basePermissions,
      { resource: "space", actions: ["update"] },
      { resource: "project", actions: ["create", "read", "update", "delete"] },
      { resource: "client", actions: ["create", "read", "update", "delete"] },
      { resource: "deal", actions: ["create", "read", "update", "delete"] },
      { resource: "task", actions: ["create", "read", "update", "delete"] },
      { resource: "calendar", actions: ["create", "read", "update", "delete"] },
      { resource: "media", actions: ["create", "read", "update", "delete"] },
    ];
  }

  if (role === "member") {
    return [
      ...basePermissions,
      { resource: "project", actions: ["create", "read", "update"] },
      { resource: "client", actions: ["create", "read", "update"] },
      { resource: "deal", actions: ["create", "read", "update"] },
      { resource: "task", actions: ["create", "read", "update", "delete"] },
      { resource: "calendar", actions: ["create", "read", "update", "delete"] },
      { resource: "media", actions: ["create", "read", "update", "delete"] },
    ];
  }

  // viewer
  return [
    ...basePermissions,
    { resource: "project", actions: ["read"] },
    { resource: "client", actions: ["read"] },
    { resource: "deal", actions: ["read"] },
    { resource: "task", actions: ["read"] },
    { resource: "calendar", actions: ["read"] },
    { resource: "media", actions: ["read"] },
  ];
}
```

### Project Permission Mapping

```typescript
function getProjectPermissions(role: string, projectId: string): McpPermission[] {
  const basePermissions: McpPermission[] = [
    { resource: "project", actions: ["read"] },
  ];

  if (role === "admin") {
    return [
      ...basePermissions,
      { resource: "project", actions: ["update", "delete"] },
      { resource: "task", actions: ["create", "read", "update", "delete"] },
      { resource: "calendar", actions: ["create", "read", "update", "delete"] },
      { resource: "media", actions: ["create", "read", "update", "delete"] },
    ];
  }

  if (role === "member") {
    return [
      ...basePermissions,
      { resource: "project", actions: ["update"] },
      { resource: "task", actions: ["create", "read", "update", "delete"] },
      { resource: "calendar", actions: ["create", "read", "update", "delete"] },
      { resource: "media", actions: ["create", "read", "update", "delete"] },
    ];
  }

  // viewer
  return [
    ...basePermissions,
    { resource: "task", actions: ["read"] },
    { resource: "calendar", actions: ["read"] },
    { resource: "media", actions: ["read"] },
  ];
}
```

## MCP Tool Execution with Scoping

### Tool Request Interception

When an MCP tool is called, the system must:

1. **Validate Scope**: Check if the tool request is within the MCP's scope
2. **Filter Results**: If listing resources, filter to scoped resources only
3. **Enforce Permissions**: Check if the MCP has permission for the specific action

```typescript
async function executeMcpTool(
  mcpWorkerId: string,
  toolName: string,
  args: any
): Promise<any> {
  const mcpWorker = await getMcpWorker(mcpWorkerId);
  const tool = getTool(toolName);

  // Check if MCP has permission for this tool
  if (!hasMcpPermission(mcpWorker.permissions, tool.resource, tool.action)) {
    throw new Error("MCP does not have permission for this action");
  }

  // Execute tool
  let result = await tool.execute(args);

  // Filter results based on scope
  if (shouldFilterResults(toolName)) {
    result = filterResultsByScope(result, mcpWorker.scope);
  }

  return result;
}

function filterResultsByScope(results: any[], scope: McpScope): any[] {
  if (scope.type === "organization") {
    return results; // No filtering needed
  }

  if (scope.type === "space") {
    return results.filter(item =>
      item.spaceId && scope.spaceIds.includes(item.spaceId)
    );
  }

  if (scope.type === "project") {
    return results.filter(item =>
      item.projectId && scope.projectIds.includes(item.projectId)
    );
  }

  return [];
}
```

### Updated MCP Tool Registry

Add space-level resources to the tool registry:

```typescript
type McpPermissionResource =
  | "organization"
  | "member"
  | "role"
  | "space" // NEW
  | "client"
  | "project"
  | "deal"
  | "calendar"
  | "task"
  | "media";

// New space-specific tools
const spaceTools = [
  tool({
    name: "spaces_list",
    title: "List spaces",
    description: "List spaces accessible to this MCP based on its scope",
    resource: "space",
    action: "read",
    adapters: both,
  }),
  tool({
    name: "spaces_get",
    title: "Get space",
    description: "Get details of a specific space within MCP's scope",
    resource: "space",
    action: "read",
    adapters: both,
  }),
  tool({
    name: "space_members_list",
    title: "List space members",
    description: "List members of a space within MCP's scope",
    resource: "space",
    action: "read",
    adapters: both,
  }),
];
```

## MCP Scope Updates

### Updating MCP Scope

Users can update an MCP's scope if they have permission:

**Prerequisites**:
- User must be the MCP creator or org admin
- User must have access to the new scope (spaces/projects)

**Flow**:
1. Navigate to MCP settings
2. Click "Update Scope"
3. Go through scope selection wizard (same as creation)
4. Review changes
5. Confirm update

**Audit Logging**:
```typescript
await logMcpPermissionChange({
  organizationId,
  mcpWorkerId,
  actorUserId: currentUser.id,
  action: "update_scope",
  oldScope: mcpWorker.scope,
  newScope: newScope,
  oldPermissions: mcpWorker.permissions,
  newPermissions: newPermissions,
  timestamp: Date.now(),
});
```

### MCP Scope Invalidation

If a user loses access to a space/project:

1. **Automatic Scope Update**: MCP scope is automatically updated to remove inaccessible resources
2. **Notification**: MCP creator is notified of scope change
3. **Graceful Degradation**: MCP continues to function with reduced scope

```typescript
async function validateAndUpdateMcpScopes(userId: string) {
  const mcps = await getMcpWorkersByCreator(userId);

  for (const mcp of mcps) {
    let scopeChanged = false;

    if (mcp.scope.type === "space") {
      const accessibleSpaceIds = await getAccessibleSpaceIds(userId);
      const newSpaceIds = mcp.scope.spaceIds.filter(id =>
        accessibleSpaceIds.includes(id)
      );

      if (newSpaceIds.length !== mcp.scope.spaceIds.length) {
        mcp.scope.spaceIds = newSpaceIds;
        mcp.permissions = deriveMcpPermissions(userId, mcp.scope, mcp.organizationId);
        scopeChanged = true;
      }
    }

    if (mcp.scope.type === "project") {
      const accessibleProjectIds = await getAccessibleProjectIds(userId);
      const newProjectIds = mcp.scope.projectIds.filter(id =>
        accessibleProjectIds.includes(id)
      );

      if (newProjectIds.length !== mcp.scope.projectIds.length) {
        mcp.scope.projectIds = newProjectIds;
        mcp.permissions = deriveMcpPermissions(userId, mcp.scope, mcp.organizationId);
        scopeChanged = true;
      }
    }

    if (scopeChanged) {
      await updateMcpWorker(mcp._id, mcp);
      await notifyMcpScopeChange(mcp._id, userId);
    }
  }
}
```

## UI Components

### MCP Scope Selector Component

```typescript
interface McpScopeSelectorProps {
  userId: string;
  organizationId: string;
  onScopeChange: (scope: McpScope) => void;
}

function McpScopeSelector({ userId, organizationId, onScopeChange }: McpScopeSelectorProps) {
  const [scopeType, setScopeType] = useState<"organization" | "space" | "project">("space");
  const [selectedSpaceIds, setSelectedSpaceIds] = useState<string[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  const { data: accessibleSpaces } = useQuery(api.spaces.listAccessible, { userId, organizationId });
  const { data: accessibleProjects } = useQuery(api.projects.listAccessible, { userId, organizationId });

  const handleScopeTypeChange = (type: "organization" | "space" | "project") => {
    setScopeType(type);
    setSelectedSpaceIds([]);
    setSelectedProjectIds([]);
  };

  const handleConfirm = () => {
    const scope: McpScope = {
      type: scopeType,
      ...(scopeType === "space" && { spaceIds: selectedSpaceIds }),
      ...(scopeType === "project" && { projectIds: selectedProjectIds }),
    };
    onScopeChange(scope);
  };

  return (
    <div className="mcp-scope-selector">
      <ScopeTypeSelector value={scopeType} onChange={handleScopeTypeChange} />

      {scopeType === "space" && (
        <SpaceSelector
          spaces={accessibleSpaces}
          selectedIds={selectedSpaceIds}
          onChange={setSelectedSpaceIds}
        />
      )}

      {scopeType === "project" && (
        <ProjectSelector
          projects={accessibleProjects}
          selectedIds={selectedProjectIds}
          onChange={setSelectedProjectIds}
        />
      )}

      <ScopeSummary scope={{ type: scopeType, spaceIds: selectedSpaceIds, projectIds: selectedProjectIds }} />

      <Button onClick={handleConfirm}>Confirm Scope</Button>
    </div>
  );
}
```

## Implementation Checklist

### Backend
- [ ] Create `mcpWorkers` table in Convex schema
- [ ] Create `mcpPermissionAudit` table in Convex schema
- [ ] Implement `deriveMcpPermissions` function
- [ ] Implement `filterResultsByScope` function
- [ ] Update MCP tool execution to check scope
- [ ] Add space-specific MCP tools to registry
- [ ] Implement automatic scope validation
- [ ] Add MCP scope audit logging

### Frontend
- [ ] Create MCP scope selection wizard
- [ ] Create space selector component
- [ ] Create project selector component
- [ ] Create scope summary component
- [ ] Update MCP creation flow
- [ ] Update MCP settings page
- [ ] Add scope change notifications
- [ ] Update MCP list to show scope

### Testing
- [ ] Test MCP creation with organization scope
- [ ] Test MCP creation with space scope
- [ ] Test MCP creation with project scope
- [ ] Test permission derivation accuracy
- [ ] Test result filtering by scope
- [ ] Test scope invalidation on access loss
- [ ] Test audit logging
- [ ] Test security (MCP cannot access outside scope)

## Security Considerations

1. **Scope Validation**: Always validate MCP scope on every tool execution
2. **Permission Recalculation**: Recalculate permissions when scope changes
3. **Audit Trail**: Log all scope changes for compliance
4. **Creator Only**: Only MCP creator or org admin can modify scope
5. **Access Loss**: Automatically revoke scope when user loses access
6. **No Escalation**: MCP cannot have more permissions than creator
