# Files Involved

## New Files

### Convex Layer
- `convex/projectSpaces/validators.ts` — Space input/output validators
- `convex/projectSpaces/write.ts` — createFromHono, updateFromHono, deleteFromHono mutations
- `convex/projectSpaces/read.ts` — list, get, getBySlug queries

### Server Layer
- `src/server/domains/projectSpaces/validation/space.schema.ts` — Zod schema for Hono
- `src/server/domains/projectSpaces/services/spaces.ts` — Service layer using createCrudService
- `src/server/domains/projectSpaces/handlers/spaces.ts` — Hono handlers using createCrudHandlers

### Client Layer
- `src/domains/projects/api/spaces.ts` — React Query hooks and request functions
- `src/domains/projects/components/spaces/space-list.tsx` — Sidebar list of spaces
- `src/domains/projects/components/spaces/space-settings.tsx` — Settings dialog
- `src/domains/projects/components/spaces/space-create-form.tsx` — Create form
- `src/domains/projects/components/spaces/space-nav-item.tsx` — Nav item component

### API Routes
- `src/app/api/[[...route]]/projects/[projectId]/spaces/route.ts` — List/Create
- `src/app/api/[[...route]]/projects/[projectId]/spaces/[spaceId]/route.ts` — Get/Update/Delete

## Modified Files

### Schema
- `convex/schema.ts` — Add `projectSpaces` table, add `spaceId` to tasks/calendarEvents/mediaAssets

### Queries (add listBySpace)
- `convex/clientTasks/read.ts` — Add `listBySpace` query
- `convex/calendar/read.ts` — Add `listBySpace` query
- `convex/media/read.ts` — Add `listForResource` variant for space-scoped media

### Client API (add spaceId param)
- `src/domains/tasks/api/tasks.ts` — Add `spaceId` option to `useTasksQuery`
- `src/domains/projects/api/projects.ts` — No changes needed

### Navigation
- `src/components/layout/sidebar.tsx` — Add spaces section when in project context

### Layout
- `src/domains/projects/components/detail/project-detail-layout.tsx` — Add space context support
