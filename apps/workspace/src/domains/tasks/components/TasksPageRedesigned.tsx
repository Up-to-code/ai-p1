"use client";

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { DomainHeader, type HeaderAction } from "@/components/shared/domain/DomainHeader";
import { type ViewMode } from "@/components/shared/view-system/ViewSwitcher";
import type { ViewItem } from "@/components/shared/view-system/types";
import { WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useAuthSession } from "@/domains/auth";
import { useTaskMutations } from "../hooks/use-task-mutations";
import { useCurrentProjectId } from "@/domains/projects/hooks/use-current-project-id";
import { useNavigation } from "@/domains/navigation";
import { useSearchParams } from "next/navigation";
import { useTasksQuery } from "../api/tasks";
import type { TaskRecord } from "../tasks.types";
import { TASK_STAGES } from "../tasks.constants";
import { TaskViewFrame } from "./views/task-view-frame";
import { filterTasksForSidebar } from "../lib/task-sidebar-filter";
import { useMemberOptions } from "../hooks/use-task-mention-options";
import { TaskEditModal } from "./task-edit-modal";
import { TaskCreateModal } from "./task-create-modal";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";

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
  const [activeView, setActiveView] = useState<ViewMode>("board");
  const [page, setPage] = useState(1);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const searchParams = useSearchParams();
  const sidebarFilter = searchParams.get("filter") ?? "all";

  const workspaceStatus = session.workspace.status;
  const organizationId =
    workspaceStatus === "ready"
      ? (session.workspace.organizationId ?? undefined)
      : undefined;

  const projectIdFromUrl = useCurrentProjectId();
  const projectId =
    projectIdProp !== undefined ? projectIdProp : projectIdFromUrl;
  const { spaceId } = useNavigation();
  const projectOptions = useProjectOptionsQueryResult(organizationId, { limit: 200 });
  const activeProjectId = useMemo(
    () => projectId && projectOptions.data?.some((project) => project.id === projectId) ? projectId : null,
    [projectId, projectOptions.data],
  );

  const tasksResult = useTasksQuery(organizationId, {
    status: "all",
    projectId: projectId ?? null,
    spaceId,
  });
  const emptyTasks = [] as TaskRecord[];
  const rawTasks = tasksResult.data ?? emptyTasks;

  const { applyOptimistic, moveTask: moveTaskFromHook, updateTask, deleteTask, createTask } = useTaskMutations(organizationId ?? "");
  const tasks = applyOptimistic(rawTasks);
  const { data: memberOptions } = useMemberOptions(organizationId, session.user);

  const filteredTasks = useMemo(
    () => filterTasksForSidebar(tasks, sidebarFilter, session.user.id),
    [session.user.id, sidebarFilter, tasks],
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
      const newStatus = toStage;
      const statusTasks = tasks.filter((candidate) => candidate.status === newStatus);
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
        projectId: activeProjectId ?? "",
        spaceId: spaceId ?? "",
      });
    },
    [activeProjectId, createTask, organizationId, spaceId],
  );

  const actions: HeaderAction[] = [
    {
      label: t("actions.new"),
      icon: <Plus className="w-4 h-4" />,
      onClick: () => setCreateTaskOpen(true),
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
    <div className="flex h-full min-h-0 min-w-0 max-w-full flex-col overflow-hidden">
      <DomainHeader
        domain="Tasks"
        currentSection={sectionLabel}
        actions={actions}
        availableViews={availableViews}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <TaskViewFrame
          tab={activeTab}
          tasks={pagedTasks}
          stages={TASK_STAGES}
          organizationId={organizationId}
          projectId={activeProjectId}
          spaceId={spaceId}
          onCardMove={handleCardMove}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={(task) => deleteTask(task)}
          currentUserId={session.user.id}
          memberOptions={memberOptions}
          onTaskOpen={setOpenTaskId}
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

  return (
    <>
      {workspaceContent}
      <TaskCreateModal
        organizationId={organizationId}
        projectId={activeProjectId}
        spaceId={spaceId}
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        onCreated={setOpenTaskId}
      />
      <TaskEditModal taskId={openTaskId} open={Boolean(openTaskId)} onClose={() => setOpenTaskId(null)} />
    </>
  );
}
