"use client";

import { useState } from "react";
import { useAuthSession } from "@/domains/auth";
import { useProjectQuery } from "../api/projects";
import { useLocalConfig } from "@/domains/storage";
import { Box } from "lucide-react";
import { ViewSwitcherTabs, type ViewItem, type ViewType } from "@/components/shared/view-system";
import { ProjectDashboard } from "./project-dashboard";
import { TaskCalendarView } from "./views/task-calendar-view";
import { TaskTimelineView } from "./views/task-timeline-view";
import { TaskMapView } from "./views/task-map-view";
import { TaskViewFrame } from "@/domains/tasks/components/views/task-view-frame";
import { TASK_STAGES, normalizeTaskStatus } from "@/domains/tasks/tasks.constants";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { useTaskMutations } from "@/domains/tasks/hooks/use-task-mutations";
import type { TaskRecord } from "@/domains/tasks/tasks.types";

interface ProjectDetailOverviewProps {
  projectId: string;
}

const DEFAULT_VIEWS: ViewItem[] = [
  { id: "view-1", type: "dashboard" },
  { id: "view-2", type: "table" },
  { id: "view-3", type: "board" },
];

export function ProjectDetailOverview({ projectId }: ProjectDetailOverviewProps) {
  const session = useAuthSession();
  const workspaceOrganizationId = session.workspace.status === "ready" ? (session.workspace.organizationId ?? undefined) : undefined;
  const project = useProjectQuery(workspaceOrganizationId ?? undefined, projectId);
  const tasksResult = useTasksQuery(workspaceOrganizationId, { projectId });
  const tasks = tasksResult.data ?? [];
  const { moveTask, updateTask, deleteTask, createTask } = useTaskMutations(workspaceOrganizationId ?? "");

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

  const handleCardMove = (itemId: string, _fromStage: string, toStage: string, targetIndex: number) => {
    const task = tasks.find((candidate) => candidate.id === itemId);
    if (!task) return;
    const nextStatus = normalizeTaskStatus(toStage);
    const statusTasks = tasks.filter((candidate) => normalizeTaskStatus(candidate.status) === nextStatus);
    moveTask(task, nextStatus, statusTasks, targetIndex);
  };

  const handleTaskUpdate = async (task: TaskRecord, changes: Partial<TaskRecord>) => {
    await updateTask(task, changes);
  };

  const handleTaskCreate = async (title: string, defaults?: Pick<Partial<TaskRecord>, "status" | "priority" | "assigneeUserId" | "dueDate" | "tags">) => {
    await createTask({
      title,
      projectId,
      status: defaults?.status,
      priority: defaults?.priority,
      assigneeUserId: defaults?.assigneeUserId,
      dueDate: defaults?.dueDate,
      tags: defaults?.tags?.join(", "),
    });
  };

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
        {(["table", "list", "board"] as const).includes(activeType as "table" | "list" | "board") && (
          <TaskViewFrame
            tab={{ id: activeView?.id ?? "project-task-view", type: activeType as "table" | "list" | "board" }}
            tasks={tasks}
            stages={TASK_STAGES}
            organizationId={workspaceOrganizationId}
            projectId={projectId}
            onCardMove={handleCardMove}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={(task) => deleteTask(task)}
            currentUserId={session.user.id}
            onTaskCreate={handleTaskCreate}
          />
        )}
        {activeType === "calendar" && <TaskCalendarView projectId={projectId} organizationId={workspaceOrganizationId ?? ""} />}
        {activeType === "timeline" && <TaskTimelineView projectId={projectId} organizationId={workspaceOrganizationId ?? ""} />}
        {activeType === "map" && <TaskMapView projectId={projectId} organizationId={workspaceOrganizationId ?? ""} />}
      </div>
    </div>
  );
}

export { TaskCalendarView, TaskTimelineView, TaskMapView };

export type { ViewItem, ViewType };
