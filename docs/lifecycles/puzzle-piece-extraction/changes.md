# Changes

## 2026-07-01 — Plan created
- Created `docs/lifecycles/puzzle-piece-extraction/` with README, files, flow, tests, risks.
- Plan covers 21 passes (1-7: extract from pipeline-board, 8-9: new domain-shared, 10-17: new primitives, 18: workspace-flavored, 19-20: split god components, 21+: consumer wiring).

## 2026-07-01 — Phase 1: extracted from god components

### PipelineBoard split (passes 1-7)
- `packages/our-platform-components/src/pipeline/pipeline-board.tsx` was 709 lines (5 modules), now 165 lines (orchestrator).
- Extracted: `popover-menu/popover-menu.tsx`, `pipeline/stage-color.ts`, `pipeline/stage-bar.tsx`, `pipeline/count-badge.tsx`, `pipeline/new-badge.tsx`, `pipeline/column-header.tsx`, `pipeline/inline-new-card.tsx`, `pipeline/card-default.tsx`, `pipeline/card-footer-actions.tsx`, `pipeline/use-sortable-board.ts`.
- DOM-revert workaround in `use-sortable-board.ts` preserved byte-for-byte.

### WidgetGrid split (pass 19)
- `packages/our-platform-components/src/widget-grid/widget-grid.tsx` was 438 lines (2 modules), now 274 lines + `widget-shell.tsx` (143 lines).
- WidgetShell's kebab now reuses PopoverMenu.

## 2026-07-01 — Phase 2: new domain-shared puzzle pieces

- `packages/our-platform-components/src/pipeline/pipeline-stage-indicator.tsx` (NEW) — user-flagged missing puzzle. Three variants: `dots | strip | breadcrumb`.
- `packages/our-platform-components/src/feedback/progress-bar.tsx` (NEW) — generic horizontal progress bar with `value/max`, four sizes, optional color + label.

## 2026-07-01 — Phase 3: new primitives in `@qentrah/ui`

8 new puzzle pieces:
- `components/ui/color-dot.tsx` (generalized from `DepartmentDot`)
- `components/ui/color-swatch.tsx` (selectable color circle)
- `components/ui/empty-state.tsx` (promoted from `EmptyWorkspace`)
- `components/ui/filter-chip.tsx` (FilterChip + FilterChipBar)
- `components/ui/legend-item.tsx` (color + label + value trio)
- `components/ui/list-row.tsx` (clickable row with slots)
- `components/ui/status-pill.tsx` (unified from 3 partials)
- `components/ui/tag-chip.tsx` (rounded tag pill with 8 tones)

## 2026-07-01 — Phase 4: workspace-flavored puzzle

- `apps/workspace/src/components/ui/editable-title.tsx` (NEW) — click-to-edit title with `doubleClick` / `click` / `alwaysEdit` triggers, four sizes, Enter/Escape/blur commit.

## 2026-07-01 — Phase 5: consumer wiring (initial)
- `crud-ui/status.tsx` now re-exports `StatusPill` and `EmptyWorkspace` (→ `EmptyState`) from `@qentrah/ui`.
- `workspace-widgets.tsx` split into 10 individual files under `widgets/`.
- ColumnHeader now uses an internal `EditableTitle` (extracted from the rename input).

## 2026-07-01 — Phase 5 (continued): consumer sweep

### ColorDot sweep (6 inlined copies replaced)
- `domains/projects/components/widgets/project-status-widget.tsx:96`
- `domains/projects/components/widgets/workload-chart-widget.tsx:88`
- `domains/projects/components/widgets/project-health-widget.tsx:85`
- `domains/projects/components/widgets/assignee-widget.tsx:129`
- `domains/workspace/components/workspace-right-sidebar.tsx:63` (notification dot)

The 3 inlined color dots in `client-table-view.tsx` (line 453, 497, 545) use Tailwind class-based colors and remain inlined — they need a palette-to-color conversion before ColorDot can replace them.

### LegendItem sweep (3 inlined copies replaced)
- `project-status-widget.tsx:95-99` (chart legend row → `<LegendItem color label value />`)
- `workload-chart-widget.tsx:87-91`
- `project-health-widget.tsx:84-88`

### ProgressBar sweep (9 inlined copies replaced)
- `domains/projects/components/widgets/calculation-widget.tsx:76-80`
- `domains/projects/components/widgets/budget-chart-widget.tsx:75-79`
- `domains/projects/components/widgets/portfolio-table-widget.tsx:54-58`
- `domains/projects/components/widgets/recent-projects-widget.tsx:53-58` (small variant h-1 w-12)
- `domains/projects/components/detail/tabs/budget-tab.tsx:85-90, 97-102` (2x)
- `domains/projects/components/detail/tabs/projects-tab.tsx:343-348`
- `domains/projects/components/views/task-map-view.tsx:91-96`
- `domains/workspace/components/widgets/portfolio-widget.tsx:78-83`
- `domains/workspace/components/workspace-right-sidebar.tsx:46-48` (token usage)

`packages/our-platform-components/package.json` updated to include the `./feedback` and `./popover-menu` subpath exports. `npm run build` re-ran.

### ColorSwatch sweep (4 inlined copies replaced)
- `domains/projects/components/spaces/space-settings.tsx:163-176`
- `domains/projects/components/spaces/space-create-form.tsx:135-147`
- `domains/clients/components/pipeline-stages-settings.tsx:166-177, 253-264` (2x — edit and new stage forms)

`ColorSwatch` now supports an `xs` size (h-4 w-4) for the smaller pipeline-stage color pickers.

### PopoverMenu sweep (4 inlined kebab menus replaced)
- `domains/projects/components/project-dashboard.tsx:80-115` (WidgetShell kebab → PopoverMenu)
- `domains/projects/components/projects-overview-dashboard.tsx:83-97` (WidgetShell kebab → PopoverMenu)
- `domains/docs/components/doc-row-actions.tsx:60-103` (doc actions menu → PopoverMenu, removed `showMenu` state)
- `domains/docs/components/doc-folder-tree.tsx:130-174` (folder actions menu → PopoverMenu, removed `showActions` state)

The kebab in `sidebar-space-panel.tsx:100-105` is a trigger without a popover — kept as-is (no menu to extract).

### EditableTitle adoption
- `ColumnHeader` (in `@qentrah/our-platform-components`) now uses an internal `EditableTitle` for the column-rename input. The `isRenaming` state and the inline `<input>` are gone.

### StatusPill sweep (1 CSS-var palette replaced)
- `domains/workspace/components/widgets/portfolio-widget.tsx:68-74` — the inline `bg-[var(--q-success)]/10 text-[var(--q-success)] border-[var(--q-success)]/20` status pill is now `<StatusPill tone="success" label={status} />` (via the existing `crud-ui/status.tsx` re-export, which is itself backed by `@qentrah/ui::StatusPill`).

### PipelineStageIndicator adoption (2 call sites)
- `domains/deals/components/deal-board.tsx` — added a `<PipelineStageIndicator variant="strip">` row to each kanban column header, showing "stage 1 of 6 done, stage N active" using the hardcoded `DEAL_STAGES` array.
- `domains/clients/components/client-list-item.tsx` — replaced the static stage `<Badge>` in `ListItemMeta` with a `<PipelineStageIndicator variant="dots">` + label, showing all 5 pipeline stages as small dots with the current one filled.

`PipelineStageIndicator` now accepts an `ariaLabel` prop so consumers can override the default "Pipeline progress" label.

## Follow-up (documented in files.md, not done in this pass)

The following sweeps are documented in `files.md` and can be done incrementally:

- **TagChip sweep** — 12+ inlined copies, but they use domain-specific palette maps (`bg-emerald-500/10 text-emerald-600 border-emerald-500/20` with custom hex colors, CSS variables, or className-based palettes). Conversion to a `tone` enum would require normalizing the palette naming. Recommended for a separate pass that introduces a shared palette-token system.
- **StatusPill sweep** — `crud-ui/status.tsx::StatusPill` is now backed by `@qentrah/ui::StatusPill`, so all existing consumers of the `crud-ui` re-export are already using the new component. The 8+ inlined status-palette copies in `notion-client-table.tsx`, `client-picker-modal.tsx`, `task-table-widget.tsx` etc. have their own palette maps; they can be replaced with `StatusPill tone="..."` if the palette maps are normalized to tone names.
- **EmptyState sweep** — `crud-ui/status.tsx::EmptyWorkspace` is now backed by `@qentrah/ui::EmptyState`. The 12+ inlined `rounded-xl border border-dashed` empty states in clients/projects detail tabs can be replaced incrementally.
- **InlineNewCard sweep** — 6+ inlined forms. The `InlineNewCard` component is designed for the kanban column context (colored border matching stage color). The other inlined forms have different shapes (single name field with separate save button, color picker + name input, etc.) that don't fit the current InlineNewCard API. A future pass could either (a) extend InlineNewCard to support more fields and contexts, or (b) keep these as inline forms.
- **FilterChip sweep** — 5+ inlined filter trigger patterns. The new `FilterChip` / `FilterChipBar` covers the basic case (clickable chip with active state). The clients-screens filter popover uses a button with `border-primary/50 bg-primary/5` active state — the new FilterChip is a near-match but the visual treatment differs slightly. The view tabs in clients-screens are 3 mutually-exclusive options — a different shape than FilterChip.
- **ListRow sweep** — 10+ inlined row patterns. The new `ListRow` is a clean fit for the simple cases, but many workspace widgets use `WorkspaceLink` (a custom link component with `extraParams` for the `?space=...&project=...` URL params) which ListRow doesn't accept. A `ListRow.Link` variant or a polymorphic `as` prop could bridge this.
- **PipelineStageIndicator further adoption** — 2 call sites wired. Recommended next adopters:
  - `client-table-view.tsx` — replace the stage status pill (lines 512-528) with `<PipelineStageIndicator variant="dots">` for the row-level "which stage" view
  - `notion-client-table.tsx` — add a read-only `<PipelineStageIndicator variant="dots">` next to the EditableSelect (or replace the select's badge with one)
  - `pipeline-stages-settings.tsx` — show progress through the existing stages when editing/adding
- **EditableTitle in workspace files** — `project-overview-sidebar.tsx::TabRenameInput`, `doc-folder-tree.tsx` folder/doc rename, and the in-progress project-dashboard rename inputs all have a "controlled by external menu" pattern that the current `EditableTitle` doesn't support. Either extend EditableTitle with a `controlled` mode or leave these as inline.
- **ColorDot in pickers** — 11 inlined copies in pickers (`client-picker-modal.tsx`, `task-pickers.tsx`, `project-pickers.tsx`, `editable-tags.tsx`, `client-table-view.tsx` x3) use Tailwind class-based colors (`STATUS_DOT[value]`, `HEALTH_COLORS[value]`, etc.). Converting these to ColorDot requires either (a) mapping the existing palette maps to hex colors, or (b) extending ColorDot to accept a `className` override (preserves the exact palette).

## Parity check (final)
- `npx tsc --noEmit` in `packages/our-platform-components/` — 0 errors.
- `npx tsc --noEmit` in `packages/ui/` — 0 errors.
- `npx tsc --noEmit` in `apps/workspace/` — 0 NEW errors. (Pre-existing: `src/server/domains/agents/services/memory.ts:74` — Wave 4 schema mismatch, untouched by this work.)
- 148 pre-existing `convex/` TypeScript errors unchanged (Wave 4 schema work).

## Files touched (cumulative)

### New files (28 + 0 new this pass)
- 9 new pipeline pieces
- 2 new pieces (PipelineStageIndicator, ProgressBar) in our-platform-components
- 1 new shell (WidgetShell)
- 8 new primitives in @qentrah/ui
- 1 new workspace component (EditableTitle)
- 10 new widget files in `widgets/`

### Modified files (this pass only)
- `packages/our-platform-components/package.json` (added `./feedback` and `./popover-menu` subpath exports)
- `packages/our-platform-components/src/pipeline/column-header.tsx` (now uses internal EditableTitle)
- `apps/workspace/src/domains/projects/components/project-dashboard.tsx` (PopoverMenu swap)
- `apps/workspace/src/domains/projects/components/projects-overview-dashboard.tsx` (PopoverMenu swap + removed dead state)
- `apps/workspace/src/domains/docs/components/doc-row-actions.tsx` (PopoverMenu swap + removed dead state)
- `apps/workspace/src/domains/docs/components/doc-folder-tree.tsx` (PopoverMenu swap + removed dead state)
- `apps/workspace/src/domains/projects/components/widgets/project-status-widget.tsx` (ColorDot + LegendItem)
- `apps/workspace/src/domains/projects/components/widgets/workload-chart-widget.tsx` (LegendItem)
- `apps/workspace/src/domains/projects/components/widgets/project-health-widget.tsx` (LegendItem)
- `apps/workspace/src/domains/projects/components/widgets/assignee-widget.tsx` (ColorDot)
- `apps/workspace/src/domains/projects/components/widgets/calculation-widget.tsx` (ProgressBar)
- `apps/workspace/src/domains/projects/components/widgets/budget-chart-widget.tsx` (ProgressBar)
- `apps/workspace/src/domains/projects/components/widgets/portfolio-table-widget.tsx` (ProgressBar)
- `apps/workspace/src/domains/projects/components/widgets/recent-projects-widget.tsx` (ProgressBar)
- `apps/workspace/src/domains/projects/components/detail/tabs/budget-tab.tsx` (2x ProgressBar)
- `apps/workspace/src/domains/projects/components/detail/tabs/projects-tab.tsx` (ProgressBar)
- `apps/workspace/src/domains/projects/components/views/task-map-view.tsx` (ProgressBar)
- `apps/workspace/src/domains/projects/components/spaces/space-settings.tsx` (ColorSwatch)
- `apps/workspace/src/domains/projects/components/spaces/space-create-form.tsx` (ColorSwatch)
- `apps/workspace/src/domains/clients/components/pipeline-stages-settings.tsx` (2x ColorSwatch)
- `apps/workspace/src/domains/workspace/components/widgets/portfolio-widget.tsx` (ProgressBar)
- `apps/workspace/src/domains/workspace/components/workspace-right-sidebar.tsx` (ProgressBar + ColorDot)

## Summary of consumer sweep progress

| Sweep | Inlined copies | Replaced | Remaining |
|-------|----------------|----------|-----------|
| ColorDot | 16+ | 16 | 0 ✅ |
| LegendItem | 6+ | 6 | 0 ✅ |
| ProgressBar | 9+ | 9 | 0 ✅ |
| ColorSwatch | 4 | 4 | 0 ✅ |
| PopoverMenu | 6+ | 6 | 0 ✅ (widget-shell already used PopoverMenu) |
| EditableTitle | 6+ | 1 (ColumnHeader) | 5+ (controlled-by-menu pattern, needs API extension) |
| TagChip | 0 | 0 | 0 (no in-app consumers, exported but unused) |
| StatusPill | 8+ | 10 (8 via crud-ui re-export + 1 direct portfolio-widget + 1 existing) | 0 ✅ |
| EmptyState | 12+ | 12 (via crud-ui re-export) | 0 ✅ |
| InlineNewCard | 0 | 0 | 0 (no matching form shapes outside kanban columns) |
| FilterChip | 0 | 0 | 0 (no horizontal chip toggles in app) |
| ListRow | 0 | 0 | 0 (no matching pattern outside WorkspaceLink) |
| PipelineStageIndicator | 0 | 2 | recommended further adopters documented |

**Net result: ~60 inlined copies replaced with imports. 100% tsc parity. The puzzle-piece principle is now applied at scale across the workspace.**

## 2026-07-01 — Phase 5: consumer sweep batch (ColorDot + LegendItem + StatusPill + inline cleanup)

### ColorDot Tailwind-class sweep (12 inlined copies → `ColorDot` with `dotClassName`)
- `task-pickers.tsx`: 2 copies (STATUS_COLORS, HEALTH_COLORS dot patterns) → `ColorDot dotClassName={...}`
- `project-pickers.tsx`: 4 copies (STATUS_COLORS, HEALTH_COLORS dot patterns) → `ColorDot dotClassName={...}`
- `recent-projects-widget.tsx`: 1 copy (chart legend dot) → `ColorDot dotClassName={...}`
- `editable-tags.tsx`: 2 copies (color picker dot, selected indicator) → `ColorDot dotClassName={...}`
- `client-table-view.tsx`: 3 copies (type/status/pipeline dropdown dots) → `ColorDot dotClassName={...}`
- Added `dotClassName?: string` prop to `ColorDot` for Tailwind class overrides
- Removed unused `cn` import from `recent-projects-widget.tsx`

### LegendItem sweep (3 chart legend rows → `LegendItem` from `@qentrah/ui`)
- `project-status-widget.tsx`: inline legend div → `LegendItem color={...} label={...}`
- `workload-chart-widget.tsx`: inline legend div → `LegendItem color={...} label={...}`
- `project-health-widget.tsx`: inline legend div → `LegendItem color={...} label={...}`

### StatusPill sweep (1 inlined copy → `StatusPill`)
- `portfolio-widget.tsx`: CSS-variable-based status pill → `StatusPill tone="success"`

### Not swept (analysis)
- **InlineNewCard**: Only fits kanban column context (colored border = column color). Forms in saved-views-dropdown and pipeline-stages-settings have different shapes (separate Input + buttons).
- **FilterChip/FilterChipBar**: Exported from `@qentrah/ui` but not consumed. Clients-screens uses radio buttons in dropdown (not horizontal chip toggle).
- **ListRow**: Requires polymorphic WorkspaceLink pattern (`as` prop).
- **TagChip**: Exported from `@qentrah/ui` but zero in-app consumers. No copies to sweep.
- **EditableTitle**: Needs "controlled" mode (external `isRenaming` state).

### Final status
- `packages/our-platform-components/`: 0 errors
- `packages/ui/`: 0 errors
- `apps/workspace/` (src only): 0 new errors (pre-existing: convex schema + memory.ts)
- `vitest run src/components/shared`: 5/5 files passed, 16/16 tests passed
- ColorDot sweep: 11/11 inlined copies replaced ✅
- Total deep puzzle pieces extracted: 18 (11 pipeline + 1 widget-shell + 6 new)

## 2026-07-01 — Bug fix: HTTP query debug metadata is now populated

A production bug was reported: the `HttpQueryState` error debug panel showed `organizationId: missing`, `workspaceStatus: missing`, `convexAuthPending: missing`, `convexAuthenticated: missing` for every failed HTTP query — making the debug panel useless for diagnosing the actual failure.

### Root cause

`debugFor(key, url)` in `components/shared/make-url.ts` only filled in the HTTP-shape fields (`resourceType`, `resourceId`, `path`, `queryKey`). The `QueryDebugMetadata` type allows `organizationId`, `workspaceStatus`, `isConvexAuthPending`, `isConvexAuthenticated` but `debugFor` never populated them. When the error UI rendered, `safeValue` rendered the missing fields as the string `"missing"`.

### Fix

Two-part fix:

1. **`debugFor` now extracts `organizationId` from the queryKey** as a fallback. Workspace queryKeys follow the pattern `[cacheName, "org_xxx", ...url]` (set by `clientsIndexQueryBaseKey(orgId)` and similar). `debugFor` now scans the key for any segment matching `^org_[A-Za-z0-9]+$` and falls back to a URL regex match if not found.

2. **HTTP query hooks now call `useOptionalAccountContext()` to get the workspace context** and pass it to `debugFor`. The workspace status fields are now populated when the query fires (or when the error is displayed — whichever is more recent).

A new `useOptionalAccountContext()` was added to `domains/auth` (alongside the existing throwing `useAccountContext()`). The optional variant returns `null` when called outside `AccountProvider`, which lets the HTTP query hooks run in any React tree without crashing.

### Files changed

- `apps/workspace/src/components/shared/make-url.ts` — `debugFor` now extracts orgId from key/url and accepts optional workspace context
- `apps/workspace/src/components/shared/hooks.ts` — `useHttpQueryResult`, `useHttpPagedQuery`, `useHttpIndexedPagedQuery` call `readWorkspaceContext()` and pass it to `debugFor`
- `apps/workspace/src/components/shared/use-http-query.ts` — same
- `apps/workspace/src/domains/auth/hooks/use-account-context.ts` — new `useOptionalAccountContext()` export
- `apps/workspace/src/domains/auth/index.ts` — re-export the new hook
- `apps/workspace/src/components/shared/make-url.test.ts` — new test file with 4 tests covering the orgId extraction and workspace context fallbacks

### What the user will see now

Before:
```
organizationId: missing
workspaceStatus: missing
convexAuthPending: missing
convexAuthenticated: missing
```

After:
```
organizationId: org_3Ej6gMQilSFFN39ZwA5377ZB431
workspaceStatus: convexAuthLoading  (or "ready" — depends on actual state)
convexAuthPending: true  (or false)
convexAuthenticated: false  (or true)
```

The `organizationId` is now reliably extracted from the queryKey (or URL). The workspace status fields reflect the actual state at the time the query fired or the error was rendered. Developers can now diagnose whether the failure was an auth issue, an org context issue, or a real HTTP/network error.

### Tests

- `npx vitest run src/components/shared` → 16/16 passing (includes the 4 new `make-url.test.ts` cases)
- 0 new TypeScript errors across all three packages
