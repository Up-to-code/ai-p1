import type { ReactNode } from "react";
import type { ViewMeta, ViewType } from "./view-catalog";

export type { ViewMeta, ViewType };

/* ── Stage / Group Definition ─────────────────────────────────────────────── */

export interface StageDefinition {
  key: string;
  name: string;
  color: string;
  icon?: ReactNode;
  order?: number;
}

/* ── Card Item ───────────────────────────────────────────────────────────── */

export interface CardItem {
  id: string;
  stageKey: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  avatar?: string;
  avatarFallback?: string;
  meta?: Array<{ icon?: ReactNode; label: string; value?: string }>;
  data: Record<string, unknown>;
}

/* ── Card Action ─────────────────────────────────────────────────────────── */

export interface CardAction {
  key: string;
  icon: ReactNode;
  label: string;
  onClick: (item: CardItem) => void;
  variant?: "default" | "danger";
  show?: (item: CardItem) => boolean;
}

/* ── Card Slot ───────────────────────────────────────────────────────────── */

export interface CardSlotConfig {
  /** Where to render this slot in the card */
  position: "header" | "body" | "footer";
  /** Render function */
  render: (item: CardItem, stage: StageDefinition) => ReactNode;
}

/* ── Pipeline / Board View Config ────────────────────────────────────────── */

export interface PipelineViewConfig {
  type: "pipeline";
  /** Column width in px */
  columnWidth?: number;
  /** Show column header bar color */
  showBarColor?: boolean;
  /** Show count badge */
  showCount?: boolean;
  /** Card actions */
  actions?: CardAction[];
  /** Extra card slots */
  cardSlots?: CardSlotConfig[];
  /** Custom card class */
  cardClassName?: string | ((item: CardItem, stage: StageDefinition) => string);
  /** Custom column header */
  renderColumnHeader?: (stage: StageDefinition, count: number) => ReactNode;
  /** Custom card render (replaces default entirely) */
  renderCard?: (item: CardItem, stage: StageDefinition) => ReactNode;
  /** Footer below cards */
  renderColumnFooter?: (stage: StageDefinition) => ReactNode;
  /** Enable drag & drop */
  draggable?: boolean;
  /** Enable inline new card creation */
  allowInlineCreate?: boolean;
  /** Callback when card is dropped in a new stage */
  onCardMove?: (itemId: string, fromStage: string, toStage: string, targetIndex: number) => void;
  /** Callback when inline card is created */
  onInlineCreate?: (stageKey: string, data: { name: string; contact?: string }) => void;
  /** Callback when column header is renamed */
  onStageRename?: (stageKey: string, newName: string) => void;
  /** Callback when card is clicked */
  onCardClick?: (item: CardItem) => void;
  /** Custom empty state per column */
  renderEmpty?: (stage: StageDefinition) => ReactNode;
}

/* ── Grouped List View Config ────────────────────────────────────────────── */

export interface ListColumn {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  render?: (item: CardItem, stage: StageDefinition) => ReactNode;
  className?: string;
}

export interface GroupedListViewConfig {
  type: "list";
  /** Column definitions for each row */
  columns?: ListColumn[];
  /** Show search input */
  showSearch?: boolean;
  /** Show count in group header */
  showCount?: boolean;
  /** Expand all groups by default */
  defaultExpanded?: boolean;
  /** Row actions */
  actions?: CardAction[];
  /** Custom group header */
  renderGroupHeader?: (stage: StageDefinition, count: number, isExpanded: boolean) => ReactNode;
  /** Custom row render (replaces default row entirely) */
  renderRow?: (item: CardItem, stage: StageDefinition) => ReactNode;
  /** Custom cell render per column key */
  renderCell?: (item: CardItem, column: ListColumn, stage: StageDefinition) => ReactNode;
  /** Custom row class */
  rowClassName?: string | ((item: CardItem, stage: StageDefinition) => string);
  /** Enable drag & drop reordering within and between groups */
  draggable?: boolean;
  /** Enable inline new item creation */
  allowInlineCreate?: boolean;
  /** Callback when item is moved via drag */
  onItemMove?: (itemId: string, fromGroup: string, toGroup: string, targetIndex: number) => void;
  /** Callback when inline item is created */
  onInlineCreate?: (groupKey: string, data: Record<string, unknown>) => void;
  /** Callback when "add group" is clicked */
  onAddGroup?: () => void;
  /** Callback when row is clicked */
  onRowClick?: (item: CardItem) => void;
  /** Callback when a cell is clicked */
  onCellClick?: (item: CardItem, column: ListColumn) => void;
  /** Custom empty state per group */
  renderEmpty?: (stage: StageDefinition) => ReactNode;
  /** Custom group header footer (e.g. summary row) */
  renderGroupFooter?: (stage: StageDefinition, items: CardItem[]) => ReactNode;
}

/* ── Table View Config ───────────────────────────────────────────────────── */

export interface TableViewConfig {
  type: "table";
  /** Column definitions */
  columns: TableColumn[];
  /** Enable sorting */
  sortable?: boolean;
  /** Enable selection */
  selectable?: boolean;
  /** Row actions */
  actions?: CardAction[];
  /** Custom row render */
  renderRow?: (item: CardItem) => ReactNode;
  /** Callback when row is clicked */
  onRowClick?: (item: CardItem) => void;
}

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  render?: (item: CardItem) => ReactNode;
  className?: string;
}

/* ── View Definition ─────────────────────────────────────────────────────── */

export interface ViewConfig {
  type: string;
  [key: string]: unknown;
}

export interface ViewDefinition {
  key: string;
  label: string;
  icon?: ReactNode;
  config: ViewConfig;
}

/* ── View Item (shareable tab model) ──────────────────────────────────────── */

/**
 * A single view tab in the shareable view switcher. Domain-agnostic —
 * projects, deals, clients etc. each maintain their own list of these.
 */
export interface ViewItem {
  id: string;
  type: ViewType;
  /** Override the catalog label for this instance */
  label?: string;
}

/* ── View Switcher Tabs (shareable) ──────────────────────────────────────── */

export interface ViewSwitcherTabsProps {
  /** Active view tabs (ordered) */
  views: ViewItem[];
  /** Currently active view id */
  activeViewId: string;
  onViewChange: (viewId: string) => void;
  /** Drag-and-drop reorder callback */
  onReorder?: (views: ViewItem[]) => void;
  /** Called when a view type is picked from the "Add view" popover */
  onAddView?: (type: ViewType) => void;
  /** Called when a view tab's remove button is clicked */
  onRemoveView?: (viewId: string) => void;
  /** Show the "Add view" popover trigger */
  showAddView?: boolean;
  /** Optional count badge rendered after the tabs */
  count?: number;
  /** Content rendered to the left of the tabs (e.g. page title) */
  leftSlot?: ReactNode;
  /** Content rendered to the right of the tabs (e.g. action buttons) */
  rightSlot?: ReactNode;
  /** Override the default view catalog */
  catalog?: readonly ViewMeta[];
  /** Allow reordering via drag-and-drop */
  draggable?: boolean;
  className?: string;
}
