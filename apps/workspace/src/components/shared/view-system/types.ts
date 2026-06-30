import type { ReactNode } from "react";
import type { ViewMeta, ViewType } from "./view-catalog";

export type { ViewMeta, ViewType };

/* ── Re-export pipeline types from shared package ──────────────────────── */

import type {
  StageDefinition,
  CardItem,
  CardAction,
  CardSlotConfig,
  PipelineViewConfig,
} from "@qentrah/our-platform-components/pipeline";

export type {
  StageDefinition,
  CardItem,
  CardAction,
  CardSlotConfig,
  PipelineViewConfig,
};

/* ── Grouped List View Config ──────────────────────────────────────────── */

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
  columns?: ListColumn[];
  showSearch?: boolean;
  showCount?: boolean;
  defaultExpanded?: boolean;
  actions?: CardAction[];
  renderGroupHeader?: (stage: StageDefinition, count: number, isExpanded: boolean) => ReactNode;
  renderRow?: (item: CardItem, stage: StageDefinition) => ReactNode;
  renderCell?: (item: CardItem, column: ListColumn, stage: StageDefinition) => ReactNode;
  rowClassName?: string | ((item: CardItem, stage: StageDefinition) => string);
  draggable?: boolean;
  allowInlineCreate?: boolean;
  onItemMove?: (itemId: string, fromGroup: string, toGroup: string, targetIndex: number) => void;
  onInlineCreate?: (groupKey: string, data: Record<string, unknown>) => void;
  onAddGroup?: () => void;
  onRowClick?: (item: CardItem) => void;
  onCellClick?: (item: CardItem, column: ListColumn) => void;
  renderEmpty?: (stage: StageDefinition) => ReactNode;
  renderGroupFooter?: (stage: StageDefinition, items: CardItem[]) => ReactNode;
}

/* ── Table View Config ─────────────────────────────────────────────────── */

export interface TableViewConfig {
  type: "table";
  columns: TableColumn[];
  sortable?: boolean;
  selectable?: boolean;
  actions?: CardAction[];
  renderRow?: (item: CardItem) => ReactNode;
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

/* ── View Definition ───────────────────────────────────────────────────── */

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

/* ── View Item (shareable tab model) ───────────────────────────────────── */

export interface ViewItem {
  id: string;
  type: ViewType;
  label?: string;
}

/* ── View Switcher Tabs (shareable) ────────────────────────────────────── */

export interface ViewSwitcherTabsProps {
  views: ViewItem[];
  activeViewId: string;
  onViewChange: (viewId: string) => void;
  onReorder?: (views: ViewItem[]) => void;
  onAddView?: (type: ViewType) => void;
  onRemoveView?: (viewId: string) => void;
  showAddView?: boolean;
  count?: number;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  catalog?: readonly ViewMeta[];
  draggable?: boolean;
  className?: string;
}
