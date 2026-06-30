"use client";

import { useState } from "react";
import { useAccountContext } from "@/domains/auth";
import { useProjectQuery } from "../api/projects";
import { useLocalConfig } from "@/domains/storage";
import { Box } from "lucide-react";
import { ViewSwitcherTabs, type ViewItem, type ViewType } from "@/components/shared/view-system";
import { ProjectDashboard } from "./project-dashboard";
import { TaskTableView } from "./views/task-table-view";
import { TaskListView } from "./views/task-list-view";
import { TaskBoardView } from "./views/task-board-view";
import { TaskCalendarView } from "./views/task-calendar-view";
import { TaskTimelineView } from "./views/task-timeline-view";
import { TaskMapView } from "./views/task-map-view";

interface ProjectDetailOverviewProps {
  projectId: string;
}

const DEFAULT_VIEWS: ViewItem[] = [
  { id: "view-1", type: "dashboard" },
  { id: "view-2", type: "table" },
  { id: "view-3", type: "board" },
];

export function ProjectDetailOverview({ projectId }: ProjectDetailOverviewProps) {
  const account = useAccountContext();
  const workspaceOrganizationId = account.workspace.status === "ready" ? account.workspace.organizationId : undefined;
  const project = useProjectQuery(workspaceOrganizationId ?? undefined, projectId);

  const storageKey = `project-views-${projectId}`;
  const [views, setViews] = useLocalConfig<ViewItem[]>(storageKey, DEFAULT_VIEWS);
  const [activeViewId, setActiveViewId] = useState<string>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed[0].id;
      } catch { /* ignore */ }
    }
    return DEFAULT_VIEWS[0].id;
  });

  const handleAddView = (type: ViewType) => {
    const newView: ViewItem = { id: `view-${Date.now()}`, type };
    setViews([...views, newView]);
    setActiveViewId(newView.id);
  };

  const handleReorder = (next: ViewItem[]) => {
    setViews(next);
  };

  const handleRemoveView = (viewId: string) => {
    const next = views.filter((v) => v.id !== viewId);
    if (next.length === 0) return;
    setViews(next);
    if (activeViewId === viewId) setActiveViewId(next[0].id);
  };

  if (project === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  const activeView = views.find(v => v.id === activeViewId) || views[0];
  const activeType = activeView?.type || "dashboard";

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6 space-y-6 h-full flex flex-col">
      <ViewSwitcherTabs
        views={views}
        activeViewId={activeViewId}
        onViewChange={setActiveViewId}
        onReorder={handleReorder}
        onAddView={handleAddView}
        onRemoveView={handleRemoveView}
        leftSlot={
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Box className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-black tracking-tight text-foreground truncate">
                {project.name || "Project Details"}
              </h1>
            </div>
          </div>
        }
      />

      <div className="flex-1 min-h-0 px-4">
        {activeType === "dashboard" && <ProjectDashboard projectId={projectId} />}
        {activeType === "table" && <TaskTableView projectId={projectId} organizationId={workspaceOrganizationId ?? ""} />}
        {activeType === "list" && <TaskListView projectId={projectId} organizationId={workspaceOrganizationId ?? ""} />}
        {activeType === "board" && <TaskBoardView projectId={projectId} organizationId={workspaceOrganizationId ?? ""} />}
        {activeType === "calendar" && <TaskCalendarView projectId={projectId} organizationId={workspaceOrganizationId ?? ""} />}
        {activeType === "timeline" && <TaskTimelineView projectId={projectId} organizationId={workspaceOrganizationId ?? ""} />}
        {activeType === "map" && <TaskMapView projectId={projectId} organizationId={workspaceOrganizationId ?? ""} />}
      </div>
    </div>
  );
}

export { TaskTableView, TaskListView, TaskBoardView, TaskCalendarView, TaskTimelineView, TaskMapView };

export type { ViewItem, ViewType };
