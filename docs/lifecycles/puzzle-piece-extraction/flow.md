# Flow

## Current flow (the "scattered puzzle pieces" state)

1. Workspace screen renders a kebab menu → inlines `setShowMenu + absolute div + bg-card + border-border + rounded-lg + shadow-lg` (6+ copies).
2. Workspace screen renders a progress bar → inlines `h-1.5 w-full bg-muted rounded-full overflow-hidden` + inner `h-full bg-primary rounded-full transition-all` (9+ copies).
3. Workspace screen renders a small color dot → inlines `h-2 w-2 rounded-full` + `style={{ backgroundColor }}` (16+ copies, 25+ occurrences).
4. Workspace screen renders an empty state → inlines `rounded-xl border border-dashed border-border p-8 text-center text-sm` (12+ copies).
5. Workspace screen renders a status pill → inlines `bg-emerald-500/10 text-emerald-600 border-emerald-500/20` palette (8+ copies).
6. `@qentrah/ui` exports `DepartmentDot`, `FilterChipBar`, `ListItem*`, `EmptyState`, `StatusBadge` — but they are bypassed in favor of inlined copies.
7. `packages/our-platform-components/src/pipeline/pipeline-board.tsx` keeps 5 distinct UI concepts in one file (`PopoverMenu`, `DefaultCard`, `InlineNewCard`, `stage-color math`, `columnHeader`).
8. `packages/our-platform-components/src/widget-grid/widget-grid.tsx` keeps 2 concepts in one file.
9. `apps/workspace/src/domains/workspace/components/workspace-widgets.tsx` keeps 6 widgets in one file.

## After (the "puzzle-piece" state)

1. Workspace screen renders a kebab menu → `import { PopoverMenu } from "@qentrah/our-platform-components"` → one import, one line.
2. Workspace screen renders a progress bar → `import { ProgressBar } from "@qentrah/our-platform-components"` → one import, one line.
3. Workspace screen renders a color dot → `import { ColorDot } from "@qentrah/ui"` → one import, one line.
4. Workspace screen renders an empty state → `import { EmptyState } from "@qentrah/ui"` → one import, one line.
5. Workspace screen renders a status pill → `import { StatusPill } from "@qentrah/ui"` → one import, one line.
6. The design-system exports that already exist (`DepartmentDot` → `ColorDot`, `FilterChipBar` → exposed, `ListItem*` → workspace variant, `EmptyState` → promoted, `StatusBadge × 3` → unified) are the canonical source of truth.
7. `pipeline/pipeline-board.tsx` becomes a 100-line orchestrator against 15+ imported deep modules in `packages/our-platform-components/src/pipeline/`.
8. `widget-grid.tsx` becomes a thin wrapper around `WidgetShell` + a layout module.
9. `workspace-widgets.tsx` becomes 6+ thin files in `apps/workspace/src/domains/workspace/components/widgets/`.

## Pass dependency graph

```
Phase 1 (extract from god components)
  1: PopoverMenu ───────────────────┐
  2: stage-color ────────┐          │
  3: column-header pieces │          │
  4: column-options-menu  │          │
  5: InlineNewCard ──────┐│          │
  6: card-default ───────┤│          │
  7: use-sortable-board  ││          │
  19: WidgetShell        ││          │
  20: workspace-widgets split        │
                                   │
Phase 2 (new domain-shared)         │
  8: PipelineStageIndicator ────────┤
  9: ProgressBar ───────────────────┤

Phase 3 (new primitives in @qentrah/ui)
  10: ColorDot ────────┐
  11: FilterChip ─────┤
  12: EmptyState ─────┤
  13: ListRow ────────┤
  14: StatusPill ─────┤
  15: ColorSwatch ────┤
  16: LegendItem ─────┤
  17: TagChip ────────┤

Phase 4 (workspace-flavored)        │
  18: EditableTitle ──────────────── │

Phase 5 (consumer adoption sweep)
  21+: replace all 100+ inlined copies with imports
```

## Execution order

Phase 1 first (extracts the buried puzzles from the package — these are the ones where the puzzle already exists, just locked inside a file). Then Phase 2 (new domain-shared puzzles). Then Phase 3 + 4 (new primitives). Then Phase 5 (sweep the workspace to import from the new modules).

Each pass is independent — any one can be skipped or reordered without breaking the others. The dependency graph is a *preference* (extract before wire up) not a hard requirement.
