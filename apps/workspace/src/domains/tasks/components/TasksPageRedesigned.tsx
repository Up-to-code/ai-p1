"use client";

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from "next-intl";
import { Plus, ListTodo, Search } from "lucide-react";
import { DomainHeader, type HeaderAction } from "@/components/shared/domain/DomainHeader";
import { ViewSwitcherTabs, useViewTabs, ViewTabsContent } from "@/components/shared/view-system";
import type { ViewItem } from "@/components/shared/view-system/types";
import { ViewLoading } from "@/components/shared/loading/ViewLoading";
import { EmptyWorkspace, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useAuthSession } from "@/domains/auth";
import { useTaskMutations } from "../hooks/use-task-mutations";
import { useCurrentProjectId } from "@/domains/projects/hooks/use-current-project-id";
import { useNavigation } from "@/domains/navigation";
import { useTasksQuery } from "../api/tasks";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import type { TaskRecord, TaskStatus } from "../tasks.types";
import { ownershipFilters, type OwnershipFilter, emptyTask } from "../tasks.constants";
import { TaskFilterDropdown } from "./task-filter-dropdown";
import { TaskViewFrame } from "./views/task-view-frame";
import { taskLog } from "../task-log";
import { createTaskRequest } from "../api/tasks";

const DEFAULT_TABS: ViewItem[] = [
  { id: "default-board", type: "board", label: "Board" },
  { id: "default-table", type: "table", label: "Table" },
];

const STAGES = [
  { key: 'todo', name: 'To Do', color: '#6b7280', order: 0 },
  { key: 'inProgress', name: 'In Progress', color: '#3b82f6', order: 1 },
  { key: 'waiting', name: 'Waiting', color: '#f59e0b', order: 2 },
  { key: 'done', name: 'Done', color: '#22c55e', order: 3 },
  { key: 'canceled', name: 'Canceled', color: '#ef4444', order: 4 },
];

export function TasksPageRedesigned({
  projectId: projectIdProp,
}: { projectId?: string | null } = {}) {
  const t = useTranslations("Tasks");
  const common = useTranslations("Common");
  const session = useAuthSession();
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
  const { spaceId } = useNavigation();

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

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
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
  }, [tasks, search, ownership, session.user.id]);

  const tasksScope = projectId ? `project:${projectId}:tasks` : "tasks:global";

  const {
    tabs,
    activeTabId,
    mountedTabIds,
    setActiveTab,
    addTab,
    removeTab,
    reorderTabs,
    renameTab,
    isLoaded,
  } = useViewTabs({ scope: tasksScope, defaultTabs: DEFAULT_TABS });

  const handleCardMove = useCallback(
    (itemId: string, fromStage: string, toStage: string, targetIndex: number) => {
      if (!organizationId) return;
      const task = tasks.find((t) => t.id === itemId);
      if (!task) return;
      const newStatus = toStage as TaskStatus;
      const statusTasks = tasks.filter((candidate) => candidate.status === newStatus);
      moveTaskFromHook(task, newStatus, statusTasks, targetIndex);
    },
    [organizationId, tasks, moveTaskFromHook],
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

  const sectionLabel = isLoaded
    ? `${filteredTasks.length} task${filteredTasks.length !== 1 ? "s" : ""}`
    : "Loading...";

  const workspaceContent = (
    <div className="flex flex-col h-full">
      <DomainHeader
        domain="Tasks"
        currentSection={sectionLabel}
        actions={actions}
        showViewSwitcher={false}
      />
      <ViewSwitcherTabs
        views={tabs}
        activeViewId={activeTabId}
        onViewChange={setActiveTab}
        onReorder={reorderTabs}
        onAddView={addTab}
        onRemoveView={removeTab}
        onRenameTab={renameTab}
      />
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
      <div className="flex-1 overflow-hidden">
        <ViewTabsContent
          tabs={tabs}
          activeTabId={activeTabId}
          mountedTabIds={mountedTabIds}
          renderTab={(tab) => (
            <TaskViewFrame
              tab={tab}
              tasks={filteredTasks}
              stages={STAGES}
              onCardMove={handleCardMove}
            />
          )}
        />
      </div>
    </div>
  );

  if (workspaceStatus !== "ready") {
    return (
      <div className="flex flex-col h-full">
        <DomainHeader
          domain="Tasks"
          currentSection="All Tasks"
          actions={actions}
          showViewSwitcher={false}
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
          showViewSwitcher={false}
        />
        <ViewSwitcherTabs
          views={tabs}
          activeViewId={activeTabId}
          onViewChange={setActiveTab}
          onReorder={reorderTabs}
          onAddView={addTab}
          onRemoveView={removeTab}
          onRenameTab={renameTab}
        />
        <div className="flex-1 flex items-center justify-center">
          <EmptyWorkspace icon={ListTodo} title={t("empty.title")} description={t("empty.description")} />
        </div>
      </div>
    );
  }

  return workspaceContent;
}
