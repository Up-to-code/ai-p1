# Tests

## Existing tests

Confirmed by `rg` over the workspace and packages:

- **No test** for `pipeline-board.tsx` (`packages/our-platform-components`)
- **No test** for `widget-grid.tsx` (`packages/our-platform-components`)
- **No test** for `workspace-widgets.tsx` (`apps/workspace/src/domains/workspace/components/`)
- **No test** for `crud-ui/status.tsx::StatusPill` or `EmptyWorkspace` (`apps/workspace/src/components/shared/crud-ui/`)
- **No test** for `DepartmentDot`, `FilterChipBar`, `ListItem*` (`packages/ui/src/components/ui/`)
- **No test** for `PopoverMenu` (currently inline in `pipeline-board.tsx:36-93`)
- **No test** for `EditableText` (`apps/workspace/src/components/ui/editable-text.tsx`) — but used in 11 files

The pattern is: **the puzzle pieces have no test surface, which is exactly why the work is shallow today.** The extractions create the test surface for the first time.

## Per-pass parity checks

### Pass 1 — PopoverMenu extraction
- **Visual:** open clients-screens, drag a card, click the kebab on a card → menu appears identical to before.
- **Behavior:** click "Open" → navigates. Click "Delete" → confirms then deletes. Click outside → menu closes. Press Escape → menu closes.
- **Existing test:** none. **Add:** `packages/our-platform-components/src/popover-menu/popover-menu.test.tsx` — render with two items, click trigger, assert menu appears; click outside, assert menu disappears; press Escape, assert menu disappears.

### Pass 7 — use-sortable-board hook extraction
- **Visual:** drag a card between stages → card lands in target stage, persists across refetch.
- **Behavior:** no `removeChild` console error. Same-column reorder works. Cross-column drag works.
- **Existing test:** none. **Add:** a smoke test that mounts the hook against a fake DOM (or skip — SortableJS requires real DOM, hard to unit test, easier to test manually in `clients-screens`).
- **Manual:** open `clients-screens`, drag 5 cards between stages, refresh the page, verify positions persist.

### Pass 8 — PipelineStageIndicator
- **Visual:** render in clients/projects detail tab with `variant="dots"`, `variant="strip"`, `variant="breadcrumb"`. All three should fit in their target surface.
- **Behavior:** current stage is highlighted. Past stages are colored. Future stages are muted.
- **Existing test:** none. **Add:** `packages/our-platform-components/src/pipeline/pipeline-stage-indicator.test.tsx` — render with 5 stages, current = stage 2, assert stages 0+1 are colored, stage 2 has the highlight class, stages 3+4 are muted.

### Pass 9 — ProgressBar
- **Visual:** render in workspace-right-sidebar at 62% — the bar should be 62% wide.
- **Behavior:** value=0 → empty. value=100 → full. value=NaN → empty.
- **Existing test:** none. **Add:** `packages/our-platform-components/src/feedback/progress-bar.test.tsx` — render at value=0, 50, 100; assert width is `0%`, `50%`, `100%`.

### Pass 10 — ColorDot
- **Visual:** render at the 16+ replacement sites — each should be identical to the inlined version.
- **Behavior:** color prop accepts `#hex`, `rgb()`, named colors. Size prop `sm`/`md` selects `h-2`/`h-3`.
- **Existing test:** none for `DepartmentDot`. **Add:** `packages/ui/src/components/ui/color-dot.test.tsx` — assert rendering at two sizes, two colors.

### Pass 12 — EmptyState
- **Visual:** render in `clients-screens` (which currently uses `EmptyWorkspace`) — should look identical.
- **Behavior:** size prop `sm | md | lg` selects different padding. Icon optional. Description optional.
- **Existing test:** none. **Add:** `packages/ui/src/components/ui/empty-state.test.tsx` — render with and without icon, assert DOM structure.

### Pass 14 — StatusPill
- **Visual:** render the three existing entry points (workspace `StatusPill`, `packages/ui/admin/StatusBadge`, `packages/ui/src/components/ui/status-badge.tsx`) — all should produce identical output for the same inputs.
- **Behavior:** the unified API must accept the union of all three existing prop shapes.
- **Existing test:** none for any of the three partials. **Add:** `packages/ui/src/components/ui/status-pill.test.tsx` — render with each tone (success/warning/danger/info/neutral), assert class names.

### Pass 20 — workspace-widgets.tsx split
- **Visual:** render `apps/workspace/src/app/[locale]/(app)/ws/_pages/overview-view.tsx` (the consumer) — should be byte-for-byte identical.
- **Behavior:** no behavior change, just file split.
- **Existing test:** none. **Add:** none (split only).

## Per-pass manual smoke test (full sweep)

After each phase completes, run:
1. `cd apps/workspace && npm run dev` — start dev server.
2. Open `/clients` — verify pipeline board, list view, calendar view all render.
3. Open `/deals` — verify deal board renders.
4. Open `/ws` — verify widget grid renders.
5. Open `/projects` — verify list/board/table views render.
6. Open `/clients/{id}` — verify detail page renders.
7. Drag a card in the clients pipeline. Verify no console errors, position persists across refresh.
8. Run `cd apps/workspace && npx tsc --noEmit` — verify 0 type errors.
9. Run `cd packages/our-platform-components && npx tsc --noEmit` — verify 0 type errors.
10. Run `cd packages/ui && npx tsc --noEmit` — verify 0 type errors.
