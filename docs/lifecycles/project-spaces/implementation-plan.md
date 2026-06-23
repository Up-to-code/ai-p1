# Project Spaces — Implementation Plan

## Architecture Principle: Scoped Data Loading

**Core rule**: When inside a space, we query ONLY that space's data. We never load the full project then filter client-side.

```
Global view  → listByProject(orgId, projectId)           → loads project items only
Space view   → listBySpace(orgId, projectId, spaceId)    → loads space items only
```

---

## Phase 1: Schema (Convex)

### 1.1 New Table: `projectSpaces`

```typescript
projectSpaces: defineTable({
  organizationId: v.string(),
  projectId: v.id("projects"),
  name: v.string(),
  icon: v.optional(v.string()),
  color: v.optional(v.string()),
  visibility: v.union(v.literal("all_members"), v.literal("selected_members")),
  defaultAssigneeIds: v.optional(v.array(v.string())),
  slug: v.string(),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
})
  .index("by_project_id", ["organizationId", "projectId"])
  .index("by_project_slug", ["organizationId", "projectId", "slug"])
  .index("by_organization_id", ["organizationId"])
```

### 1.2 Modify Existing Tables

**tasks** — add field:
```typescript
spaceId: v.optional(v.string()),
```
Add index:
```typescript
.index("by_organization_project_space", ["organizationId", "projectId", "spaceId"])
```

**calendarEvents** — add field:
```typescript
spaceId: v.optional(v.string()),
```
Add index:
```typescript
.index("by_organization_project_space", ["organizationId", "projectId", "spaceId"])
```

**mediaAssets** — add field:
```typescript
spaceId: v.optional(v.string()),
```
Add index:
```typescript
.index("by_organization_space", ["organizationId", "spaceId"])
```

---

## Phase 2: Convex Queries & Mutations

### 2.1 Validators

File: `convex/projectSpaces/validators.ts`

```typescript
export const spaceInputValidator = v.object({
  name: v.string(),
  icon: v.optional(v.string()),
  color: v.optional(v.string()),
  visibility: v.union(v.literal("all_members"), v.literal("selected_members")),
  defaultAssigneeIds: v.optional(v.array(v.string())),
  slug: v.string(),
});

export const spaceValidator = v.object({
  _id: v.id("projectSpaces"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  projectId: v.id("projects"),
  name: v.string(),
  icon: v.optional(v.string()),
  color: v.optional(v.string()),
  visibility: v.union(v.literal("all_members"), v.literal("selected_members")),
  defaultAssigneeIds: v.optional(v.array(v.string())),
  slug: v.string(),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});
```

### 2.2 Mutations

File: `convex/projectSpaces/write.ts`

- `createFromHono` — Insert space, validate slug uniqueness within project
- `updateFromHono` — Update space config (single operation), validate slug if changed
- `deleteFromHono` — Soft delete space, clear spaceId from all items in that space

### 2.3 Queries

File: `convex/projectSpaces/read.ts`

- `list` — List all spaces for a project (filtered by project)
- `get` — Get space by ID
- `getBySlug` — Get space by project + slug (for URL resolution)

### 2.4 Extend Existing Queries

File: `convex/clientTasks/read.ts` — Add:
```typescript
export const listBySpace = query({
  args: { organizationId: v.string(), projectId: v.string(), spaceId: v.string() },
  handler: async (ctx, args) => {
    // Query tasks where projectId AND spaceId match
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_organization_project_space", (q) =>
        q.eq("organizationId", args.organizationId)
         .eq("projectId", args.projectId)
         .eq("spaceId", args.spaceId)
      )
      .take(MAX_LIST_TASKS);
    return activeDueWorkspaceRows(tasks).map(presentTask);
  },
});
```

File: `convex/calendar/read.ts` — Add similar `listBySpace`

---

## Phase 3: Server Layer

### 3.1 Validation Schema

File: `src/server/domains/projectSpaces/validation/space.schema.ts`

```typescript
import { z } from "zod";

export const spacePayloadSchema = z.object({
  name: z.string().trim().min(1),
  icon: z.string().optional(),
  color: z.string().optional(),
  visibility: z.enum(["all_members", "selected_members"]),
  defaultAssigneeIds: z.array(z.string()).optional(),
  slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/),
});

export type SpacePayload = z.infer<typeof spacePayloadSchema>;
```

### 3.2 Service Layer

File: `src/server/domains/projectSpaces/services/spaces.ts`

Follow existing `createCrudService` pattern from `src/server/utils/service-factory.ts`.

### 3.3 Handler Layer

File: `src/server/domains/projectSpaces/handlers/spaces.ts`

Follow existing `createCrudHandlers` pattern from `src/server/utils/handler-factory.ts`.

---

## Phase 4: API Routes

### 4.1 Routes

File: `src/app/api/[[...route]]/projects/[projectId]/spaces/route.ts`
- GET — List spaces
- POST — Create space

File: `src/app/api/[[...route]]/projects/[projectId]/spaces/[spaceId]/route.ts`
- GET — Get space
- PATCH — Update space
- DELETE — Delete space

---

## Phase 5: Client API

### 5.1 Space Hooks

File: `src/domains/projects/api/spaces.ts`

```typescript
// Query hooks
export function useSpacesQuery(organizationId?: string, projectId?: string)
export function useSpaceQuery(organizationId?: string, spaceId?: string)
export function useSpaceBySlugQuery(organizationId?: string, projectId?: string, slug?: string)

// Mutation functions
export async function createSpaceRequest(organizationId, projectId, values)
export async function updateSpaceRequest(organizationId, projectId, spaceId, values)
export async function deleteSpaceRequest(organizationId, projectId, spaceId)
```

### 5.2 Extend Existing Task Hooks

File: `src/domains/tasks/api/tasks.ts`

```typescript
// Add spaceId option
export function useTasksQuery(organizationId?, options?: {
  status?; search?; projectId?; spaceId?  // ← ADD THIS
})
```

---

## Phase 6: UI Components

### 6.1 Space Components

Directory: `src/domains/projects/components/spaces/`

- `space-list.tsx` — Renders spaces in sidebar, handles selection
- `space-settings.tsx` — Dialog for editing space config
- `space-create-form.tsx` — Form for creating new space
- `space-nav-item.tsx` — Individual space item with icon/color

### 6.2 Navigation Integration

File: `src/components/layout/sidebar.tsx`

When inside a project context (`currentProjectId` exists):
- Show "Global" item (project-level items)
- Show divider
- Show list of spaces for this project
- Each space links to `/projects/[projectId]?space=[slug]`

### 6.3 Layout Integration

File: `src/domains/projects/components/detail/project-detail-layout.tsx`

- Read `spaceId` from URL search params
- Pass `spaceId` to all child tabs
- Tabs use scoped queries based on `spaceId`

---

## Phase 7: Cross-Space Assignment

### Pattern
- Assignment dropdown loads `useProjectMembersQuery(orgId, projectId)` — ALL project members
- No separate space membership
- When assigning from different space, notification includes:
  - Project name
  - Source space name
  - Task title

### Notification Enhancement
- Add `spaceId` and `spaceName` to notification payload
- Display in notification UI: "[User] assigned you to [Task] in [Space] of [Project]"

---

## Implementation Order

1. **Schema** — Add table + fields + indexes
2. **Validators** — Convex and Zod schemas
3. **Convex Mutations** — Create/Update/Delete
4. **Convex Queries** — List/Get/GetBySlug + listBySpace for tasks/calendar
5. **Server Service** — Service layer
6. **Server Handlers** — Hono handlers
7. **API Routes** — HTTP endpoints
8. **Client API** — React Query hooks
9. **UI Components** — Space list, settings, create form
10. **Navigation** — Sidebar integration
11. **Layout** — Project detail layout with space context
12. **Scoped Queries** — Update task/calendar hooks to accept spaceId
13. **Cross-Space Assignment** — Assignment dropdown + notifications

---

## Verification Checklist

- [ ] Creating a space validates slug uniqueness within project
- [ ] Updating a space saves all fields in single operation
- [ ] Deleting a space clears spaceId from all items
- [ ] Tasks in space view only show that space's tasks
- [ ] Tasks in global view show all project tasks
- [ ] Cross-space assignment shows all project members
- [ ] Notification includes space context
- [ ] URL structure is consistent with existing patterns
- [ ] Sidebar shows spaces when inside project
- [ ] Backward compatibility: existing queries work without spaceId
