## Agent skills

### Issue tracker

Issues and PRDs for this repo are tracked in GitHub Issues for `Up-to-code/anan-0.1.2` using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

This repo uses the canonical Matt Pocock skills triage label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo: read root `CONTEXT.md` and the decision log under `docs/decisions/`. See `docs/agents/domain.md`.

## Progress

### Goal
Fix all bugs in the Qentrah Product Development project in priority waves, from MCP infrastructure through UX, data consistency, feature expansion, and documentation.

### Constraints & Preferences
- Work through all 5 waves sequentially.
- Use Qentrah MCP endpoint for task tracking.
- Premium model quota exhausted until June 28.

### Done
- **Wave 1A: MCP Slow Response** — Optimized `tool-executor.ts` to use direct `get` queries (tasks_get, tasks_update, tasks_complete, calendar_get) instead of fetching all records client-side. Added `calendar.read.get` Convex query.
- **Wave 1B: Long Prompt Reliability** — Rewrote `prompt-manager.ts` with structured compression (preserve first 80K + last 16K, compress middle). Hard cap 128K chars. Integrated `onProgress` callback into `orchestrator.ts`.
- **Wave 2A: Optimistic UI** — Added `useUpdateProjectOptimisticMutation` and `useDeleteProjectOptimisticMutation` to `projects.ts`. Added `useUpdateDealOptimisticMutation` and `useDeleteDealOptimisticMutation` to `deals.ts`. TanStack Query pattern with rollback.
- **Wave 2B: Theme Colors** — Fixed `app/f/[id]/page.tsx:61` (`text-white` → `text-foreground`). Rewrote `resource-media-browser.tsx` dialog to use `bg-card text-card-foreground`.
- **Wave 2C: Fix Invitation Acceptance Flow** — Added 8-second timeout for `organization.isLoaded` in `onboarding/page.tsx:27-38`. When `useOrganization()` hangs (no org membership), redirects to `/choose-org` instead of infinite loading.

### In Progress
- **Wave 3: Hybrid Sync Architecture** — IndexedDB storage adapter built (`idb` v8), `useOptimisticInvalidation` hook created, task-editor drafts migrated from localStorage to IndexedDB, `dataVersion` field added to sync state model. Verified 0 new type errors.

### Blocked
- (none)

## Key Decisions
- TanStack Query optimistic updates for Projects and Deals (same pattern as Clients), rather than custom hooks used by Tasks/Docs.
- Structured compression (preserve start + end, compress middle) over multi-turn chunking.
- Timeout-based fallback (8s) for `organization.isLoaded` rather than removing the loading guard, to handle Clerk edge case for users with no org membership.
- `idb` v8 as IndexedDB wrapper (1KB, native Promise API, typed schemas) rather than raw IndexedDB or heavy abstraction.
- 300ms debounce on IndexedDB draft writes to avoid excessive transactions during typing.

## Next Steps
- **Wave 3 follow-up**: Optionally migrate dashboard layouts (projects-overview, global-projects-dashboard) from localStorage to IndexedDB, replace remaining ad-hoc localStorage usage in clients-filters, integrations-runtime, project-tags-settings.
- **Wave 4**: MCP Feature Expansion — Document/Folder/Comment/Tag CRUD, Time Tracking module schema + MCP tools.
- **Wave 5**: Platform Readiness Audit, Engineering Audit Checklist, Competitive Gap Analysis.
- Update Qentrah MCP tasks to reflect completion.

## Relevant Files
- `apps/workspace/src/server/domains/agents/services/tool-executor.ts`: MCP tool dispatch — direct get queries
- `apps/workspace/src/server/domains/agents/services/prompt-manager.ts`: Long prompt compression
- `apps/workspace/src/server/domains/agents/services/orchestrator.ts`: Streaming agent — onProgress
- `apps/workspace/convex/calendar/read.ts`: Added `get` query
- `apps/workspace/src/domains/projects/api/projects.ts`: Optimistic update/delete
- `apps/workspace/src/domains/deals/api/deals.ts`: Optimistic update/delete
- `apps/workspace/src/app/[locale]/onboarding/page.tsx`: Org load timeout fix
- `apps/workspace/src/domains/organization/components/accept-invite-screen.tsx`: Invitation acceptance UI
- `apps/workspace/src/domains/storage/adapters/indexeddb-adapter.ts`: IndexedDB storage adapter
- `apps/workspace/src/domains/storage/index.ts`: Storage module exports
- `apps/workspace/src/domains/cache/hooks/use-optimistic-invalidation.ts`: Centralized cache invalidation
- `apps/workspace/src/domains/tasks/components/task-editor.tsx`: Migrated to IndexedDB draft storage
- `apps/workspace/src/domains/projects/store/projects.types.ts`: Added `dataVersion`
