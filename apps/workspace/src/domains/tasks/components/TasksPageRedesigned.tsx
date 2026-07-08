"use client";

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from "next-intl";
import { ListTodo, Plus } from "lucide-react";
import { DomainHeader, type HeaderAction } from "@/components/shared/domain/DomainHeader";
import { type ViewMode } from "@/components/shared/view-system/ViewSwitcher";
import type { ViewItem } from "@/components/shared/view-system/types";
import { EmptyWorkspace, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useAuthSession } from "@/domains/auth";
import { useTaskMutations } from "../hooks/use-task-mutations";
import { useCurrentProjectId } from "@/domains/projects/hooks/use-current-project-id";
import { useNavigation } from "@/domains/navigation";
import { useTasksQuery } from "../api/tasks";
import type { TaskRecord, TaskStatus } from "../tasks.types";
import { TASK_STAGES, emptyTask, normalizeTaskStatus } from "../tasks.constants";
import { TaskViewFrame } from "./views/task-view-frame";
import { taskLog } from "../task-log";
import { createTaskRequest } from "../api/tasks";

const DEFAULT_TABS: ViewItem[] = [
  { id: "default-table", type: "table", label: "Table" },
  { id: "default-board", type: "board", label: "Board" },
  { id: "default-list", type: "list", label: "List" },
];

const TASK_PAGE_SIZE = 50;

export function TasksPageRedesigned({
  projectId: projectIdProp,
}: { projectId?: string | null } = {}) {
  const t = useTranslations("Tasks");
  const session = useAuthSession();
  const [activeView, setActiveView] = useState<ViewMode>("table");
  const [page, setPage] = useState(1);

  const workspaceStatus = session.workspace.status;
  const organizationId =
    workspaceStatus === "ready"
      ? (session.workspace.organizationId ?? undefined)
      : undefined;

  const projectIdFromUrl = useCurrentProjectId();
  const projectId =
    projectIdProp !== undefined ? projectIdProp : projectIdFromUrl;
  const { spaceId } = useNavigation();

  const tasksResult = useTasksQuery(organizationId, {
    status: "all",
    projectId: projectId ?? null,
    spaceId,
  });
  const emptyTasks = [] as TaskRecord[];
  const rawTasks = tasksResult.data ?? emptyTasks;

  const { applyOptimistic, moveTask: moveTaskFromHook, updateTask, createTask } = useTaskMutations(organizationId ?? "");
  const tasks = applyOptimistic(rawTasks);

  const filteredTasks = useMemo(
    () => tasks.filter((task) => !task._deleted),
    [tasks],
  );

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / TASK_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedTasks = useMemo(() => {
    const start = (currentPage - 1) * TASK_PAGE_SIZE;
    return filteredTasks.slice(start, start + TASK_PAGE_SIZE);
  }, [currentPage, filteredTasks]);
  const pageStart = filteredTasks.length === 0 ? 0 : (currentPage - 1) * TASK_PAGE_SIZE + 1;
  const pageEnd = Math.min(currentPage * TASK_PAGE_SIZE, filteredTasks.length);

  const handleCardMove = useCallback(
    (itemId: string, fromStage: string, toStage: string, targetIndex: number) => {
      if (!organizationId) return;
      const task = tasks.find((t) => t.id === itemId);
      if (!task) return;
      const newStatus = normalizeTaskStatus(toStage);
      const statusTasks = tasks.filter((candidate) => normalizeTaskStatus(candidate.status) === newStatus);
      moveTaskFromHook(task, newStatus, statusTasks, targetIndex);
    },
    [organizationId, tasks, moveTaskFromHook],
  );

  const handleTaskUpdate = useCallback(
    async (task: TaskRecord, changes: Partial<TaskRecord>) => {
      if (!organizationId) return;
      await updateTask(task, changes);
    },
    [organizationId, updateTask],
  );

  const handleTableTaskCreate = useCallback(
    async (title: string, defaults?: Pick<Partial<TaskRecord>, "status" | "priority" | "assigneeUserId" | "dueDate" | "tags">) => {
      if (!organizationId) return;
      await createTask({
        title,
        status: defaults?.status,
        priority: defaults?.priority,
        assigneeUserId: defaults?.assigneeUserId,
        dueDate: defaults?.dueDate,
        tags: defaults?.tags?.join(", "),
        projectId: projectId ?? "",
        spaceId: spaceId ?? "",
      });
    },
    [createTask, organizationId, projectId, spaceId],
  );

  const actions: HeaderAction[] = [
    {
      label: t("actions.new"),
      icon: <Plus className="w-4 h-4" />,
      onClick: async () => {
        if (!organizationId) return;
        taskLog.info("create:start", { projectId: projectId ?? "" });
        await createTaskRequest(organizationId, {
          ...emptyTask,
          projectId: projectId ?? "",
        });
      },
      variant: "primary",
    },
  ];

  const sectionLabel = `${filteredTasks.length} task${filteredTasks.length !== 1 ? "s" : ""}`;
  const activeTab = useMemo<ViewItem>(() => {
    return DEFAULT_TABS.find((tab) => tab.type === activeView) ?? DEFAULT_TABS[0]!;
  }, [activeView]);
  const availableViews = useMemo(
    () => DEFAULT_TABS.map((tab) => tab.type as ViewMode),
    [],
  );

  const workspaceContent = (
    <div className="flex flex-col h-full">
      <DomainHeader
        domain="Tasks"
        currentSection={sectionLabel}
        actions={actions}
        availableViews={availableViews}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <div className="flex-1 overflow-hidden">
        <TaskViewFrame
          tab={activeTab}
          tasks={pagedTasks}
          stages={TASK_STAGES}
          organizationId={organizationId}
          projectId={projectId}
          spaceId={spaceId}
          onCardMove={handleCardMove}
          onTaskUpdate={handleTaskUpdate}
          onTaskCreate={handleTableTaskCreate}
        />
      </div>
      {filteredTasks.length > TASK_PAGE_SIZE ? (
        <div className="flex h-10 shrink-0 items-center justify-between border-t border-border bg-background px-4 text-xs text-muted-foreground">
          <span>
            Showing {pageStart}-{pageEnd} of {filteredTasks.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="h-7 rounded border border-border px-2 font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-40 hover:bg-muted"
            >
              Previous
            </button>
            <span className="min-w-16 text-center">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              className="h-7 rounded border border-border px-2 font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-40 hover:bg-muted"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );

  if (workspaceStatus !== "ready") {
    return (
      <div className="flex flex-col h-full">
        <DomainHeader
          domain="Tasks"
          currentSection="All Tasks"
          actions={actions}
          availableViews={availableViews}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <div className="flex-1 flex items-center justify-center">
          <WorkspaceQueryState status={workspaceStatus} variant="table" />
        </div>
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <DomainHeader
          domain="Tasks"
          currentSection={sectionLabel}
          actions={actions}
          availableViews={availableViews}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <div className="flex-1 flex items-center justify-center">
          <EmptyWorkspace icon={ListTodo} title={t("empty.title")} description={t("empty.description")} />
        </div>
      </div>
    );
  }

  return workspaceContent;
}
