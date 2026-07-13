# Three-Layer Permission System Design

> Task exception: Task visibility is a record-level collaboration boundary.
> `workspace` Tasks are available to Organization members even when linked to
> a narrower Project or Space, without granting access to that parent.
> `team` Tasks inherit the linked parent boundary, and `private` Tasks are
> available only to their creator and assignees.

## Overview

This document describes the redesigned permission and scoping system for Qentrah, implementing a three-layer hierarchy (Organization → Space → Project) based on project management best practices from Asana, Jira, Azure DevOps, and Plane.

## Motivation

The current schema has several limitations:
- `projectSpaces` is tied to a single project, not a true space entity
- No proper `spaces` table at the organization level
- No many-to-many relationship between spaces and projects
- Permissions are flat (organization-level only) without space/project scoping
- MCP workers don't respect space/project boundaries

## Best Practices Research

### Key Findings from Industry Leaders

**Asana:**
- Projects can be: Private to members, Shared with team, Shared with organization
- Teams can be: Private, Membership by Request, Public to organization
- Individual project permissions: Project Admin, Editor, Commenter, Viewer
- Access inheritance: Team members see all team projects

**Jira:**
- Three permission layers: Global, Space, Work Item
- Permission schemes can be reused across spaces
- Space admins have perspective to understand team needs
- Project admins can make changes scoped to their teams

**Azure DevOps:**
- Use groups for permissions, never individual users
- Create groups at Team Project level or Organization level
- Default groups should not be modified; create custom groups instead
- Team creation automatically creates Area, Boards, and Dashboard

**Plane:**
- Permissions inherit upward (Project Admin → access to all project content)
- Custom roles composed of permission schemes
- Role's effective permissions are union of all attached schemes
- Creator-based permissions for certain actions

## New Schema Design

### Layer 1: Organization (Top Level)

**Organization Tables (existing):**
- `organizations` - Top-level tenant
- `organizationMembers` - Organization membership with roles
- `organizationCapabilities` - Feature flags and permissions

**Organization Roles:**
- `owner` - Full access to all organization resources, can manage members
- `admin` - Can manage most resources, cannot delete organization
- `member` - Read-only access to organization, specific access via spaces/projects

### Layer 2: Space (Department/Functional Area)

**New Table: `spaces`**
```typescript
{
  organizationId: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  slug: string;
  visibility: "private" | "public" | "request_only";
  defaultProjectVisibility?: "private" | "space_members" | "organization";
  createdByUserId: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}
```

**New Table: `spaceMembers`**
```typescript
{
  organizationId: string;
  spaceId: string;
  userId: string;
  role: "admin" | "member" | "viewer";
  addedByUserId: string;
  addedAt: number;
  deletedAt?: number;
}
```

**Space Visibility Levels:**
- `private` - Only explicitly added members can access
- `public` - All organization members can view, join to participate
- `request_only` - All org members can discover, must request to join

**Space Roles:**
- `admin` - Can manage space, add/remove members, create projects
- `member` - Can participate, create projects if allowed
- `viewer` - Read-only access to space and its projects

### Layer 3: Project (Work Container)

**Modified Table: `projects`**
```typescript
{
  // Existing fields...
  organizationId: string;
  name: string;
  // Add new fields:
  spaceIds?: string[]; // Array of space IDs (many-to-many)
  visibility: "private" | "space_members" | "organization";
  // ... rest of existing fields
}
```

**New Table: `projectSpaces` (junction table)**
```typescript
{
  organizationId: string;
  projectId: string;
  spaceId: string;
  isPrimary: boolean; // Indicates primary space for project
  addedByUserId: string;
  addedAt: number;
  deletedAt?: number;
}
```

**Project Visibility Levels:**
- `private` - Only project members (explicitly added)
- `space_members` - All members of linked spaces can access
- `organization` - All organization members can access

**Project Roles (per-project membership):**
- `admin` - Can manage project, add/remove members
- `member` - Can edit tasks, docs, calendar
- `viewer` - Read-only access

### Many-to-Many Relationship

A project can belong to multiple spaces, and a space can contain multiple projects. This enables:
- Cross-functional projects (e.g., "Q4 Launch" in Marketing + Sales + Product spaces)
- Departmental oversight (e.g., Finance space sees all budget-related projects)

## Permission Inheritance Rules

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

### Permission Matrix

| Resource | Owner | Admin | Member | Space Admin | Space Member | Space Viewer | Project Admin | Project Member | Project Viewer |
|----------|-------|-------|--------|-------------|--------------|--------------|---------------|----------------|----------------|
| Create Space | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit Space | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete Space | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Add Space Member | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create Project (in Space) | ✅ | ✅ | ❌ | ✅ | ✅* | ❌ | ❌ | ❌ | ❌ |
| Edit Project | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Delete Project | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Add Project Member | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |

*Space members can create projects only if space allows it (configurable)

## MCP Worker Scoping

### MCP Creation Flow

When a user creates an MCP worker in member settings:

1. **Scope Selection UI:**
   - User sees only spaces they have `admin` or `member` access to
   - For each space, show projects they have access to
   - Option to select "All accessible spaces" or specific spaces/projects

2. **Permission Derivation:**
   - MCP worker inherits the user's permissions at selected scope
   - If scoped to space: MCP has same access as user in that space
   - If scoped to project: MCP has same access as user in that project
   - MCP cannot access resources outside its designated scope

3. **MCP Permission Record:**
```typescript
{
  mcpId: string;
  organizationId: string;
  createdByUserId: string;
  scope: {
    type: "organization" | "space" | "project";
    spaceIds?: string[]; // If space-scoped
    projectIds?: string[]; // If project-scoped
  };
  permissions: McpPermission[]; // Derived from user's permissions at scope
  createdAt: number;
  updatedAt: number;
}
```

### MCP Tool Registry Updates

Update MCP tool registry to include space-level resources:

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
```

Space-specific tools:
- `spaces_list` - List accessible spaces
- `spaces_get` - Get space details
- `spaces_create` - Create space (requires space admin or org admin)
- `spaces_update` - Update space (requires space admin)
- `spaces_delete` - Delete space (requires org owner)
- `space_members_list` - List space members
- `space_members_add` - Add member to space
- `space_members_remove` - Remove member from space
- `space_members_update_role` - Update member role in space

## Implementation Plan

### Phase 1: Schema Changes
1. Create `spaces` table
2. Create `spaceMembers` table
3. Modify `projects` table to add `spaceIds` field
4. Update `projectSpaces` junction table for many-to-many
5. Run `npx convex codegen`

### Phase 2: Backend Logic
1. Create space CRUD operations in `convex/spaces/`
2. Create space member management in `convex/spaces/members.ts`
3. Update project queries to filter by space membership
4. Update permission checks to include space/project scoping
5. Update MCP handlers to respect space/project boundaries

### Phase 3: Frontend UI
1. Create space management UI (similar to project management)
2. Update sidebar to show spaces hierarchy
3. Update project creation to select spaces
4. Update member settings to show space memberships
5. Update MCP creation flow with scope selection

### Phase 4: Migration
1. Migrate existing `projectSpaces` to new schema
2. Create default spaces for existing organizations
3. Migrate project visibility to new model
4. Update existing project-space relationships

## Security Considerations

1. **Default Deny**: Users have no access unless explicitly granted
2. **Least Privilege**: Grant minimum required permissions
3. **Audit Trail**: Log all membership and permission changes
4. **Cascading Deletes**: Deleting a space should not delete projects (just dissociate)
5. **Orphan Prevention**: Cannot delete last space admin without assigning replacement

## References

- Asana Project Permissions: https://help.asana.com/s/article/project-permissions
- Jira Permissions: https://www.atlassian.com/software/jira/guides/permissions/overview
- Azure DevOps Access: https://learn.microsoft.com/en-us/azure-devops/organizations/security/restrict-access
- Plane RBAC: https://docs.plane.so/roles-and-permissions/overview
