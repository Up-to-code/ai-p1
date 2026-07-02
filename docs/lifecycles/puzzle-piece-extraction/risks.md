# Risks

## Risk 1 — SortableJS DOM revert (pass 7)

**Severity: High if mishandled. The current `pipeline-board.tsx:477-495` contains a critical workaround.**

The SortableJS library physically moves a DOM node when you drag it. React's virtual DOM still thinks the node is in the original parent. The current code reverts the DOM move *before* React re-renders, then calls `onCardMove` which causes the React tree to re-render with the new order. The comment block explains the bug being avoided: `removeChild: node is not a child of this node`.

**Mitigation:** when extracting to `use-sortable-board.ts`, the revert logic must stay byte-for-byte identical. The hook should accept the columns as a `Map<string, HTMLDivElement>` ref, the same way the current code does. The `onEnd` callback inside the Sortable.create config must contain the same revert sequence.

**Verification:** drag a card between stages in `clients-screens`; verify no `removeChild` error in the console; refresh the page; verify position persists.

## Risk 2 — `ListItem*` theme tokens (pass 13)

**Severity: Medium. The existing `packages/ui/src/components/ui/list-item.tsx` family is used in 1 file because the theme tokens may not resolve in the workspace.**

The family uses tokens like `text-text-primary`, `dark:text-white/90` that may not be set in the workspace's theme. If they're not, the family renders unstyled in the workspace and gets bypassed in favor of inlined `bg-card hover:bg-muted/30 border-border` patterns.

**Mitigation:** before pass 13, check whether the tokens resolve. If they do, just wire up the existing family. If they don't, build a workspace-flavored `ListRow` with the explicit class strings the workspace uses (e.g. `bg-card`, `hover:bg-muted/30`, `border-border`) and skip the token issue.

**Verification:** render `ListItemContainer` in a test workspace page; if the styling looks right, wire it up. If not, fall back to building `ListRow`.

## Risk 3 — `StatusPill` semantics (pass 14)

**Severity: Medium. Three partials encode different things.**

The three existing implementations:
- `apps/workspace/src/components/shared/crud-ui/status.tsx::StatusPill` — tone enum (`success | warning | danger | info | neutral`)
- `packages/ui/src/admin/StatusBadge.tsx` — value-based mapping (30+ enum values to labels + colors)
- `packages/ui/src/components/ui/status-badge.tsx` — variant-based (`active | inactive | pending | warning | error`)

**Mitigation:** the unified `StatusPill` should accept a discriminated union:
- `tone: "success" | "warning" | "danger" | "info" | "neutral"` (from `crud-ui`)
- `value: SomeStatusEnum` (from admin) → resolved to tone + label via a lookup table
- `variant: "active" | "inactive" | "pending" | "warning" | "error"` (from status-badge) → resolved to tone via a small map

The three existing entry points (`crud-ui/StatusPill`, `admin/StatusBadge`, `ui/status-badge`) become thin re-exports that translate to the unified API. Consumer import paths don't change.

**Verification:** render each of the three existing entry points in a test page; assert identical output before/after the pass.

## Risk 4 — `PipelineStageIndicator` variant mapping (pass 8)

**Severity: Low. The user-flagged puzzle doesn't exist yet, so we get to design the surface mapping from scratch.**

Three variants (`dots | strip | breadcrumb`) imply different levels of detail. The mapping must be documented so consumers pick the right one:
- `dots` — table cells, small surfaces (12-16px). Each stage is a circle; past = colored, current = filled, future = muted.
- `strip` — detail view headers, full-width. Connected bar segments with stage names.
- `breadcrumb` — card-internal progress (e.g. inside PipelineBoard's DefaultCard). Inline text + chevrons.

**Mitigation:** the README for the component documents the surface-to-variant mapping. The component is one file, three variants, one prop. No risk to existing code.

**Verification:** visual review in three target surfaces (table cell, detail header, card internal).

## Risk 5 — `EmptyState` migration (pass 12)

**Severity: Low. `EmptyWorkspace` is in `crud-ui/status.tsx`; promoting to `EmptyState` in `@qentrah/ui` may cause import cycle issues.**

`@qentrah/ui` is a primitive package; if `crud-ui/status.tsx` (a workspace-local file) imports from `@qentrah/ui` to keep `EmptyWorkspace` as a re-export, that's fine. But the `@qentrah/ui` package itself must not import from `crud-ui`.

**Mitigation:** the new `EmptyState` lives in `packages/ui/src/components/ui/empty-state.tsx` and re-exports nothing from the workspace. The `crud-ui/status.tsx::EmptyWorkspace` becomes a one-line re-export: `export { EmptyState as EmptyWorkspace } from "@qentrah/ui"`. Consumer import paths don't change for one release; a follow-up pass deletes `EmptyWorkspace`.

**Verification:** import `EmptyState` directly from `@qentrah/ui` in a test page; render; assert.

## Risk 6 — Theme tokens used by `ListItem*` and others (cross-cutting)

**Severity: Low. The `text-text-primary` / `dark:text-white/90` pattern is used in several shared components; if those tokens aren't set, components render incorrectly.**

**Mitigation:** the puzzle-piece extraction itself doesn't introduce new theme tokens. If a puzzle piece needs a token that doesn't exist, add it to the design system first, then create the component. Per the convex-nextjs-refactor skill: "Hardcoded fallback colors/styles (`"#6b7280"`, etc.) inline in a hook or component are a smell too — pull from the central theme config, adding a token there first if one doesn't exist."

**Verification:** each new puzzle piece's render output matches the design-system theme at the call site.

## Rollback plan

Each pass is independent. If a pass breaks parity, the fix is:
- Revert the pass's commits (`git revert <commit-range>`).
- Or: keep the new module in place, but undo the consumer migration (one import path swap back).
- The god components (`pipeline-board.tsx`, `widget-grid.tsx`, `workspace-widgets.tsx`) are touched only after Phase 1 completes; before that, all extractions add new files, no deletions.
