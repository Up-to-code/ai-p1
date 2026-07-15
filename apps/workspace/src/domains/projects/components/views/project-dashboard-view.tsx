"use client";

import { BudgetOverviewWidget } from "../widgets/budget-overview-widget";
import { ProjectHealthWidget } from "../widgets/project-health-widget";
import { ProjectStatsWidget } from "../widgets/project-stats-widget";
import { ProjectStatusWidget } from "../widgets/project-status-widget";
import { RecentProjectsWidget } from "../widgets/recent-projects-widget";
import { useProjectCollectionView } from "../../hooks/use-project-collection-view";
import { ProjectViewError, ProjectViewLoading } from "./project-view-states";

const WIDGETS = {
  stats: { title: "Overview", content: ProjectStatsWidget },
  status: { title: "By status", content: ProjectStatusWidget },
  health: { title: "By health", content: ProjectHealthWidget },
  recent: { title: "Recent projects", content: RecentProjectsWidget },
  budget: { title: "Budget", content: BudgetOverviewWidget },
};

export function ProjectDashboardView({ savedViewId }: { savedViewId?: string }) {
  const view = useProjectCollectionView("dashboard", savedViewId);
  if (view.queryStatus === "loading" || view.queryStatus === "idle") return <ProjectViewLoading />;
  if (view.queryStatus === "error") return <ProjectViewError message={view.errorMessage} />;
  const configured = view.config.project?.dashboardWidgets;
  const widgets = configured?.length ? configured : [
    { id: "stats", widgetType: "stats", x: 0, y: 0, width: 4, height: 4 },
    { id: "status", widgetType: "status", x: 4, y: 0, width: 4, height: 4 },
    { id: "health", widgetType: "health", x: 8, y: 0, width: 4, height: 4 },
    { id: "recent", widgetType: "recent", x: 0, y: 4, width: 6, height: 4 },
  ];
  return <div className="grid w-full auto-rows-[80px] grid-cols-12 gap-4 overflow-auto p-4">{widgets.map((widget) => { const definition = WIDGETS[widget.widgetType as keyof typeof WIDGETS]; if (!definition) return null; const Content = definition.content; return <section key={widget.id} className="overflow-hidden rounded-xl border border-border bg-card" style={{ gridColumn: `${widget.x + 1} / span ${widget.width}`, gridRow: `${widget.y + 1} / span ${widget.height}` }}><header className="border-b border-border bg-muted/30 px-3 py-2 text-xs font-semibold">{definition.title}</header><div className="h-[calc(100%-36px)] overflow-auto"><Content /></div></section>; })}</div>;
}
