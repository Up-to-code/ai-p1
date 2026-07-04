"use client";

import { useState } from 'react';
import { useTranslations } from "next-intl";
import { Plus, ListTodo, Search } from "lucide-react";
import { QentrahTable, type QentrahColumnDef } from "@qentrah/ui";
import { DomainHeader, type HeaderAction } from "@/components/shared/domain/DomainHeader";
import { type ViewMode } from "@/components/shared/view-system/ViewSwitcher";
import { ViewLoading } from "@/components/shared/loading/ViewLoading";
import { EmptyWorkspace, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useAuthSession } from "@/domains/auth";
import { useTaskMutations } from "../hooks/use-task-mutations";
import { useCurrentProjectId } from "@/domains/projects/hooks/use-current-project-id";
import { useActiveSpace } from "@/domains/spaces/hooks/use-active-space";
import { useTasksQuery } from "../api/tasks";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import type { TaskRecord, TaskStatus } from "../tasks.types";
import { cn } from "@/lib/utils";
import { ownershipFilters, type OwnershipFilter, emptyTask } from "../tasks.constants";
import { TaskFilterDropdown } from "./task-filter-dropdown";
import { PipelineBoard } from "@qentrah/our-platform-components/pipeline";
import { taskLog } from "../task-log";
import { createTaskRequest } from "../api/tasks";

export function TasksPageRedesigned({
  projectId: projectIdProp,
}: { projectId?: string | null } = {}) {
  const t = useTranslations("Tasks");
  const common = useTranslations("Common");
  const session = useAuthSession();
  const [activeView, setActiveView] = useState<ViewMode>('board');
  const [search, setSearch] = useState("");
  const [ownership, setOwnership] = useState<OwnershipFilter>("all");
  const [projectFilter, setProjectFilter] = useState<string>("");

  const workspaceStatus = session.workspace.status;
  const organizationId =
    workspaceStatus === "ready"
      ? (session.workspace.organizationId ?? undefined)
      : undefined;

  const projectIdFromUrl = useCurrentProjectId();
  const projectId =
    projectIdProp !== undefined ? projectIdProp : projectIdFromUrl;
  const { spaceId } = useActiveSpace();

  const projectOptions = useProjectOptionsQueryResult(organizationId, { limit: 200 });
  const projectList = projectOptions.data ?? [];

  const tasksResult = useTasksQuery(organizationId, {
    status: "all",
    search,
    projectId: projectId ?? (projectFilter || null),
    spaceId,
  });
  const emptyTasks = [] as TaskRecord[];
  const rawTasks = tasksResult.data ?? emptyTasks;

  const { applyOptimistic, moveTask: moveTaskFromHook } = useTaskMutations(organizationId ?? "");
  const tasks = applyOptimistic(rawTasks);

  const filteredTasks = tasks.filter((task) => {
    if (task._deleted) return false;
    const needle = search.trim().toLowerCase();
    if (
      needle &&
      ![
        task.title,
        task.description,
        task.assigneeUserId,
        ...(task.tags ?? []),
      ].some((v) => v?.toLowerCase().includes(needle))
    )
      return false;
    if (ownership === "assignedToMe")
      return task.assigneeUserId === session.user.id;
    if (ownership === "sentByMe")
      return task.createdByUserId === session.user.id;
    return true;
  });

  // Transform tasks to PipelineBoard format
  const stages = [
    {
      key: 'todo',
      name: t("statuses.todo"),
      color: '#6b7280',
      order: 0,
    },
    {
      key: 'inProgress',
      name: t("statuses.inProgress"),
      color: '#3b82f6',
      order: 1,
    },
    {
      key: 'waiting',
      name: t("statuses.waiting"),
      color: '#f59e0b',
      order: 2,
    },
    {
      key: 'done',
      name: t("statuses.done"),
      color: '#22c55e',
      order: 3,
    },
    {
      key: 'canceled',
      name: 'Canceled',
      color: '#ef4444',
      order: 4,
    },
  ];

  const items = filteredTasks.map(task => ({
    id: task.id,
    stageKey: task.status,
    title: task.title,
    subtitle: task.description,
    badge: task.priority,
    badgeColor: task.priority === 'urgent' ? '#ef4444' : task.priority === 'high' ? '#f59e0b' : task.priority === 'normal' ? '#3b82f6' : '#6b7280',
    data: {
      priority: task.priority,
      assigneeUserId: task.assigneeUserId,
      dueDate: task.dueDate,
    },
  }));

  const columns: QentrahColumnDef<TaskRecord>[] = [
    {
      headerName: "Task",
      field: "title",
      flex: 1.5,
      minWidth: 200,
      cellRenderer: (p: any) => {
        return (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{p.data?.title}</p>
            {p.data?.description && (
              <p className="mt-1 truncate text-xs text-muted-foreground">{p.data.description}</p>
            )}
          </div>
        );
      },
    },
    {
      headerName: "Status",
      field: "status",
      width: 120,
      valueFormatter: (p: any) => {
        const statusMap: Record<TaskStatus, string> = {
          todo: t("statuses.todo"),
          inProgress: t("statuses.inProgress"),
          waiting: t("statuses.waiting"),
          done: t("statuses.done"),
          canceled: 'Canceled',
        };
        const status = p.value as TaskStatus;
        return statusMap[status] || status;
      },
    },
    {
      headerName: "Priority",
      field: "priority",
      width: 100,
      valueFormatter: (p: any) => p.value || "—",
    },
    {
      headerName: "Due Date",
      field: "dueDate",
      width: 120,
      valueFormatter: (p: any) => {
        if (!p.value) return "—";
        return new Date(p.value).toLocaleDateString();
      },
    },
  ];

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

  const availableViews: ViewMode[] = ['table', 'board', 'calendar', 'timeline', 'dashboard', 'widgets'];

  const handleCardMove = (itemId: string, fromStage: string, toStage: string, targetIndex: number) => {
    if (!organizationId) return;
    const task = tasks.find((t) => t.id === itemId);
    if (!task) return;
    
    const newStatus = toStage as TaskStatus;
    const statusTasks = tasks.filter((candidate) => candidate.status === newStatus);
    moveTaskFromHook(task, newStatus, statusTasks, targetIndex);
  };

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
          currentSection="All Tasks"
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

  return (
    <div className="flex flex-col h-full">
      <DomainHeader
        domain="Tasks"
        currentSection={`${filteredTasks.length} task${filteredTasks.length !== 1 ? "s" : ""}`}
        actions={actions}
        availableViews={availableViews}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Toolbar with search and filters */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-6 h-12">
        <div className="flex items-center gap-2">
          <div className="flex h-8 items-center gap-2 rounded-lg border border-border bg-card px-3 focus-within:ring-2 focus-within:ring-ring/20">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={common("search")}
              className="h-full w-32 bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <TaskFilterDropdown
            value={ownership}
            options={ownershipFilters.map((f) => ({
              value: f,
              label: f === "all"
                ? t("filters.all")
                : f === "assignedToMe"
                  ? t("filters.assignedToMe")
                  : t("filters.sentByMe"),
            }))}
            onChange={(value) => setOwnership(value as OwnershipFilter)}
            placeholder={t("filters.all")}
          />
          {!projectId && projectList.length > 0 && (
            <TaskFilterDropdown
              value={projectFilter}
              options={[
                { value: "", label: t("filters.allProjects") },
                ...projectList.map((p) => ({ value: p.id, label: p.name })),
              ]}
              onChange={setProjectFilter}
              placeholder={t("filters.allProjects")}
            />
          )}
        </div>
      </div>

      {/* View content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'table' && (
          <div className="h-full p-6">
            <div className="rounded-xl border border-border bg-card overflow-hidden h-full">
              <QentrahTable
                rows={filteredTasks}
                columns={columns}
                density="compact"
                height="100%"
                rowSelection="single"
                getRowId={(row) => row.id}
              />
            </div>
          </div>
        )}

        {activeView === 'board' && (
          <div className="h-full p-6">
            <PipelineBoard
              items={items}
              stages={stages}
              onCardMove={handleCardMove}
              showBarColor
              renderEmpty={(stage) => (
                <div className="text-center py-8 text-[11px] text-muted-foreground/40 font-bold">
                  No tasks
                </div>
              )}
            />
          </div>
        )}

        {activeView === 'calendar' && (
          <div className="h-full p-6">
            <ViewLoading style="calendar" message="Calendar view coming soon" />
          </div>
        )}

        {activeView === 'timeline' && (
          <div className="h-full p-6">
            <ViewLoading style="table" message="Timeline view coming soon" />
          </div>
        )}

        {activeView === 'dashboard' && (
          <div className="h-full p-6">
            <ViewLoading style="skeleton" message="Dashboard view coming soon" />
          </div>
        )}

        {activeView === 'widgets' && (
          <div className="h-full p-6">
            <ViewLoading style="skeleton" message="Widgets view coming soon" />
          </div>
        )}
      </div>
    </div>
  );
}
