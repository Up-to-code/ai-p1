# Permission Rules Specification

## Overview

This document provides the detailed permission rules for the three-layer permission system (Organization → Space → Project). It defines what each role can do at each layer, with specific action-level granularity.

## Permission Layers

### Layer 1: Organization Permissions

**Organization Roles:**
- `owner` - Full administrative control
- `admin` - Can manage most resources, cannot delete organization
- `member` - Standard user with limited permissions

#### Organization Owner Permissions

| Resource | Actions | Notes |
|----------|---------|-------|
| Organization | read, update, delete | Full control |
| Members | create, read, update, delete | Can invite, remove, change roles |
| Roles | create, read, update, delete | Can manage custom roles |
| Spaces | create, read, update, delete | Can manage all spaces |
| Projects | create, read, update, delete | Full access to all projects |
| Clients | create, read, update, delete | Full access to all clients |
| Deals | create, read, update, delete | Full access to all deals |
| Tasks | create, read, update, delete | Full access to all tasks |
| Calendar | create, read, update, delete | Full access to all calendar events |
| Media | create, read, update, delete | Full access to all media |
| Docs | create, read, update, delete | Full access to all docs |

#### Organization Admin Permissions

| Resource | Actions | Notes |
|----------|---------|-------|
| Organization | read, update | Cannot delete organization |
| Members | create, read, update | Can invite and change roles, cannot remove owners |
| Roles | create, read, update | Cannot delete default roles |
| Spaces | create, read, update | Can create and manage spaces |
| Projects | create, read, update, delete | Full project access |
| Clients | create, read, update, delete | Full client access |
| Deals | create, read, update, delete | Full deal access |
| Tasks | create, read, update, delete | Full task access |
| Calendar | create, read, update, delete | Full calendar access |
| Media | create, read, update, delete | Full media access |
| Docs | create, read, update, delete | Full docs access |

#### Organization Member Permissions

| Resource | Actions | Notes |
|----------|---------|-------|
| Organization | read | Read-only org info |
| Members | read | Can see member list |
| Roles | read | Can see roles |
| Spaces | read (public only) | Can view public spaces |
| Projects | read (accessible) | Based on space/project membership |
| Clients | read (accessible) | Based on space/project membership |
| Deals | read (accessible) | Based on space/project membership |
| Tasks | create, read, update | Organization-visible Tasks are collaborative by default even when linked to a narrower parent; explicit private Tasks are limited to their creator and assignees, while team-scoped Tasks follow their Space/Project boundary |
| Calendar | read (accessible) | Based on space/project membership |
| Media | read (accessible) | Based on space/project membership |
| Docs | read (accessible) | Based on space/project membership |

### Layer 2: Space Permissions

**Space Roles:**
- `admin` - Can manage space and its projects
- `member` - Can participate and create projects (if allowed)
- `viewer` - Read-only access

**Space Visibility:**
- `private` - Only explicitly added members
- `public` - All org members can view, join to participate
- `request_only` - All org members can discover, must request to join

#### Space Admin Permissions

| Resource | Actions | Scope |
|----------|---------|-------|
| Space | read, update | This space only |
| Space Members | create, read, update, delete | Can add/remove members |
| Projects (in space) | create, read, update, delete | Full control over space projects |
| Project Members (in space) | create, read, update, delete | Can manage project memberships |
| Clients (in space) | create, read, update, delete | Full control over space clients |
| Deals (in space) | create, read, update, delete | Full control over space deals |
| Tasks (in space) | create, read, update, delete | Full control over space tasks |
| Calendar (in space) | create, read, update, delete | Full control over space calendar |
| Media (in space) | create, read, update, delete | Full control over space media |
| Docs (in space) | create, read, update, delete | Full control over space docs |

#### Space Member Permissions

| Resource | Actions | Scope |
|----------|---------|-------|
| Space | read | This space only |
| Space Members | read | Can see member list |
| Projects (in space) | create*, read, update | Can create if space allows |
| Project Members (in space) | read | Can see project memberships |
| Clients (in space) | create, read, update | Full access to space clients |
| Deals (in space) | create, read, update | Full access to space deals |
| Tasks (in space) | create, read, update, delete | Full access to space tasks |
| Calendar (in space) | create, read, update, delete | Full access to space calendar |
| Media (in space) | create, read, update, delete | Full access to space media |
| Docs (in space) | create, read, update, delete | Full access to space docs |

*Project creation depends on space setting `allowMemberProjectCreation`

#### Space Viewer Permissions

| Resource | Actions | Scope |
|----------|---------|-------|
| Space | read | This space only |
| Space Members | read | Can see member list |
| Projects (in space) | read | Read-only access |
| Project Members (in space) | read | Can see project memberships |
| Clients (in space) | read | Read-only access |
| Deals (in space) | read | Read-only access |
| Tasks (in space) | read | Read-only access |
| Calendar (in space) | read | Read-only access |
| Media (in space) | read | Read-only access |
| Docs (in space) | read | Read-only access |

### Layer 3: Project Permissions

**Project Roles:**
- `admin` - Can manage project
- `member` - Can edit project content
- `viewer` - Read-only access

**Project Visibility:**
- `private` - Only project members
- `space_members` - All members of linked spaces
- `organization` - All organization members

#### Project Admin Permissions

| Resource | Actions | Scope |
|----------|---------|-------|
| Project | read, update, delete | This project only |
| Project Members | create, read, update, delete | Can add/remove members |
| Project Spaces | read, update | Can link/unlink spaces |
| Tasks (in project) | create, read, update, delete | Full control |
| Calendar (in project) | create, read, update, delete | Full control |
| Media (in project) | create, read, update, delete | Full control |
| Docs (in project) | create, read, update, delete | Full control |

#### Project Member Permissions

| Resource | Actions | Scope |
|----------|---------|-------|
| Project | read, update | This project only |
| Project Members | read | Can see member list |
| Project Spaces | read | Can see linked spaces |
| Tasks (in project) | create, read, update, delete | Full access |
| Calendar (in project) | create, read, update, delete | Full access |
| Media (in project) | create, read, update, delete | Full access |
| Docs (in project) | create, read, update, delete | Full access |

#### Project Viewer Permissions

| Resource | Actions | Scope |
|----------|---------|-------|
| Project | read | This project only |
| Project Members | read | Can see member list |
| Project Spaces | read | Can see linked spaces |
| Tasks (in project) | read | Read-only |
| Calendar (in project) | read | Read-only |
| Media (in project) | read | Read-only |
| Docs (in project) | read | Read-only |

## Permission Inheritance Logic

### Access Calculation Algorithm

For any resource access request:

```typescript
function canAccessResource(userId: string, resource: Resource, action: Action): boolean {
  const orgMembership = getOrganizationMembership(userId, resource.organizationId);
  const orgRole = orgMembership.role;

  // Organization owners have full access
  if (orgRole === "owner") return true;

  // Check direct organization permissions
  if (hasOrgPermission(orgRole, resource, action)) return true;

  // If resource is space-scoped
  if (resource.spaceId) {
    const spaceMembership = getSpaceMembership(userId, resource.spaceId);
    if (spaceMembership) {
      // Space admins have full access to space resources
      if (spaceMembership.role === "admin") return true;
      // Check space permissions
      if (hasSpacePermission(spaceMembership.role, resource, action)) return true;
    }
  }

  // If resource is project-scoped
  if (resource.projectId) {
    const projectMembership = getProjectMembership(userId, resource.projectId);
    if (projectMembership) {
      // Project admins have full access to project resources
      if (projectMembership.role === "admin") return true;
      // Check project permissions
      if (hasProjectPermission(projectMembership.role, resource, action)) return true;
    }

    // Check if user has access via space membership
    const project = getProject(resource.projectId);
    for (const spaceId of project.spaceIds) {
      const spaceMembership = getSpaceMembership(userId, spaceId);
      if (spaceMembership && project.visibility === "space_members") {
        return hasSpacePermission(spaceMembership.role, resource, action);
      }
    }

    // Check if user has access via organization membership
    if (project.visibility === "organization") {
      return hasOrgPermission(orgRole, resource, action);
    }
  }

  return false;
}
```

### Visibility Resolution

For listing resources (e.g., "list all projects I can see"):

```typescript
function listAccessibleProjects(userId: string, organizationId: string): Project[] {
  const orgMembership = getOrganizationMembership(userId, organizationId);
  const orgRole = orgMembership.role;

  const allProjects = getAllProjects(organizationId);
  const accessibleProjects = [];

  for (const project of allProjects) {
    // Organization owners see everything
    if (orgRole === "owner") {
      accessibleProjects.push(project);
      continue;
    }

    // Check direct project membership
    const projectMembership = getProjectMembership(userId, project._id);
    if (projectMembership) {
      accessibleProjects.push(project);
      continue;
    }

    // Check space membership
    if (project.visibility === "space_members") {
      for (const spaceId of project.spaceIds) {
        const spaceMembership = getSpaceMembership(userId, spaceId);
        if (spaceMembership) {
          accessibleProjects.push(project);
          break;
        }
      }
    }

    // Check organization visibility
    if (project.visibility === "organization") {
      accessibleProjects.push(project);
    }
  }

  return accessibleProjects;
}
```

## Special Permission Rules

### Creator-Based Permissions

Some actions are allowed if the user created the resource, regardless of their role:

| Resource | Creator Actions |
|----------|-----------------|
| Tasks | Can delete own tasks even if not project admin |
| Comments | Can delete own comments |
| Calendar Events | Can delete own events |

### Cascading Deletes

| Resource | Delete Behavior |
|----------|-----------------|
| Space | Does NOT delete projects, only dissociates them |
| Project | Does NOT delete tasks, marks them as orphaned |
| Space Member | Does NOT delete their project memberships |

### Role Constraints

| Constraint | Rule |
|------------|------|
| Last Space Admin | Cannot remove last admin without assigning replacement |
| Organization Owner | Cannot demote self to lower role |
| Private Space | Cannot make private if has non-member dependencies |
| Project in Multiple Spaces | Requires space membership in at least one space |

## MCP Permission Derivation

### Scope-Based Permission Mapping

When an MCP worker is created with a specific scope:

```typescript
function deriveMcpPermissions(
  userId: string,
  scope: {
    type: "organization" | "space" | "project";
    spaceIds?: string[];
    projectIds?: string[];
  }
): McpPermission[] {
  const permissions: McpPermission[] = [];

  if (scope.type === "organization") {
    // MCP gets organization-level permissions only
    const orgMembership = getOrganizationMembership(userId);
    permissions.push(...getOrgPermissions(orgMembership.role));
  }

  if (scope.type === "space") {
    // MCP gets permissions for specified spaces
    for (const spaceId of scope.spaceIds) {
      const spaceMembership = getSpaceMembership(userId, spaceId);
      if (spaceMembership) {
        permissions.push(...getSpacePermissions(spaceMembership.role, spaceId));
      }
    }
  }

  if (scope.type === "project") {
    // MCP gets permissions for specified projects
    for (const projectId of scope.projectIds) {
      const projectMembership = getProjectMembership(userId, projectId);
      if (projectMembership) {
        permissions.push(...getProjectPermissions(projectMembership.role, projectId));
      }
    }
  }

  return permissions;
}
```

### MCP Resource Filtering

When MCP tools execute, they must filter results based on scope:

```typescript
function filterMcpResults(
  results: Resource[],
  mcpScope: McpScope
): Resource[] {
  return results.filter(resource => {
    if (mcpScope.type === "organization") {
      return true; // MCP has org-level access
    }

    if (mcpScope.type === "space") {
      return resource.spaceId && mcpScope.spaceIds.includes(resource.spaceId);
    }

    if (mcpScope.type === "project") {
      return resource.projectId && mcpScope.projectIds.includes(resource.projectId);
    }

    return false;
  });
}
```

## Permission Audit Trail

All permission changes must be logged:

```typescript
interface PermissionAuditLog {
  id: string;
  organizationId: string;
  actorUserId: string;
  targetUserId?: string;
  resourceType: "organization" | "space" | "project";
  resourceId: string;
  action: "add_member" | "remove_member" | "change_role" | "change_visibility";
  oldValue?: any;
  newValue?: any;
  timestamp: number;
}
```

## Implementation Checklist

- [ ] Create permission checking utilities in `convex/permissions/`
- [ ] Implement access calculation algorithm
- [ ] Implement visibility resolution for listing
- [ ] Add permission audit logging
- [ ] Update Convex functions to check permissions
- [ ] Update MCP handlers to respect scoping
- [ ] Add permission checks to frontend API calls
- [ ] Create permission testing utilities
- [ ] Document permission error messages
