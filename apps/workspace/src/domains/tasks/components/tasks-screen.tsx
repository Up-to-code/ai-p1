"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ListTodo, Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAccountContext } from "@/domains/auth";
import {
  DetailNotFoundState,
  EmptyWorkspace,
  WorkspaceQueryState,
} from "@/components/shared/crud-ui";
import { usePathname, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { TaskGroupedList } from "./task-grouped-list";
import { TaskEditor } from "./task-editor";
import {
  nextTaskPipelineOrder,
  taskFormValuesForPipeline,
} from "../task-pipeline-order";
import { useCurrentProjectId } from "@/domains/projects/hooks/use-current-project-id";
import { useCurrentSpace } from "@/domains/projects/hooks/use-current-space";
import {
  createTaskRequest,
  updateTaskRequest,
  assignTasksToProjectRequest,
  useTaskQuery,
  useTasksQuery,
} from "../api/tasks";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import type { TaskRecord, TaskStatus } from "../tasks.types";
import { cn } from "@/lib/utils";
import {
  ownershipFilters,
  type OwnershipFilter,
  emptyTask,
  taskDocumentContext,
} from "../tasks.constants";
import {
  useTaskMentionOptions,
  useMemberOptions,
} from "./task-hooks";
import { TaskBoardSkeleton } from "./task-board-skeleton";
import { taskLog } from "../task-log";
import { useOptimisticTaskActions, taskOptimisticMove } from "../hooks/use-optimistic-actions";

// ─── TasksScreen (split-pane) ─────────────────────────────────────────────────

export function TasksScreen({
  projectId: projectIdProp,
}: { hideShell?: boolean; projectId?: string | null } = {}) {
  const t = useTranslations("Tasks");
  const common = useTranslations("Common");
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const organizationId =
    workspaceStatus === "ready"
      ? (account.workspace.organizationId ?? undefined)
      : undefined;

  const statusTabs = useMemo<
    Array<{ value: TaskStatus | "all"; label: string }>
  >(
    () => [
      { value: "all", label: t("filters.allStatuses") },
      { value: "todo", label: t("statuses.todo") },
      { value: "inProgress", label: t("statuses.inProgress") },
      { value: "waiting", label: t("statuses.waiting") },
      { value: "done", label: t("statuses.done") },
    ],
    [t],
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [ownership, setOwnership] = useState<OwnershipFilter>("all");
  const [projectFilter, setProjectFilter] = useState<string>("");
  const [isModalFullscreen, setIsModalFullscreen] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const selectedId = searchParams.get("taskId");
  const appPrefix = useMemo(() => {
    const first = pathname.split("/").filter(Boolean)[0];
    return first && /^[a-z]{2}(?:-[A-Z]{2})?$/.test(first) ? `/${first}` : "";
  }, [pathname]);

  const projectIdFromUrl = useCurrentProjectId();
  const projectId =
    projectIdProp !== undefined ? projectIdProp : projectIdFromUrl;
  const currentSpace = useCurrentSpace();
  const spaceId = currentSpace?.spaceId ?? null;

  const projectOptions = useProjectOptionsQueryResult(organizationId, { limit: 200 });
  const projectList = useMemo(
    () => projectOptions.data ?? [],
    [projectOptions.data],
  );

  const setSelectedId = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id) params.set("taskId", id);
      else params.delete("taskId");
      const next = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      router.replace(next as never, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const tasksResult = useTasksQuery(organizationId, {
    status: "all",
    search,
    projectId: projectId ?? (projectFilter || null),
    spaceId,
  });
  const emptyTasks = useMemo(() => [] as TaskRecord[], []);
  const rawTasks = tasksResult.data ?? emptyTasks;

  const optimistic = useOptimisticTaskActions();
  const tasks = useMemo(() => optimistic.applyToList(rawTasks), [rawTasks, optimistic.version]);

  // Auto-remove optimistic actions once real-time data catches up
  useEffect(() => {
    optimistic.reconcile(rawTasks);
  }, [rawTasks, optimistic.reconcile]);

  const memberOptions = useMemberOptions(organizationId, account.user);
  const listDocumentContext = organizationId
    ? taskDocumentContext(organizationId, projectId, null)
    : undefined;
  const mentionOptions = useTaskMentionOptions({
    organizationId,
    context: listDocumentContext,
    members: memberOptions,
    tasks,
    appPrefix,
  });

  const filteredTasks = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return tasks.filter((task) => {
      if (task._deleted) return false;
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
        return task.assigneeUserId === account.user.id;
      if (ownership === "sentByMe")
        return task.createdByUserId === account.user.id;
      return true;
    });
  }, [search, tasks, ownership, account.user.id]);

  // The task currently open in the right pane
  const selectedTask = useMemo(
    () => filteredTasks.find((t) => t.id === selectedId) ?? null,
    [filteredTasks, selectedId],
  );

  const moveTaskMutation = useMutation({
    mutationFn: async (variables: {
      organizationId: string;
      task: TaskRecord;
      status: TaskStatus;
      statusTasks: TaskRecord[];
      targetIndex: number;
    }) => {
      const pipelineOrder = nextTaskPipelineOrder(variables.statusTasks, variables.task.id, variables.targetIndex);
      return updateTaskRequest(variables.organizationId, variables.task.id, taskFormValuesForPipeline(variables.task, variables.status, pipelineOrder));
    },
    onSuccess: (_data, variables) => {
      taskLog.info("drag:committed", {
        taskId: variables.task.id,
        newStatus: variables.status,
      });
    },
    onError: (_error, variables) => {
      taskLog.error("drag:rollback", { taskId: variables.task.id });
    },
  });

  function handleTaskDrop(
    taskId: string,
    newStatus: TaskStatus,
    targetIndex: number,
  ) {
    if (!organizationId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    taskLog.info("drop:received", {
      taskId,
      from: task.status,
      to: newStatus,
      targetIndex,
    });
    const statusTasks = tasks.filter(
      (candidate) => candidate.status === newStatus,
    );
    const pipelineOrder = nextTaskPipelineOrder(statusTasks, taskId, targetIndex);

    optimistic.push(taskOptimisticMove(taskId, newStatus, pipelineOrder));

    moveTaskMutation.mutate({
      organizationId,
      task,
      status: newStatus,
      statusTasks,
      targetIndex,
    });
  }

  async function createNewTask() {
    if (!organizationId) return;
    taskLog.info("create:start", { projectId: projectId ?? "" });
    const result = await createTaskRequest(organizationId, {
      ...emptyTask,
      projectId: projectId ?? "",
    });
    taskLog.info("create:success", { taskId: result.task.id });
    setSelectedId(result.task.id);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Page header ── */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-8 h-14 sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <ListTodo className="h-4 w-4 text-text-muted shrink-0" />
          <h1 className="text-sm font-semibold text-foreground shrink-0 tracking-tight">
            {t("title")}
          </h1>
          <div className="h-4 w-px bg-border shrink-0" />
          <div className="inline-flex items-center rounded-xl border border-border bg-card p-0.5 gap-0.5">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  "h-6 rounded-lg px-2.5 text-[11px] font-semibold transition-all",
                  statusFilter === tab.value
                    ? "bg-foreground text-background"
                    : "text-text-muted hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:ring-2 focus-within:ring-ring/20">
            <Search className="h-3.5 w-3.5 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={common("search")}
              className="h-full w-32 bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-text-muted"
            />
          </div>
          <select
            value={ownership}
            onChange={(event) =>
              setOwnership(event.target.value as OwnershipFilter)
            }
            className="h-8 rounded-xl border border-border bg-card px-2.5 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring/20"
          >
            {ownershipFilters.map((f) => (
              <option key={f} value={f}>
                {f === "all"
                  ? t("filters.all")
                  : f === "assignedToMe"
                    ? t("filters.assignedToMe")
                    : t("filters.sentByMe")}
              </option>
            ))}
          </select>
          {!projectId && projectList.length > 0 && (
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="h-8 rounded-xl border border-border bg-card px-2.5 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring/20"
            >
              <option value="">{t("filters.allProjects")}</option>
              {projectList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={createNewTask}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("actions.new")}
          </button>
        </div>
      </div>

      {/* ── Body: board + optional right editor pane ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left: task board (shrinks when editor is open) */}
        <div
          className={cn(
            "flex flex-1 flex-col overflow-hidden transition-all duration-300",
            selectedTask && "blur-[1.5px]",
          )}
        >
          <div className="flex-1 overflow-auto p-6">
            {workspaceStatus !== "ready" ? (
              <WorkspaceQueryState status={workspaceStatus} variant="table" />
            ) : tasksResult.error ? (
              <div className="flex flex-col items-center justify-center gap-4 p-8">
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {tasksResult.error}
                </p>
                <button
                  type="button"
                  onClick={() => tasksResult.refetch()}
                  className="inline-flex h-9 items-center rounded-xl bg-primary px-4 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
                >
                  {common("tryAgain")}
                </button>
              </div>
            ) : tasksResult.data === undefined ? (
              <TaskBoardSkeleton />
            ) : filteredTasks.length === 0 ? (
              <EmptyWorkspace
                icon={ListTodo}
                title={t("empty.title")}
                description={t("empty.description")}
              />
            ) : (
              <TaskGroupedList
                tasks={filteredTasks}
                statusFilter={statusFilter}
                onTaskDrop={handleTaskDrop}
                onTaskClick={(id) =>
                  setSelectedId(id === selectedId ? null : id)
                }
                selectedId={selectedId ?? undefined}
              />
            )}
          </div>
        </div>

        {/* Task document modal */}
        {selectedTask && organizationId && (
          <div className={cn(
            "fixed inset-0 z-40 flex items-center justify-center modal-overlay-animate-in",
          )}>
            <button
              type="button"
              aria-label="Close task document"
              className="absolute inset-0 cursor-default bg-black/20 backdrop-blur-[2px] dark:bg-black/45"
              onClick={() => setSelectedId(null)}
            />
            <div className={cn(
              "relative z-10 overflow-hidden border border-border bg-background flex flex-col modal-content-animate-in",
              isModalFullscreen
                ? "w-screen h-screen rounded-none border-0"
                : "w-[90vw] h-[90vh] rounded-2xl",
            )}>
              <TaskEditor
                key={selectedTask.id}
                task={selectedTask}
                organizationId={organizationId}
                memberOptions={memberOptions}
                mentionOptions={mentionOptions}
                onClose={() => setSelectedId(null)}
                onSaved={() => {}}
                onDeleted={() => {
                  setSelectedId(null);
                }}
                routeProjectId={projectId}
                isFullscreen={isModalFullscreen}
                onToggleFullscreen={() => setIsModalFullscreen((v) => !v)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
