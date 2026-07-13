"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/routing";
import { useAuthSession } from "@/domains/auth";
import { useNavigation } from "@/domains/navigation";
import { useCurrentProjectId } from "@/domains/projects/hooks/use-current-project-id";
import { useTaskWorkspaceQuery } from "../api/tasks";
import { useTaskMutations } from "../hooks/use-task-mutations";
import { useMemberOptions } from "../hooks/use-task-mention-options";
import type { TaskRecord } from "../tasks.types";
import type { WorkOsPickerOption } from "@/domains/work-os/components/work-os-record-picker";
import { TaskCreateModal } from "./task-create-modal";
import {
  resolveTaskWorkspaceState,
  type TaskWorkspaceState,
} from "../workspace/task-workspace-state";
import {
  parseTaskWorkspaceViewState,
  resolveTaskWorkspaceViewHref,
  selectTaskWorkspaceRecords,
  type TaskWorkspaceViewState,
} from "../workspace/task-workspace-view-state";
import {
  runTaskQuickCreate,
  type TaskQuickCreateCommand,
  type TaskQuickCreateResult,
} from "../workspace/task-quick-create";
import type { TaskBulkCommand } from "../workspace/task-bulk";

type TaskWorkspaceContextValue = {
  workspaceStatus: ReturnType<typeof useAuthSession>["workspace"]["status"];
  state: TaskWorkspaceState;
  viewState: TaskWorkspaceViewState;
  updateViewState: (patch: Partial<TaskWorkspaceViewState>) => void;
  organizationId?: string;
  projectId: string | null;
  spaceId: string | null;
  currentUserId: string;
  tasks: TaskRecord[];
  pagedTasks: TaskRecord[];
  memberOptions: WorkOsPickerOption[];
  canLoadMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  openCreateTask: () => void;
  openTask: (taskId: string) => void;
  updateTask: (task: TaskRecord, changes: Partial<TaskRecord>) => Promise<void>;
  deleteTask: (task: TaskRecord) => Promise<void>;
  createTask: TaskQuickCreateCommand;
  bulkTasks: TaskBulkCommand;
  moveTask: (
    itemId: string,
    fromStage: string,
    toStage: string,
    targetIndex: number,
  ) => void;
};

const TaskWorkspaceContext = createContext<TaskWorkspaceContextValue | null>(
  null,
);

export function TaskWorkspaceProvider({ children }: { children: ReactNode }) {
  const session = useAuthSession();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const quickCreateInFlight = useRef<Promise<TaskQuickCreateResult> | null>(null);
  const organizationId =
    session.workspace.status === "ready"
      ? (session.workspace.organizationId ?? undefined)
      : undefined;
  const projectIdFromUrl = useCurrentProjectId();
  const { spaceId } = useNavigation();
  // The exact record and tenant relation are validated by listPage. Avoid a
  // bounded client-side options scan that can reject valid Projects.
  const projectId = projectIdFromUrl;
  const viewState = useMemo(
    () => parseTaskWorkspaceViewState(searchParams),
    [searchParams],
  );
  const tasksResult = useTaskWorkspaceQuery(organizationId, {
    projectId,
    spaceId,
    ownership: viewState.filter === "my"
      ? "assignedToMe"
      : viewState.filter === "assigned"
        ? "sentByMe"
        : "all",
  });
  const mutations = useTaskMutations(organizationId ?? "");
  const rawTasks = tasksResult.results;
  const optimisticTasks = mutations.applyOptimistic(rawTasks);
  const tasks = useMemo(
    () => selectTaskWorkspaceRecords(optimisticTasks, viewState, session.user.id),
    [optimisticTasks, session.user.id, viewState],
  );
  const state = resolveTaskWorkspaceState({
    workspaceStatus: session.workspace.status,
    queryLoading: tasksResult.status === "LoadingFirstPage",
    sourceCount: optimisticTasks.length,
    visibleCount: tasks.length,
    hasActiveFilter: viewState.filter !== "all" || Boolean(viewState.search),
    hasMore: tasksResult.status === "CanLoadMore" || tasksResult.status === "LoadingMore",
  });
  const { data: memberOptions } = useMemberOptions(
    organizationId,
    session.user,
  );
  const updateViewState = useCallback(
    (patch: Partial<TaskWorkspaceViewState>) => {
      const href = resolveTaskWorkspaceViewHref(
        pathname,
        new URLSearchParams(searchParams.toString()),
        { ...viewState, ...patch },
      );
      if (href) router.replace(href);
    },
    [pathname, router, searchParams, viewState],
  );

  const updateTask = useCallback(
    async (task: TaskRecord, changes: Partial<TaskRecord>) => {
      if (!organizationId) return;
      await mutations.updateTask(task, changes);
    },
    [mutations, organizationId],
  );

  const deleteTask = useCallback(
    async (task: TaskRecord) => {
      if (!organizationId) return;
      await mutations.deleteTask(task);
    },
    [mutations, organizationId],
  );

  const openTask = useCallback((taskId: string) => {
    router.push(`/tasks/${taskId}`);
  }, [router]);

  const createTask = useCallback<TaskQuickCreateCommand>(
    async (draft) => {
      if (!organizationId) throw new Error("An active Organization is required.");
      if (quickCreateInFlight.current) return quickCreateInFlight.current;
      const operation = runTaskQuickCreate(draft, {
        create: async (normalized) => {
          const activeProjectId = normalized.projectId === undefined
            ? projectId
            : normalized.projectId;
          const activeSpaceId = normalized.spaceId === undefined
            ? spaceId
            : normalized.spaceId;
          const result = await mutations.createTask({
            title: normalized.title,
            status: normalized.status,
            priority: normalized.priority,
            assigneeUserId: normalized.assigneeUserId,
            dueDate: normalized.dueDate,
            description: normalized.description,
            tags: normalized.tags?.join(", "),
            projectId: activeProjectId ?? "",
            spaceId: activeSpaceId ?? "",
          });
          const task = result.task;
          if (!task) throw new Error("Task creation did not return an identity.");
          return { taskId: task.id };
        },
        open: openTask,
      });
      quickCreateInFlight.current = operation;
      try {
        return await operation;
      } finally {
        if (quickCreateInFlight.current === operation) quickCreateInFlight.current = null;
      }
    },
    [mutations, openTask, organizationId, projectId, spaceId],
  );

  const moveTask = useCallback(
    (
      itemId: string,
      _fromStage: string,
      toStage: string,
      targetIndex: number,
    ) => {
      if (!organizationId) return;
      const task = optimisticTasks.find((candidate) => candidate.id === itemId);
      if (!task) return;
      const statusTasks = optimisticTasks.filter(
        (candidate) => candidate.status === toStage,
      );
      mutations.moveTask(task, toStage, statusTasks, targetIndex);
    },
    [mutations, optimisticTasks, organizationId],
  );

  const value = useMemo<TaskWorkspaceContextValue>(
    () => ({
      workspaceStatus: session.workspace.status,
      state,
      viewState,
      updateViewState,
      organizationId,
      projectId,
      spaceId,
      currentUserId: session.user.id,
      tasks,
      pagedTasks: tasks,
      memberOptions,
      canLoadMore: tasksResult.status === "CanLoadMore",
      isLoadingMore: tasksResult.status === "LoadingMore",
      loadMore: () => tasksResult.loadMore(50),
      openCreateTask: () => setCreateTaskOpen(true),
      openTask,
      updateTask,
      deleteTask,
      createTask,
      bulkTasks: mutations.bulkTasks,
      moveTask,
    }),
    [
      createTask,
      deleteTask,
      memberOptions,
      moveTask,
      mutations.bulkTasks,
      openTask,
      organizationId,
      projectId,
      session.user.id,
      session.workspace.status,
      state,
      spaceId,
      tasks,
      tasksResult,
      updateTask,
      updateViewState,
      viewState,
    ],
  );

  return (
    <TaskWorkspaceContext.Provider value={value}>
      {children}
      <TaskCreateModal
        organizationId={organizationId}
        projectId={projectId}
        spaceId={spaceId}
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        onCreate={createTask}
      />
    </TaskWorkspaceContext.Provider>
  );
}

export function useTaskWorkspace() {
  const context = useContext(TaskWorkspaceContext);
  if (!context)
    throw new Error(
      "useTaskWorkspace must be used inside TaskWorkspaceProvider",
    );
  return context;
}
