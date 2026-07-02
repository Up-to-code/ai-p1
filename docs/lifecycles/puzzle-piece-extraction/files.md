# Files

## Phase 1 — Extract from god components (passes 1-7, 19, 20)

### Source: `packages/our-platform-components/src/pipeline/pipeline-board.tsx` (709 LOC)
| Lines | Concept | Target file |
|-------|---------|-------------|
| 9-26 | `STAGE_BADGE_BG` + `badgeBgFor()` | `pipeline/stage-color.ts` |
| 36-93 | `PopoverMenu` | `popover-menu/popover-menu.tsx` |
| 122-337 | `DefaultCard` | `pipeline/card-default.tsx` |
| 297-330 | footer action row | `pipeline/card-footer-actions.tsx` |
| 339-402 | `InlineNewCard` | `pipeline/inline-new-card.tsx` |
| 430-557 | `columnHeader` (name + count + "new" + add) | `pipeline/column-header.tsx` |
| 533-535 | top color bar | `pipeline/stage-bar.tsx` |
| 562-569 | count pill | `pipeline/count-badge.tsx` |
| 570-575 | "New" gradient badge | `pipeline/new-badge.tsx` |
| 586-619 | column rename/delete popover | `pipeline/column-options-menu.tsx` |
| 519-525 + 514-526 | column shell (wraps header + items + footer) | `pipeline/column.tsx` |
| 434-510 | SortableJS lifecycle + DOM revert | `pipeline/use-sortable-board.ts` |
| 404-709 | orchestrator | `pipeline/pipeline-board.tsx` (slimmed) |

### Source: `packages/our-platform-components/src/widget-grid/widget-grid.tsx` (438 LOC)
| Lines | Concept | Target file |
|-------|---------|-------------|
| 285+ | `WidgetShell` | `widget-grid/widget-shell.tsx` |

### Source: `apps/workspace/src/domains/workspace/components/workspace-widgets.tsx` (428 LOC)
| Exports | Target file |
|---------|-------------|
| `SectionLabel` | `widgets/section-label.tsx` |
| `WidgetHeader` | `widgets/widget-header.tsx` |
| `MetricCard` | `widgets/metric-card.tsx` |
| `MetricCards` | `widgets/metric-cards.tsx` |
| `AiBrainWidget` | `widgets/ai-brain-widget.tsx` |
| `FoldersWidget` | `widgets/folders-widget.tsx` |
| `PortfolioWidget` | `widgets/portfolio-widget.tsx` |
| `CalendarTodayWidget` | `widgets/calendar-today-widget.tsx` |
| `RecentConversationsWidget` | `widgets/recent-conversations-widget.tsx` |
| `DocsWidget` | `widgets/docs-widget.tsx` |

## Phase 2 — New puzzle pieces in `@qentrah/our-platform-components` (passes 8, 9)

| Puzzle | New file |
|--------|----------|
| `PipelineStageIndicator` (dots | strip | breadcrumb) | `pipeline/pipeline-stage-indicator.tsx` |
| `ProgressBar` | `feedback/progress-bar.tsx` |

## Phase 3 — New puzzle pieces in `@qentrah/ui` (passes 10, 14-17)

| Puzzle | New / target file |
|--------|-------------------|
| `ColorDot` (generalize `DepartmentDot`) | `components/ui/color-dot.tsx` |
| `ColorSwatch` | `components/ui/color-swatch.tsx` |
| `EmptyState` (promote from `EmptyWorkspace`) | `components/ui/empty-state.tsx` |
| `FilterChip` (wire up `FilterChipBar`) | `components/ui/filter-chip.tsx` |
| `LegendItem` | `components/ui/legend-item.tsx` |
| `ListRow` (workspace-flavored `ListItem*`) | `components/ui/list-row.tsx` |
| `StatusPill` (unify 3 partials) | `components/ui/status-pill.tsx` |
| `TagChip` | `components/ui/tag-chip.tsx` |

## Phase 4 — Workspace-flavored new pieces (pass 18)

| Puzzle | New file |
|--------|----------|
| `EditableTitle` (sibling of `EditableText`) | `apps/workspace/src/components/ui/editable-title.tsx` |

## Phase 5 — Consumer wiring (pass 21 + ongoing)

| File | Inlined pattern | Replaced by |
|------|----------------|-------------|
| `apps/workspace/src/domains/projects/components/project-dashboard.tsx:80-116` | kebab menu | `<PopoverMenu>` |
| `apps/workspace/src/domains/projects/components/projects-overview-dashboard.tsx:84-96` | kebab menu | `<PopoverMenu>` |
| `apps/workspace/src/components/layout/sidebar/components/sidebar-space-panel.tsx:104` | kebab | `<PopoverMenu>` |
| `apps/workspace/src/domains/docs/components/doc-folder-tree.tsx:141` | kebab | `<PopoverMenu>` |
| `apps/workspace/src/domains/docs/components/doc-row-actions.tsx:67` | kebab | `<PopoverMenu>` |
| `apps/workspace/src/domains/projects/components/widgets/portfolio-table-widget.tsx:88` | kebab | `<PopoverMenu>` |
| `apps/workspace/src/domains/clients/components/detail/tabs/projects-tab.tsx:343` | progress bar | `<ProgressBar>` |
| `apps/workspace/src/domains/projects/components/views/task-map-view.tsx:91` | progress bar | `<ProgressBar>` |
| `apps/workspace/src/domains/projects/components/widgets/portfolio-table-widget.tsx:54` | progress bar | `<ProgressBar>` |
| `apps/workspace/src/domains/workspace/components/workspace-right-sidebar.tsx:46-48` | progress bar | `<ProgressBar>` |
| `apps/workspace/src/domains/workspace/components/workspace-widgets.tsx:221-225` | progress bar | `<ProgressBar>` |
| `apps/workspace/src/domains/projects/components/detail/tabs/budget-tab.tsx:85, 97` | progress bar | `<ProgressBar>` |
| `apps/workspace/src/domains/projects/components/widgets/calculation-widget.tsx:76` | progress bar | `<ProgressBar>` |
| `apps/workspace/src/domains/projects/components/widgets/budget-chart-widget.tsx:75` | progress bar | `<ProgressBar>` |
| `apps/workspace/src/domains/projects/components/widgets/recent-projects-widget.tsx:53-58` | progress bar | `<ProgressBar>` |
| 16+ ColorDot inlines (workspace-widgets.tsx × 4, project pickers × 4, etc.) | inline dot | `<ColorDot>` |
| 12+ EmptyState inlines (clients/projects detail tabs, etc.) | inline empty | `<EmptyState>` |
| 6+ InlineNewCard inlines (saved-views-dropdown, task-table-fields-panel, etc.) | inline new | `<InlineNewCard>` |
| 6+ EditableTitle inlines (project-overview-sidebar, project-dashboard, etc.) | inline rename | `<EditableTitle>` |
| 10+ ListRow inlines (workspace-widgets × 3, recent-projects, space-switcher, etc.) | inline row | `<ListRow>` |
| 8+ StatusPill inlines (notion-client-table × 2, client-picker-modal, calendar-tab, etc.) | inline pill | `<StatusPill>` |
| 5+ FilterChip inlines (clients-screens filter popover, saved-views-dropdown, etc.) | inline filter | `<FilterChip>` |
| 4 ColorSwatch inlines (pipeline-stages-settings × 2, space-create-form, space-settings) | inline swatch | `<ColorSwatch>` |
| 6+ LegendItem inlines (project-status-widget, assignee-widget, workload-chart-widget, etc.) | inline legend | `<LegendItem>` |
| 12+ TagChip inlines (task-table-widget, task-list-view, notion-client-table, etc.) | inline chip | `<TagChip>` |
| `apps/workspace/src/domains/deals/components/deal-board.tsx` | stage as plain pill | `<PipelineStageIndicator>` |
| `apps/workspace/src/domains/clients/components/client-table-view.tsx:453, 497, 545` | status pill in column | `<PipelineStageIndicator variant="dots">` |
