import type { ComponentType } from "react";
import type { WidgetType } from "../add-widget-modal";
import { TaskTableWidget } from "./task-table-widget";
import { NotesWidget } from "./notes-widget";
import { WorkloadChartWidget } from "./workload-chart-widget";
import { ProgressChartWidget } from "./progress-chart-widget";
import { BudgetChartWidget } from "./budget-chart-widget";
import { PlaceholderWidget } from "./placeholder-widget";

export interface WidgetEntry {
  component: ComponentType;
}

const registry: Record<WidgetType, WidgetEntry> = {
  "task-list": { component: TaskTableWidget },
  notes: { component: NotesWidget },
  workload: { component: WorkloadChartWidget },
  "progress-chart": { component: ProgressChartWidget },
  "budget-chart": { component: BudgetChartWidget },
  "ai-brain": { component: PlaceholderWidget },
  calculation: { component: PlaceholderWidget },
  portfolio: { component: PlaceholderWidget },
  assignee: { component: PlaceholderWidget },
  discussion: { component: PlaceholderWidget },
  bookmarks: { component: PlaceholderWidget },
};

export function getWidgetComponent(type: WidgetType): ComponentType {
  return registry[type]?.component ?? PlaceholderWidget;
}
