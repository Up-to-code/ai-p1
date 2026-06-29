# Changes

- 2026-06-30 — Second pass: table feel + chip redesign + screen
  detection. Switched row hover + select tints from the
  blue/purple `--q-info` accent to the Qentrah secondary token
  (`--q-bg-secondary`) so the table reads as a surface, not a
  brand-coloured element. Bumped borders to use the real
  `--q-border` token (was the AG Grid auto-derived `0.04 alpha`
  wash) so dark-mode menu/modal borders are visible — no more
  "black on black" in dark mode, "black on white" in light mode.
  Reduced border radius from `8px` to `6px` on cards/inputs, and
  the AG Grid root to `6px` with a real 1px `--q-border` outline.
  Replaced the round `rounded-full` `StatusPill` and
  `PriorityFlag` cell renderers with a shadcn-style chip
  (`rounded-[6px]`, solid border, optional `onClick` makes it a
  `<button>` for keyboard a11y, with focus-visible ring, hover
  brightness, active scale). `QentrahTable` now also enables
  `enableCellChangeFlash: true` by default for cell-value motion.
  Added a new hook `useScreenDetection` in
  `packages/ui/src/qentrah-table/hooks/useScreenDetection.ts`
  (IntersectionObserver-based, with a `scrollIntoView` helper and
  scroll/resize fallbacks) and applied it to the
  `OpportunityBoard` and `DealBoard` kanban containers so
  off-screen stage cards get a subtle ring and the board can
  scroll a target card into view via a new `highlightId` prop.
  Reduced hero `rounded-[24px]` kanban columns to `rounded-xl`
  and card padding to `p-3`, plus trimmed `font-black` +
  `tracking-[0.3em]` styling to `font-semibold` + `tracking-[0.2em]`
  for a calmer, more readable kanban. Vitest 11/11, `tsc --noEmit`
  clean for `packages/ui` and `apps/workspace/src/`.
- 2026-06-30 — Fixed root cause: `ThemeProvider` wasn't publishing
  `data-ag-theme-mode` on `document.documentElement`, so AG Grid's
  mode system was never activated and all sub-components (popups,
  drag-and-drop ghosts, charts, tooltips, menus) fell through to
  AG Grid's hardcoded `var(--ag-inherited-*, fallback)` chain.
  Patched `apps/workspace/src/components/providers/theme-provider.tsx`
  and `apps/marketing/components/providers/theme-provider.tsx` to
  set `root.dataset.agThemeMode = theme` alongside the existing
  `.dark` class toggle, keeping the two in lockstep. Also moved
  the full AG Grid variable map (`--ag-background-color`,
  `--ag-text-color`, `--ag-header-background-color`, etc.) into
  `apps/workspace/src/app/globals.css` on `:root` so every grid in
  the app inherits the Qentrah palette via the Qentrah `--q-*`
  tokens. Moved the sub-component overrides (`.ag-popup`,
  `.ag-chart`, `.ag-dnd-ghost`, `.ag-tooltip`, `.ag-menu`,
  `.ag-side-bar`, `.ag-tabs-header`, `.ag-tab`) to global
  selectors in globals.css so they apply to elements rendered at
  the document root, not just inside `.qentrah-table-wrapper`.
  Cleaned up the redundant `--ag-*` overrides in
  `qentrah-table.tsx` (now handled globally). Vitest 10/10,
  `tsc --noEmit` clean for `packages/ui`, `apps/workspace/src/`,
  `apps/marketing/`. Pre-existing `convex/` errors unchanged
  (Wave 4 schema work).
- 2026-06-30 — Migrated from theme-switching to **Theme Modes** (the
  AG Grid v33-blessed pattern from the styling tutorial). Replaced
  `qentrahQuartzDark` (`themeQuartz.withPart(colorSchemeDarkBlue)`)
  and `qentrahQuartzLight` (`themeQuartz.withPart(colorSchemeLight)`)
  with a single `qentrahQuartz` defined as
  `themeQuartz.withParams(darkParams, "dark").withParams(lightParams, "light")`.
  The active mode is now published on `data-ag-theme-mode` — both on
  the `.qentrah-table-wrapper` root and on `document.documentElement`
  (so sub-components rendered at the document root like `.ag-popup`,
  `.ag-dnd-ghost`, `.ag-chart`, `.ag-tooltip` pick up the right
  scheme via the `[data-ag-theme-mode="dark|light"]` selector
  AG Grid emits). No more grid re-render when the page theme
  changes — just toggle the attribute. The legacy
  `qentrahQuartzDark` / `qentrahQuartzLight` exports are kept as
  aliases to `qentrahQuartz` for backward compat. `lightParams` and
  `darkParams` are now fully self-contained (no `{ ...darkParams }`
  spread into light), each with its own set of token values for
  `tabSelected*`, `modalOverlay*`, `popupShadow`, `dragAndDrop*`
  shadows so light mode no longer inherits dark hardcoded values.
  Vitest 10/10, `tsc --noEmit` clean for `packages/ui` and
  `apps/workspace/src/` (pre-existing `convex/` errors are Wave 4
  schema work).
- 2026-06-30 — Fixed dim cell + header text. Added the two missing
  AG Grid CSS variables the user called out:
  `--ag-text-color: var(--q-text-primary)` (what `.ag-cell` actually
  resolves via `var(--ag-inherited-text-color, var(--ag-foreground-color))`)
  and `--ag-card-background-color: var(--q-card)` (used by popups /
  panels). Removed `opacity: 0.9` on `.ag-header-cell-text` — that
  was making "NAME / ASSIGNEE / STATUS / DUE DATE / PRIORITY" nearly
  invisible. Added `!important` to the cell + header-row +
  header-cell-label + header-cell-text color rules so AG Grid's
  hardcoded `var(--ag-inherited-*, fallback)` chain can no longer
  win the cascade. Vitest 10/10, `tsc --noEmit` clean.
- 2026-06-30 — Fixed AG Grid sub-component theming. AG Grid v33 ships
  its CSS variables (e.g. `--ag-background-color`,
  `--ag-foreground-color`, `--ag-border-color`,
  `--ag-row-hover-color`, `--ag-selected-row-background-color`,
  `--ag-input-background-color`, `--ag-popup-shadow`,
  `--ag-modal-overlay-background-color`,
  `--ag-control-panel-background-color`, etc.) on `.ag-root-wrapper`
  and `.ag-popup`, but the JS theme params (via
  `themeQuartz.withParams(...)`) only set them inside the grid's
  internal `.ag-theme-*` selector. Several sub-components
  (`.ag-chart`, `.ag-dnd-ghost`, `.ag-popup`, `.ag-menu`,
  `.ag-rich-select-list`, `.ag-tooltip`, `.ag-panel`,
  `.ag-side-bar`, `.ag-tabs-header`, `.ag-tab`, `.ag-tab-selected`)
  were rendering with AG Grid's internal hardcoded fallback instead
  of our `--q-*` design tokens. Now the `.qentrah-table-wrapper`
  explicitly re-defines every relevant `--ag-*` variable against our
  Qentrah tokens (`--q-card`, `--q-bg-secondary`, `--q-text-primary`,
  `--q-text-secondary`, `--q-info`, `--q-input-bg`, `--q-input-border`,
  etc.), so they propagate correctly to all sub-components in both
  light and dark mode. The header is forced to
  `var(--q-bg-secondary)` background and
  `var(--q-text-secondary)` text. Also fixed the `lightOverrides`
  spread bug in `theme.ts` — it was inheriting dark-only values from
  `darkOverrides` (e.g. `tabSelectedBackgroundColor: "#0b0b0f"` and
  `tabSelectedTextColor: "#e5e7eb"`) via `{ ...darkOverrides, ... }`,
  which meant light mode had dark tab/menu/panel/button colors. Now
  light mode is fully self-contained with its own token values
  (`#ffffff` surface, `#0f172a` foreground, etc.). Light + dark
  status/priority pills also updated to the Qentrah brand palette:
  `inProgress` = `--q-network-blue` (was orange), `waiting` =
  `--q-agent-purple` (was blue), `done` = `--q-human-green`,
  `priority-normal` = `--q-agent-purple` (was gold), `priority-low`
  = neutral grey (was green). Vitest 10/10, `tsc --noEmit` clean.
- 2026-06-30 — Fixed table UI color contrast in dark mode. Status pill
  backgrounds bumped from 12% to 28–32% opacity, priority flag
  backgrounds from 12% to 22–30%, and text colors brightened to match
  the ClickUp-style reference (solid color fills with light text).
  Updated priority palette so `normal` uses brand purple
  (`--q-agent-purple`) instead of gold, and `low` uses neutral grey
  instead of green. Deepened the table surface from `#0b0b0f` to
  `#0A0A0B` and the chrome to match. Row dividers bumped from
  `rgba(255,255,255,0.04)` to `0.08` for visible separation. Row text
  no longer applies a 90% opacity (was `text-foreground/90`) — now
  full `--q-text-primary` (`#F5F5F5`) for max legibility. Hover
  + selected tints bumped (10% → 14–16%, 18% → 22–26%) and the
  selected-row left border bumped to 85% accent opacity. Mirrored all
  dark token changes in `apps/marketing/app/globals.css` to keep the
  table renderer consistent across apps. Vitest cell-renderer suite
  passes (10/10), `tsc --noEmit` clean.
- 2026-06-29 — Created lifecycle folder. Installed `ag-grid-community@33`
  and `ag-grid-react@33` in `@qentrah/ui`. Added
  `packages/ui/src/qentrah-table/` with `QentrahTable` wrapper, dark
  theme, and the renderer set (`StatusPill`, `AssigneeAvatar`,
  `PriorityFlag`, `NameCell`, `RowHandle`). Migrated
  `TaskTableView` in `project-detail-overview.tsx` and the
  workspace-level Table view (`workspace-screen.tsx`).
