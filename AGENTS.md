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
- **Wave 3: Hybrid Sync Architecture** — IndexedDB storage adapter built (`idb` v8), `useOptimisticInvalidation` hook created, task-editor drafts migrated from localStorage to IndexedDB, `dataVersion` field added to sync state model. Verified 0 new type errors.
- **Wave 2D: ClickUp-Inspired Sidebar Redesign** — Dual-layer sidebar: fixed rail (w-14) always visible, secondary panel (w-72) slides in/out. Contextual panels: AI chat (unlimited threads, bottom-aligned), space list/project tree (flat list vs space detail + parent project hierarchy), project detail (sub-nav tabs + team avatars). Home/Inbox static nav items at top of rail. Popover create menu (New Project / New Space) gated by `canCreateProjects` capability. Mobile responsive: sidebar becomes fixed overlay on small screens. Topbar toggle opens/closes secondary panel only (rail always visible). Page navigation items (`closeAll`) close secondary panel. All panels use shared `SidebarPanelLayout` shell (header + close + bg-secondary). 0 new type errors.
- **#8: Unify Validation Across All Domains** — Aligned `@qentrah/domain-contracts` with Convex validators: removed `"low"` from `clientPrioritySchema` (Convex client table excludes it), changed `clientPipelineStageSchema` from enum to `z.string()` (Convex uses `v.string()`), created separate `taskPrioritySchema` preserving `"low"` for tasks. Updated `convex/shared/domain-schemas.ts` to exactly mirror all fields from all 5 Convex input validators (deals, projects, clients, calendar, tasks). Added `TaskPriority` type export.
- **#8 Step 2: Fix Pre-Existing TypeScript Errors** — Fixed 40+ pre-existing TS errors across workspace `src/`: `client-view-model.ts` (nullish fallbacks + `normalizeClientPipelineStage` accepts `string | undefined`), `client-form.tsx` (type assertions for pipelineStage/priority), `client-table-view.tsx` (nullish fallbacks), `quick-create-client-modal.tsx` (pipelineStage cast), `notion-client-table.tsx` (pipelineStage fallback), `pipeline-command.ts` (`NonNullable<ClientPipelineStage>`, computed key casts, phone fallback), `client-table-utils.ts` (pipelineStage nullish in sort), `client-table-utils.test.ts` (explicit `Client[]` typing), `clients-screens.tsx` (pipelineStage `?? "new"` fallback), `client-picker-modal.tsx` (pipelineStage `?? "new"` index), `project-detail-layout.tsx` (`currentSpaceId ?? undefined`), `project-view-model.ts` (fixed relative import paths `./store` → `../store`), `workspace-widget-grid.tsx` (WidgetOption callback type), `tool-executor.ts` (`schema: z.ZodObject<any>` + `z` import), `use-optimistic-invalidation.ts` (mutable array + spread), `agent-links-panel.tsx` (missing `Check` icon import), `billing-requests.ts` + `client-follow-ups.ts` (missing `requestOrganizationAction`/`organizationApiPath` imports), `task-links.test.ts` (missing `organizationId` in context), `usage-formatters.test.ts` (null type assertion).
- **Wave 3 Follow-up: Storage Barrel Export** — Created `src/domains/storage/index.ts` re-exporting `getItem`, `setItem`, `removeItem`, `clearStore`, `getAllKeys`, `getVersion`, `setVersion`, `getNextVersion` from `indexeddb-adapter.ts`. Fixes `task-editor.tsx` dynamic import errors.
- **Next.js Hoisting Fix** — Workspace had `next@16.3.0-preview.5` locally while root override specifies `16.3.0-canary.32`. Cleaned stale temp dirs in `node_modules`, removed workspace's local `next`, re-ran `npm install` — Next.js now hoisted to root only. Resolved all 4 remaining `proxy.ts`/`next.config.ts` type identity conflicts.
- **Final TypeScript Status** — Workspace `src/` is at **0 TypeScript errors**. 148 errors remain in `convex/` directory — all from missing tables in the Convex data model (`milestones`, `taskDependencies`, `piiAccessAudit`) — these are Wave 4 schema work.
- **Calendar Redesign**: Replaced old calendar UI with `@svar-ui/react-calendar` — Apple-style split layout (grid + mini month/event side panel). Removed old drawer components, hooks, and test files. Kept API/types/validation/store (used by project/client tabs and widgets).
- **TokenBar Creation**: Extracted shareable `TokenBar` component (horizontal token bar + "+" trigger + searchable categorized add modal) from the dead `workspace-tab-switcher.tsx` pattern. Deleted stale `workspace-tab-switcher.tsx` (replaced by `ViewSwitcher` in `workspace-screen.tsx`).
- **@qentrah/our-platform-components Package**: Created new package with PipelineBoard (DnD column board, `packages/our-platform-components/src/pipeline/pipeline-board.tsx`) and WidgetGrid (resizable card grid, `packages/our-platform-components/src/widget-grid/widget-grid.tsx`). App re-export wrappers in `src/components/shared/view-system/`. Deleted old `workspace-widget-grid.tsx` and `workspace-widget-registry.tsx`. Rewrote `workspace-screen.tsx` — board view uses PipelineBoard with `showBarColor` (hex colors `#6b7280`/`#3b82f6`/`#f59e0b`/`#22c55e`), DnD motion (`transition-all duration-200 scale-[0.97]`), and `renderEmpty` per-stage placeholder. `EntityHeader` usage replaced with plain flex layout. 0 TypeScript errors in workspace `src/`.

### Blocked
- (none)

## Key Decisions
- TanStack Query optimistic updates for Projects and Deals (same pattern as Clients), rather than custom hooks used by Tasks/Docs.
- Structured compression (preserve start + end, compress middle) over multi-turn chunking.
- Timeout-based fallback (8s) for `organization.isLoaded` rather than removing the loading guard, to handle Clerk edge case for users with no org membership.
- `idb` v8 as IndexedDB wrapper (1KB, native Promise API, typed schemas) rather than raw IndexedDB or heavy abstraction.
- 300ms debounce on IndexedDB draft writes to avoid excessive transactions during typing.
- **Sidebar architecture**: Rail (w-14) always visible — never hidden. Secondary panel (w-72) is the only element that opens/closes. `isMainVisible` removed from state; `toggleMain` now toggles the secondary panel (opens AI as default when closed). `closeAll` only closes secondary panel. Topbar toggle button shows `PanelRightClose` when secondary is open, `PanelLeft` when closed.
- **Shared panel layout**: All secondary panels use `SidebarPanelLayout` shell — consistent `bg-secondary` background, header with title + actions + close button, scrollable body. Each domain panel plugs in its own content (chat list, space tree, project tabs).
- **Domain-contracts priority split**: `ClientPriority` excludes `"low"` (Convex client table validator excludes it); `TaskPriority` includes `"low"` (Convex task table validator includes it). Separate schemas prevent invalid client priority values.
- **ClientPipelineStage as `z.string()`**: Changed from `z.enum([...])` to `z.string()` to match Convex `v.string()`. Front-end Zod form schema retains the enum for form validation, but the type is now `string` to avoid mismatches with Convex records where `pipelineStage` is optional and unconstrained.
- **`domain-schemas.ts` as single source of truth**: Any future Convex validator change must be reflected in `convex/shared/domain-schemas.ts` to keep the MCP tool layer in sync.
- **Three-Layer Permission System**: Implemented Organization → Space → Project hierarchy based on project management best practices (Asana, Jira, Azure DevOps, Plane). Spaces are first-class entities with many-to-many project relationships. MCP workers respect space/project boundaries through explicit scoping during creation. See `docs/decisions/three-layer-permission-system.md` for full design.
- **Permission Inheritance**: Permissions cascade downward (Org Owner → Space Admin → Project Admin) with visibility controls at each layer (private/public/request_only for spaces, private/space_members/organization for projects). MCP workers derive permissions from creator's access at time of creation and cannot access resources outside their designated scope.

## Next Steps
- **Three-Layer Permission System Implementation**: Implement the new Organization → Space → Project permission system. See detailed design in `docs/decisions/three-layer-permission-system.md`, `docs/decisions/permission-rules-specification.md`, and `docs/decisions/mcp-worker-scoping-design.md`.
  - Phase 1: Schema changes (spaces, spaceMembers, projectSpaces junction table)
  - Phase 2: Backend logic (space CRUD, permission checks, MCP scoping)
  - Phase 3: Frontend UI (space management, MCP scope selection)
  - Phase 4: Migration (existing data to new schema)
- **Wave 3 follow-up**: Optionally migrate dashboard layouts (projects-overview, global-projects-dashboard) from localStorage to IndexedDB, replace remaining ad-hoc localStorage usage in clients-filters, integrations-runtime, project-tags-settings.
- **Wave 4**: MCP Feature Expansion — Document/Folder/Comment/Tag CRUD, Time Tracking module schema + MCP tools. Includes adding missing Convex tables (`milestones`, `taskDependencies`, `piiAccessAudit`) to the data model and running `npx convex codegen` to resolve the 148 remaining `convex/` TypeScript errors.
- **Wave 5**: Platform Readiness Audit, Engineering Audit Checklist, Competitive Gap Analysis.
- **Marketing Design System Redesign**: Created unified `components/design-system.tsx` (PublicSection, SectionHeader, CtaBanner, FeatureCardGrid, WorkflowCard, LegalArticle, PageShell, etc.). Migrated About, Contact, Blog, Legal, Privacy, Terms, and Pricing pages to use CSS variable tokens (`--q-*`) and the new primitives. Removed Broker and Developer pages (deleted routes + components). Fixed `shared.tsx` blog colors to use theme tokens. Build passes with 0 type errors.
- Update Qentrah MCP tasks to reflect completion.
- **@qentrah/our-platform-components follow-up**: Fixed workspace-screen.tsx board view — replaced CSS variable stage colors with hardcoded hex values, enabled `showBarColor`, added `renderEmpty` per-stage placeholder, removed `EntityHeader` usage (unused component). 0 TypeScript errors in workspace `src/`.

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
- `apps/workspace/src/components/layout/sidebar/sidebar-rail-context.tsx`: Core state — `activeRailItem` only (no `isMainVisible`), `toggleMain` toggles secondary panel
- `apps/workspace/src/components/layout/sidebar/components/sidebar-rail.tsx`: Fixed rail (w-14) — org switcher, static nav (Home/Inbox), primary nav, bottom settings/user
- `apps/workspace/src/components/layout/sidebar/components/sidebar-secondary-panel.tsx`: Contextual panel dispatcher — AI, spaces, or project panel
- `apps/workspace/src/components/layout/sidebar/components/sidebar-space-panel.tsx`: Contextual — flat space list or active space + project tree; Popover create menu (gated by capabilities)
- `apps/workspace/src/components/layout/sidebar/components/sidebar-project-panel.tsx`: Project detail panel with sub-nav tabs + team avatars
- `apps/workspace/src/components/layout/sidebar/components/sidebar-panel-layout.tsx`: Shared panel shell — header (title + actions + close), bg-secondary, scrollable body
- `apps/workspace/src/components/layout/sidebar/components/sidebar-chat-panel.tsx`: AI chat thread list (unlimited, bottom-aligned, skeleton loading, normal text)
- `apps/workspace/src/components/layout/sidebar/config/nav.config.ts`: All nav sections — static, primary, space, project, coming soon, workspace
- `apps/workspace/src/components/layout/sidebar/sidebar.tsx`: Main composer — rail always visible, width transitions based on `activeRailItem`
- `apps/workspace/src/components/layout/topbar/topbar-essential.tsx`: Toggle button — shows `PanelRightClose` (secondary open) / `PanelLeft` (closed)
- `packages/domain-contracts/src/clients.ts`: `clientPrioritySchema` (no "low"), `clientPipelineStageSchema` (`z.string()`)
- `packages/domain-contracts/src/tasks.ts`: `taskPrioritySchema` (includes "low"), `TaskPriority` type
- `convex/shared/domain-schemas.ts`: Fully aligned with all 5 Convex input validators
- `apps/workspace/src/domains/storage/index.ts`: Storage barrel export (Wave 3 follow-up)
- `apps/workspace/src/domains/clients/pipeline-command.ts`: Fixed `ClientPipelineStage` type, computed key casts, phone fallback
- `apps/workspace/src/domains/clients/client-view-model.ts`: `normalizeClientPipelineStage` accepts `string | undefined`
- `apps/workspace/src/server/domains/agents/services/tool-executor.ts`: `schema: z.ZodObject<any>` type fix
- `apps/workspace/src/domains/cache/hooks/use-optimistic-invalidation.ts`: Mutable array type fix
- `apps/workspace/src/components/shared/token-bar/token-bar.tsx`: Shareable horizontal token bar with "+" add trigger
- `apps/workspace/src/components/shared/token-bar/add-token-modal.tsx`: Searchable categorized add modal for TokenBar
- `apps/workspace/src/components/shared/token-bar/index.ts`: TokenBar barrel export
