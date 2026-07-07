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
- **Calendar Redesign**: Replaced old calendar UI with `@svar-ui/react-calendar` — Apple-style split layout (grid + mini month/event side panel). Removed old drawer components, hooks, and test files. Kept API/types/validation/store (used by project/client tabs and widgets).
- **TokenBar Creation**: Extracted shareable `TokenBar` component (horizontal token bar + "+" trigger + searchable categorized add modal) from the dead `workspace-tab-switcher.tsx` pattern. Deleted stale `workspace-tab-switcher.tsx` (replaced by `ViewSwitcher` in `workspace-screen.tsx`).
- **@qentrah/our-platform-components Package**: Created new package with PipelineBoard (DnD column board) and WidgetGrid (resizable card grid). App re-export wrappers in `src/components/shared/view-system/`. Deleted old `workspace-widget-grid.tsx` and `workspace-widget-registry.tsx`.
- **Eve 0.19.0 Migration**: Created `src/domains/eve/client.ts` — singleton Eve Client factory. Created `useEveChat` hook wrapping `eve/react`'s `useEveAgent`. Created `EveDashboardChat` component. Barrel export at `src/domains/eve/index.ts`.
- **Custom-Role-Manager Subagent**: Created under `agent/subagents/custom-role-manager/` with 4 tools. Removed stale `agent/tools/roles-*.ts`.
- **Eve Agent Space Tools**: Created 9 space tools in `agent/tools/` with permission guards.
- **MCP Space Tool Integration**: Added `"space"` to `McpPermissionResource` union, 9 space tool catalog entries, tool-executor dispatcher.
- **Space Tool TS Fixes**: Fixed `api.spaces.index.*` paths, `OrganizationResource` union, `canUseResourceAction` validator, `spaces-get.ts` null-safety.
- **Old System Deletion**: Deleted `src/server/domains/agents/`, `src/components/dashboard/dashboard-chat.tsx`, `src/components/layout/agent-panel/`, `assistant-panel.tsx`, `ai-panel.tsx`, `resizable-ai-panel.tsx`, `use-assistant-panel.ts`, `src/domains/agents/`, `convex/agents/`, `src/server/domains/organization/routing/domains/agents.ts`, `use-sidebar-threads.ts`, `sidebar-thread-history-dialog.tsx`, `sidebar-delete-thread-alert.tsx`, `sidebar-conversations-section.tsx`, `dashboard-mode.test.ts`, `pending-confirmation-bar.tsx`.
- **Sidebar AI Panel Rewrite**: `sidebar-chat-panel.tsx` simplified to link-to-AI-page. `sidebar-secondary-panel.tsx` stripped of thread props. `topbar-assistant-button.tsx` uses direct `/ai` navigation. Router cleaned up (`agentsSubRouter` removed).
- **MCP Constants Relocated**: `quick-roles.ts` → `src/components/mcp/constants/`, `risk-policy.ts` → `src/server/protocols/mcp/tools/`. Updated all imports.
- **Clerk ESM Bug (patch-package)**: Abandoned patch-package approach (too fragile with Node 24 ESM). Restored `EVE_BASE_URL=http://127.0.0.1:9999` workaround in `.env.local` to prevent Eve child process from loading Clerk ESM dist outside Next.js bundler.
- **Clerk ESM Fix (Node.js loader)**: Replaced fragile `EVE_BASE_URL` workaround with Node.js ESM hooks loader (`scripts/eve-esm-loader.mjs` + `scripts/eve-esm-init.mjs`). Loader resolves `next/*` bare specifiers to `.js`, adds `.js` to extensionless Clerk relative imports, and handles `next/package.json` JSON import attribute. Registered via `NODE_OPTIONS="--import \"$PWD/scripts/eve-esm-init.mjs\""` in npm dev scripts so Eve child process inherits the loader. Key fix: `async`/`await` in `resolve` hook to properly catch `nextResolve` Promise rejections. Removed `EVE_BASE_URL` from `.env.local`.
- **Eve Auth Channel Fix**: Moved `agent/channels/auth.ts` → `agent/auth/clerk-auth.ts` because Eve v0.19.0 auto-discovers all `.ts` files in `channels/` as channel definitions and `auth.ts` exported an `AuthFn` helper (not a channel). Updated import in `agent/channels/eve.ts`.
- **postinstall.mjs**: Added root-level patch check before applying (skips when no `.patch` files).
- **AiComposer Fixes**: Changed `DropdownMenuTrigger asChild` → `render` prop (Base UI API). Fixes nested `<button>` hydration error and `asChild` DOM leak.
- **Final TS Status**: 0 errors in workspace `src/`. 231 pre-existing errors in `.test.ts` files (vitest `.not` property).
- **Accept-Invite Round 2** — `CalendarPageRedesigned.tsx:7` had wrong CSS path (`@svar-ui/react-calendar/calendar.css` → `@svar-ui/react-calendar/style.css`). This was breaking the entire Next.js dev error page, so every API call returned 500 with the CSS error. Fixed. Also: extended `organizationRequestSafetyMiddleware` to apply to all routes (was `/:organizationId/*` only, missing `/invite-links/accept` and `/invitations/accept`); added `getSessionUserId()` to `clerk-convex.ts` (uses `getAuth(request, ...)` with AsyncLocalStorage-stored request, since `auth()` from `@clerk/nextjs/server` doesn't work in Hono handlers); updated `invite-links.ts` to use `getSessionUserId` and `coerceRole()` to add `org:` prefix; updated `clerk-organization-proxy.ts` to use request context; wrapped `clerk.setActive` in try/catch in accept-invite screen (handles session-not-yet-refreshed case after server-side membership add).
- **Org-Level Eve Sandbox**: Per-org Eve Client (`Map<string, Client>`), `X-Organization-Id` header injected via `headers()`, validated server-side in `clerk-auth.ts` (mismatch → 401). Threads scoped by org in IndexedDB (`thread:${orgId}:${id}` keys). Sidebar passes `orgId` to all thread operations. Role injection via `agent/instructions/user-role.ts`. Clean `/ai` redirect on deleted thread. `restoreAttempted` guard in `useEveChat`.
- **Nitro Worker Bug Investigation**: Confirmed resolved — compiled worker at `.eve/nitro/dev/index.mjs` imports `convertDataContentToBase64String` from root's `ai@7.0.14` via absolute file URL. 3 active sandbox processes running. Transient cache issue, no action needed.
- **Wave 3 Follow-up: localStorage → IndexedDB Migration**: Created `useIndexedDbConfig` hook. Migrated `projects-overview-dashboard.tsx`, `global-projects-dashboard.tsx`, `use-dashboard-persistence.ts`, `clients-screens.tsx`, `integrations-runtime.ts`, `project-tags-settings.tsx`. All use `layouts`/`cache` stores in the existing IndexedDB adapter. 0 new TS errors.
- **Clerk→BetterAuth Wave 0–3 (Session 1)**: Created `convex/auth.ts` (Better Auth `createAuth` with email/password + social + org + convex plugins), `convex/betterAuth.ts` (Convex client binding), `convex/http.ts` (routes lazy registration), `src/app/api/auth/[...all]/route.ts` (proxy to Convex), `src/server/auth/auth-context.ts` (server-side helpers). Rewrote `src/lib/auth-client.ts` with `createAuthClient`, `src/components/providers/backend-providers.tsx` with `ConvexBetterAuthProvider`, `src/domains/auth/auth-identity.ts` with `authClient.useSession()`, `src/domains/auth/organization-context.ts` with Better Auth org hooks, `src/domains/auth/hooks/use-auth-flow.ts` replacing `use-headless-clerk-auth.ts`. Updated layout files to remove ClerkProvider and Clerk `auth()` calls. 0 new type errors.
- **Clerk→BetterAuth Wave 4 – Client-Side Cleanup (this session)**: Rewrote `choose-organization-client.tsx`, `accept-invite-screen.tsx`, `no-organization-modal.tsx` to use Better Auth hooks. Rewrote `use-account-context.ts` removing `@clerk/nextjs` imports. Deleted `use-headless-clerk-auth.ts` + test. Rewrote `onboarding/page.tsx`. Updated barrel exports and `auth-access-screen.tsx`. Deprecated `clerkMembershipOrganizationIds`. Remaining Clerk imports: `proxy.ts` (Wave 5), MCP routes (Wave 6), `clerk-organization-proxy.ts` + `invite-links.ts` (Wave 4 server), `clerk-convex.ts` (Wave 7/8), Eve `clerk-auth.ts` (Wave 7).

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
- **Clerk ESM fix via Node.js ESM hooks**: The `@clerk/nextjs` dist uses `next/*` bare specifiers without `.js` extensions — Node 24 ESM rejects them. Patch-package approach failed (800+ line patch needed for all `next/*` + JSON import attributes + extensionless relative imports). Instead, a `--import`-registered ESM hooks module (`scripts/eve-esm-loader.mjs`) resolves these at runtime. Key insight: `resolve` hook must be `async` with `await` on `nextResolve` to properly catch Promise rejections. Loader path must be absolute in `NODE_OPTIONS` because Eve child process uses a different `cwd` (Eve package root).
- **Base UI `render` prop over `asChild`**: `@base-ui/react/menu` doesn't support `asChild` (Radix API). Uses `render` prop for custom trigger elements. Using `asChild` causes nested `<button>` + `asChild` DOM leak.

## Next Steps
- **Wave 4**: MCP Feature Expansion — Document/Folder/Comment/Tag CRUD, Time Tracking module schema + MCP tools. Includes adding missing Convex tables (`milestones`, `taskDependencies`, `piiAccessAudit`) to the data model and running `npx convex codegen` to resolve remaining `convex/` TypeScript errors.
- **Wave 5**: Platform Readiness Audit, Engineering Audit Checklist, Competitive Gap Analysis.
- Update Qentrah MCP tasks to reflect completion.
- **Clerk→BetterAuth remaining waves**:
  - Wave 4 server: Rewrite `clerk-organization-proxy.ts` → `better-auth-organization-service.ts`, delete `invite-links.ts` server handler
  - Wave 5: Rewrite `src/proxy.ts` to check `better-auth.session_token` cookie instead of `clerkMiddleware`
  - Wave 6: Swap `verifyToken` in MCP routes to use Better Auth session
  - Wave 7: Create `agent/auth/better-auth.ts`, delete `clerk-auth.ts` + ESM loader scripts
  - Wave 8: `npm uninstall @clerk/nextjs @clerk/backend @clerk/mcp-tools @clerk/types`, remove Clerk env vars, verify 0 Clerk imports

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
- `apps/workspace/src/domains/eve/client.ts`: Singleton Eve Client factory
- `apps/workspace/src/domains/eve/hooks/use-eve-chat.ts`: `useEveChat` hook wrapping `useEveAgent`
- `apps/workspace/src/domains/eve/index.ts`: Eve module barrel export
- `apps/workspace/src/components/dashboard/eve-dashboard-chat.tsx`: Eve-powered DashboardChat
- `apps/workspace/src/domains/dashboard/components/dashboard-screen.tsx`: Feature-flag dispatcher (`?eve=1`)
- `agent/subagents/custom-role-manager/agent.ts`: Custom-role-manager subagent definition
- `agent/subagents/custom-role-manager/tools/create.ts`, `list.ts`, `update.ts`, `delete.ts`: Subagent role tools
- `agent/tools/spaces-list.ts`, `spaces-get.ts`, `spaces-create.ts`, `spaces-update.ts`, `spaces-delete.ts`: Eve space tools
- `agent/tools/space-members-list.ts`, `space-members-add.ts`, `space-members-remove.ts`, `space-members-update-role.ts`: Eve space member tools
- `agent/lib/action-workflow.ts`: `OrganizationResource` type now includes `"space"`
- `convex/organizations/profile/access.ts`: `canUseResourceAction` validator includes `v.literal("space")`
- `apps/workspace/scripts/eve-esm-loader.mjs`: Node.js ESM hooks module — resolves `next/*` bare specifiers, extends extensionless Clerk imports, handles JSON import attributes
- `apps/workspace/scripts/eve-esm-init.mjs`: Loader entry point — calls `register()` with loader path derived from `import.meta.url`
- `apps/workspace/agent/auth/clerk-auth.ts`: Clerk auth handler for Eve (moved from `channels/auth.ts` to avoid Eve auto-discovery as channel)
- `apps/workspace/agent/channels/eve.ts`: Eve channel config — imports `clerkAuth` from `../auth/clerk-auth`
- `apps/workspace/src/domains/eve/client.ts`: Per-org Eve Client factory (`Map<string, Client>`)
- `apps/workspace/src/domains/eve/hooks/use-eve-chat.ts`: `organizationId` option, `restoreAttempted` guard
- `apps/workspace/src/domains/eve/threads-store.ts`: Org-scoped IndexedDB thread storage (`thread:${orgId}:${id}`)
- `apps/workspace/agent/auth/clerk-auth.ts`: Server-side `X-Organization-Id` header vs JWT validation
- `apps/workspace/agent/instructions/user-role.ts`: Dynamic instruction injecting user role
- `apps/workspace/src/domains/storage/use-indexeddb-config.ts`: Async IndexedDB-backed config hook
- **Accept-Invite Round 2** — `CalendarPageRedesigned.tsx:7` had wrong CSS path (`@svar-ui/react-calendar/calendar.css` → `@svar-ui/react-calendar/style.css`). This was breaking the entire Next.js dev error page, so every API call returned 500 with the CSS error. Fixed. Also: extended `organizationRequestSafetyMiddleware` to apply to all routes (was `/:organizationId/*` only, missing `/invite-links/accept` and `/invitations/accept`); added `getSessionUserId()` to `clerk-convex.ts` (uses `getAuth(request, ...)` with AsyncLocalStorage-stored request, since `auth()` from `@clerk/nextjs/server` doesn't work in Hono handlers); updated `invite-links.ts` to use `getSessionUserId` and `coerceRole()` to add `org:` prefix; updated `clerk-organization-proxy.ts` to use request context; wrapped `clerk.setActive` in try/catch in accept-invite screen (handles session-not-yet-refreshed case after server-side membership add).
- **Organization Member Flow Fix** — `@clerk/backend@3.10.0` does not have `getOrganizationRoleList`, `createOrganizationRole`, `updateOrganizationRole`, or `deleteOrganizationRole`. These were being called from `clerk-organization-proxy.ts` and throwing at runtime, causing every member-related action to fail with "Organization action failed." Fixed: `list-roles` path now returns built-in roles (owner, admin, member) only; create/update/delete-role paths now throw descriptive errors about Clerk version requirement. Also added missing `GET /:organizationId/invitations` route and `handleListOrganizationInvitations` handler (was returning 404). Added `[action-error]` logging to `action-error.ts` that surfaces actual error messages in dev mode.
- **Base UI `asChild` Fix** — `@base-ui/react/popover` uses `render` prop, not `asChild` (Radix API). Two `PopoverTrigger asChild` usages in `sidebar-inbox-panel.tsx` were causing nested `<button>` hydration errors and `asChild` DOM warnings. Fixed by replacing `asChild` with `render` prop.
- **Clerk→BetterAuth Wave 4 – Client-Side Cleanup (this session)**: Rewrote `choose-organization-client.tsx`, `accept-invite-screen.tsx`, `no-organization-modal.tsx` to use Better Auth hooks. Rewrote `use-account-context.ts` removing `@clerk/nextjs` imports. Deleted `use-headless-clerk-auth.ts` + test. Rewrote `onboarding/page.tsx`. Updated barrel exports and `auth-access-screen.tsx`. Deprecated `clerkMembershipOrganizationIds`. Remaining Clerk imports: `proxy.ts` (Wave 5), MCP routes (Wave 6), `clerk-organization-proxy.ts` + `invite-links.ts` (Wave 4 server), `clerk-convex.ts` (Wave 7/8), Eve `clerk-auth.ts` (Wave 7).
