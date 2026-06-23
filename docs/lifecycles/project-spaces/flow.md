# Flow

## Current Flow (No Spaces)

1. User opens project → `ProjectDetailLayout` loads project data
2. Tasks tab → `useTasksQuery` with `projectId` → Convex `listByProject` query
3. Calendar tab → `useCalendarQuery` with `projectId` → Convex `listByProject` query
4. All items filtered at query level using `by_organization_project` index

## New Flow (With Spaces)

### Navigation
1. User opens project → sidebar shows "Global" + list of spaces
2. User clicks space → URL updates to `/projects/[projectId]?space=[spaceSlug]`
3. Context state: `{ projectId, spaceId? }` passed to all child queries

### Data Loading (Scoped)
1. **Global view** (no space selected):
   - Tasks: `listByProject(organizationId, projectId)` — existing pattern
   - Calendar: `listByProject(organizationId, projectId)` — existing pattern
   - Media: `listForResource(organizationId, "project", projectId)` — existing pattern

2. **Space view** (space selected):
   - Tasks: `listBySpace(organizationId, projectId, spaceId)` — NEW query
   - Calendar: `listBySpace(organizationId, projectId, spaceId)` — NEW query
   - Media: `listForResource(organizationId, "space", spaceId)` — NEW resource type

3. **Unassigned items** (items with no spaceId):
   - Shown in Global view only
   - When space is selected, items without spaceId are excluded

### Cross-Space Assignment
1. User opens task assignment dropdown
2. Dropdown loads `useProjectMembersQuery(organizationId, projectId)` — ALL project members
3. User selects member from different space
4. Task gets assigned, notification includes space context

### Space Deletion
1. User deletes space → `deleteFromHono` mutation
2. Mutation clears `spaceId` from all tasks/events/media in that space
3. Items fall back to project-global level
4. Space record soft-deleted with `deletedAt`

## Indexes Required

### New Indexes
- `projectSpaces`: `by_project_id`, `by_project_slug`, `by_organization_id`
- `tasks`: `by_organization_project_space` on `[organizationId, projectId, spaceId]`
- `calendarEvents`: `by_organization_project_space` on `[organizationId, projectId, spaceId]`
- `mediaAssets`: `by_organization_resource` already supports different resourceTypes

### Existing Indexes (Reused)
- `tasks.by_organization_project` — Used for global project view
- `calendarEvents.by_organization_project` — Used for global project view
