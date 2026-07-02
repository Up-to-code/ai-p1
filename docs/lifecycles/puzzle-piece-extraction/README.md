# Puzzle-Piece Extraction

## Purpose

Apply the puzzle-piece principle across the workspace UI: every UI element that appears in 2+ places, or that carries its own state/logic/style, becomes a deep, shareable module — owned by `@qentrah/ui` (primitives) or `@qentrah/our-platform-components` (domain-shared) and imported wherever it's used. The work covers **13 puzzle pieces** organized as a sequence of small, reviewable passes.

## Owner

- **App:** `apps/workspace/` (consumer side)
- **Design system:** `packages/ui/`
- **Domain-shared package:** `packages/our-platform-components/`

## Current State

- **God components:** `pipeline-board.tsx` (709 lines = 5 modules), `widget-grid.tsx` (438 lines = 2 modules), `workspace-widgets.tsx` (428 lines = 6 widgets in one file)
- **Built-but-unused exports:** `DepartmentDot` (0 callers), `FilterChipBar` (0), `ListItem*` (1), `EmptyState` (5), `StatusBadge × 3` partials
- **Inlined copies across workspace:** 100+ duplications of patterns that should be a single module

## Proposed Module Boundaries

### Package: `@qentrah/our-platform-components` (domain-shared)
```
src/
  pipeline/                       (was 1 file, becomes a folder)
    pipeline-board.tsx            (orchestrator, ~100 LOC after split)
    pipeline-stage-indicator.tsx  (NEW — user-flagged missing puzzle)
    popover-menu.tsx              (extracted from pipeline-board.tsx:36-93)
    inline-new-card.tsx           (extracted from pipeline-board.tsx:339-402)
    card-default.tsx              (extracted from pipeline-board.tsx:122-337)
    card-inline-new.tsx           (re-export from inline-new-card)
    card-footer-actions.tsx       (extracted, bottom action row)
    column.tsx                    (extracted, column shell)
    column-header.tsx             (extracted, name + count + "new" + add)
    column-options-menu.tsx       (extracted, rename/delete)
    count-badge.tsx               (extracted, count pill)
    new-badge.tsx                 (extracted, "New" gradient indicator)
    stage-bar.tsx                 (extracted, top color bar)
    stage-color.ts                (extracted, badgeBgFor + STAGE_BADGE_BG)
    use-sortable-board.ts         (extracted, SortableJS hook + revert workaround)
    types.ts                      (existing, unchanged)
    index.ts                      (barrel re-exports)
  feedback/
    progress-bar.tsx              (NEW — replaces 9+ inlined copies)
  popover-menu/                   (NEW — or lives inside pipeline/, decided in pass 1)
    popover-menu.tsx
```

### Package: `@qentrah/ui` (primitives)
```
src/components/ui/
  color-dot.tsx                   (NEW — generalized from DepartmentDot, replaces 16+ inlined)
  color-swatch.tsx                (NEW — replaces 4 inlined)
  progress-bar.tsx                (re-export from our-platform-components, or local copy)
  empty-state.tsx                 (NEW — promoted from EmptyWorkspace with size prop, replaces 12+ inlined)
  filter-chip.tsx                 (NEW — exposes FilterChipBar, replaces 5+ inlined)
  legend-item.tsx                 (NEW — color + label + value trio, replaces 6+ inlined)
  list-row.tsx                    (NEW — workspace-flavored ListItem variant, replaces 10+ inlined)
  status-pill.tsx                 (NEW — unified from 3 partials, replaces 8+ inlined)
  tag-chip.tsx                    (NEW — replaces 12+ inlined)
src/components/ui/
  editable-title.tsx              (NEW — sibling of EditableText, replaces 6+ inlined)
```

### Workspace: `apps/workspace/src/`
```
domains/workspace/components/
  workspace-widgets.tsx           (split into 6+ files)
  widgets/
    metric-card.tsx
    metric-cards.tsx
    ai-brain-widget.tsx
    folders-widget.tsx
    portfolio-widget.tsx
    calendar-today-widget.tsx
    recent-conversations-widget.tsx
    docs-widget.tsx
    section-label.tsx
    widget-header.tsx
```

## Pass List (dependency-ordered)

Each pass is a single reviewable PR-sized chunk. Touch one puzzle piece + its consumers. No bundle-up.

| # | Pass | Puzzle | Source → Target | Files touched (approx) |
|---|------|--------|-----------------|------------------------|
| 1 | Extract `PopoverMenu` from `pipeline-board.tsx` | PopoverMenu | inline @ pipeline-board.tsx:36-93 → `packages/our-platform-components/src/popover-menu/popover-menu.tsx` | 1 new + 1 edit + 6+ inlined → 1 import |
| 2 | Extract `stage-color` (color math) | `badgeBgFor` + `STAGE_BADGE_BG` | inline @ pipeline-board.tsx:9-26 → `packages/our-platform-components/src/pipeline/stage-color.ts` | 1 new + 1 edit |
| 3 | Extract column header pieces | `count-badge`, `new-badge`, `stage-bar`, `column-header` | inline @ pipeline-board.tsx:531-585 → 4 new files | 4 new + 1 edit |
| 4 | Extract `column-options-menu` | column rename/delete popover | inline @ pipeline-board.tsx:586-619 → `packages/our-platform-components/src/pipeline/column-options-menu.tsx` | 1 new + 1 edit |
| 5 | Extract `InlineNewCard` | inline create form | inline @ pipeline-board.tsx:339-402 → `packages/our-platform-components/src/pipeline/inline-new-card.tsx` | 1 new + 1 edit + 6+ inlined → 1 import |
| 6 | Extract `card-default` + `card-footer-actions` | DefaultCard | inline @ pipeline-board.tsx:122-337 → 2 new files | 2 new + 1 edit |
| 7 | Extract `use-sortable-board` hook | SortableJS lifecycle + revert workaround | inline @ pipeline-board.tsx:434-510 → `packages/our-platform-components/src/pipeline/use-sortable-board.ts` | 1 new + 1 edit |
| 8 | Build `PipelineStageIndicator` (user-flagged) | progress at any stage | NEW → `packages/our-platform-components/src/pipeline/pipeline-stage-indicator.tsx` | 1 new + 1 doc example (no consumers yet) |
| 9 | Build `ProgressBar` | horizontal % bar | NEW → `packages/our-platform-components/src/feedback/progress-bar.tsx` | 1 new + 9+ inlined → 1 import |
| 10 | Generalize `DepartmentDot` → `ColorDot` | small color circle | `packages/ui/src/components/ui/department-dot.tsx` → `color-dot.tsx` | 1 rename + 1 generalize + 16+ inlined → 1 import |
| 11 | Wire up `FilterChipBar` | filter trigger button | existing `@qentrah/ui` → expose + use | 1 import + 5+ inlined → 1 import |
| 12 | Promote `EmptyState` | empty placeholder | `apps/workspace/.../status.tsx::EmptyWorkspace` → `packages/ui/src/components/ui/empty-state.tsx` | 1 promote + 12+ inlined → 1 import |
| 13 | Fix `ListItem*` for workspace, or build `ListRow` | clickable row | fix theme tokens or build workspace variant | 1 fix + 10+ inlined → 1 import |
| 14 | Build `StatusPill` (unify 3 partials) | status pill | NEW → `packages/ui/src/components/ui/status-pill.tsx` | 1 new + 8+ inlined → 1 import |
| 15 | Build `ColorSwatch` | selectable color circle | NEW → `packages/ui/src/components/ui/color-swatch.tsx` | 1 new + 4 inlined → 1 import |
| 16 | Build `LegendItem` | color + label + value trio | NEW → `packages/ui/src/components/ui/legend-item.tsx` | 1 new + 6+ inlined → 1 import |
| 17 | Build `TagChip` | rounded tag pill | NEW → `packages/ui/src/components/ui/tag-chip.tsx` | 1 new + 12+ inlined → 1 import |
| 18 | Add `EditableTitle` | click-to-edit text | NEW → `apps/workspace/src/components/ui/editable-title.tsx` | 1 new + 6+ inlined → 1 import |
| 19 | Split `WidgetGrid` (2 modules) | `WidgetShell` | inline @ widget-grid.tsx:285 → `widget-grid/widget-shell.tsx` | 1 new + 1 edit |
| 20 | Split `workspace-widgets.tsx` (6 widgets) | per-widget | inline → `domains/workspace/components/widgets/*.tsx` | 7+ new + 1 delete + 1 refactor at call sites |
| 21 | Wire `PipelineStageIndicator` into deal-board / client-table-view | consumes pass 8's puzzle | NEW consumers | 2-3 edits |

## What Stays Behind the Seam (per pass)

- **Pass 1-7 (extraction):** zero behavior change. The extraction is a rename + move + import. Visual output is byte-for-byte identical.
- **Pass 8, 9, 10, 12, 14, 15, 16, 17, 18 (new puzzles):** puzzle appears in the design system; old inlined copies still work; we do the wiring-up sweep in subsequent passes or bundled with the same pass.
- **Pass 11, 13, 19, 20 (wiring / splits):** zero behavior change.
- **Pass 21 (consumer adoption):** zero behavior change — first consumer is the deal board which already needs the affordance.

## What Tests Survive

- No existing test file covers any of these 13 patterns directly (verified — `rg` confirms no `pipeline-board.test.ts`, no `widget-grid.test.ts`, etc.).
- New puzzles will be added with one smoke test each (Vitest) in the package they live in.
- The workspace's `vitest.workspace-aliases.mjs` already aliases workspace packages, so test infrastructure is ready.

## Risks

- **Risk 1 — SortableJS revert workaround (pass 7).** The lines 477-495 in pipeline-board.tsx are commented as critical. Extracting to a hook must preserve the DOM mutation sequence. **Parity check:** drag a card between stages in `clients-screens.tsx`; verify no `removeChild` console error and the move persists after refetch.
- **Risk 2 — Theme tokens on `ListItem*` (pass 13).** The explore flagged that `text-text-primary`, `dark:text-white/90` tokens may not be set. If they're not, the work splits: (a) fix tokens, or (b) build a workspace-flavored `ListRow` instead. Pick one — the token fix is broader, the variant is local.
- **Risk 3 — `StatusPill` value-based semantics (pass 14).** Three partials encode different things: enum tones (success/warning/danger), value-mapped badges (active/inactive/pending), variant tables. The unified API must not lose any of those — pick a discriminated union.
- **Risk 4 — `PipelineStageIndicator` semantics (pass 8).** Three variants (dots | strip | breadcrumb) imply different levels of detail. Pick the right variant per surface: dots in table cells (small, 12-16px), strip in detail headers, breadcrumb in card-internal progress. Document the surface-to-variant mapping in the component README.

## Convention Notes

- All new puzzle pieces follow the existing pattern in `packages/ui/src/components/ui/`: a single file per concept, default export, props interface named `*Props`, barrel re-exported from `index.ts`.
- `packages/our-platform-components/src/pipeline/*` re-exports the public surface from `index.ts` for backward compat with current `import { PipelineBoard } from "@qentrah/our-platform-components"`.
- Workspace consumers migrate by changing one import path per call site. No behavior change at the call site.
- Component-registry.json gets a new entry per new puzzle piece (per the component-registry-schema convention in `convex-nextjs-refactor`).

## Open Questions

1. Where does `PopoverMenu` live: `packages/our-platform-components/src/popover-menu/` (its own folder, since it's used by non-pipeline consumers) or `packages/our-platform-components/src/pipeline/popover-menu.tsx` (folded into pipeline, since PipelineBoard is its main caller)? — **Recommended: own folder.** It's generic.
2. Does `ColorDot` replace `DepartmentDot` outright, or live alongside? — **Recommended: replace, delete `DepartmentDot` after wiring.**
3. Does `EmptyState` replace `EmptyWorkspace` outright, or live alongside? — **Recommended: replace, keep `EmptyWorkspace` as a re-export for one release, then remove.**
4. For `StatusPill`, do we keep the existing `crud-ui/status.tsx::StatusPill` and `packages/ui/src/components/ui/status-badge.tsx` and `packages/ui/src/admin/StatusBadge.tsx` as re-exports of the new unified one? — **Recommended: yes, keep the three existing entry points as thin re-exports, all pointing to the new unified module.** No consumer import paths change.
