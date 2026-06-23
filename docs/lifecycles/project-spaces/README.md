# Project Spaces Lifecycle

## Purpose
Add a "Space" concept inside projects. A Space is a named working area that groups tasks, calendar events, and media by domain or team. Spaces are project-scoped, not workspace-level.

## Owner App
`apps/workspace`

## Entrypoints
- `convex/projectSpaces/` — Convex mutations and queries
- `convex/schema.ts` — New `projectSpaces` table, modified `tasks`, `calendarEvents`, `mediaAssets` tables
- `src/server/domains/projectSpaces/` — Hono handlers and service layer
- `src/domains/projects/api/spaces.ts` — Client API hooks
- `src/domains/projects/components/spaces/` — UI components
- `src/components/layout/sidebar.tsx` — Navigation integration

## Actor/System Flow
1. User navigates to project → sees spaces in sidebar
2. User creates space → Convex mutation with slug uniqueness check
3. User selects space → scoped query loads only that space's items
4. User assigns task from different space → cross-space assignment via project membership
5. User deletes space → items fall back to project-global level

## Current Status
Planning — no code written yet.
