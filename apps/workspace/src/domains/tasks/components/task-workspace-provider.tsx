"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { useAuthSession } from "@/domains/auth";
import { useNavigation } from "@/domains/navigation";
import { useCurrentProjectId } from "@/domains/projects/hooks/use-current-project-id";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import { useTasksQuery } from "../api/tasks";
import { useTaskMutations } from "../hooks/use-task-mutations";
import { useMemberOptions } from "../hooks/use-task-mention-options";
import { filterTasksForSidebar } from "../lib/task-sidebar-filter";
import type { TaskRecord } from "../tasks.types";
import type { WorkOsPickerOption } from "@/domains/work-os/components/work-os-record-picker";
import { TaskCreateModal } from "./task-create-modal";
import { TaskEditModal } from "./task-edit-modal";

const TASK_PAGE_SIZE = 50;

type TaskCreateDefaults = Pick<
  Partial<TaskRecord>,
  "status" | "priority" | "assigneeUserId" | "dueDate" | "tags"
>;

type TaskWorkspaceContextValue = {
  workspaceStatus: ReturnType<typeof useAuthSession>["workspace"]["status"];
  organizationId?: string;
  projectId: string | null;
  spaceId: string | null;
  currentUserId: string;
  tasks: TaskRecord[];
  pagedTasks: TaskRecord[];
  memberOptions: WorkOsPickerOption[];
  page: number;
  totalPages: number;
  pageStart: number;
  pageEnd: number;
  setPage: (page: number | ((current: number) => number)) => void;
  openCreateTask: () => void;
  openTask: (taskId: string) => void;
  updateTask: (task: TaskRecord, changes: Partial<TaskRecord>) => Promise<void>;
  deleteTask: (task: TaskRecord) => Promise<void>;
  createTask: (title: string, defaults?: TaskCreateDefaults) => Promise<void>;
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
  const [page, setPage] = useState(1);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const organizationId =
    session.workspace.status === "ready"
      ? (session.workspace.organizationId ?? undefined)
      : undefined;
  const projectIdFromUrl = useCurrentProjectId();
  const { spaceId } = useNavigation();
  const projectOptions = useProjectOptionsQueryResult(organizationId, {
    limit: 200,
  });
  const projectId = useMemo(
    () =>
      projectIdFromUrl &&
      projectOptions.data?.some((project) => project.id === projectIdFromUrl)
        ? projectIdFromUrl
        : null,
    [projectIdFromUrl, projectOptions.data],
  );
  const tasksResult = useTasksQuery(organizationId, {
    status: "all",
    projectId,
    spaceId,
  });
  const mutations = useTaskMutations(organizationId ?? "");
  const rawTasks = tasksResult.data ?? [];
  const optimisticTasks = mutations.applyOptimistic(rawTasks);
  const sidebarFilter = searchParams.get("filter") ?? "all";
  const tasks = useMemo(
    () =>
      filterTasksForSidebar(optimisticTasks, sidebarFilter, session.user.id),
    [optimisticTasks, session.user.id, sidebarFilter],
  );
  const { data: memberOptions } = useMemberOptions(
    organizationId,
    session.user,
  );
  const totalPages = Math.max(1, Math.ceil(tasks.length / TASK_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedTasks = useMemo(() => {
    const start = (currentPage - 1) * TASK_PAGE_SIZE;
    return tasks.slice(start, start + TASK_PAGE_SIZE);
  }, [currentPage, tasks]);

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

  const createTask = useCallback(
    async (title: string, defaults?: TaskCreateDefaults) => {
      if (!organizationId) return;
      await mutations.createTask({
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
    [mutations, organizationId, projectId, spaceId],
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
      organizationId,
      projectId,
      spaceId,
      currentUserId: session.user.id,
      tasks,
      pagedTasks,
      memberOptions,
      page: currentPage,
      totalPages,
      pageStart:
        tasks.length === 0 ? 0 : (currentPage - 1) * TASK_PAGE_SIZE + 1,
      pageEnd: Math.min(currentPage * TASK_PAGE_SIZE, tasks.length),
      setPage,
      openCreateTask: () => setCreateTaskOpen(true),
      openTask: setOpenTaskId,
      updateTask,
      deleteTask,
      createTask,
      moveTask,
    }),
    [
      createTask,
      currentPage,
      deleteTask,
      memberOptions,
      moveTask,
      organizationId,
      pagedTasks,
      projectId,
      session.user.id,
      session.workspace.status,
      spaceId,
      tasks,
      totalPages,
      updateTask,
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
        onCreated={setOpenTaskId}
      />
      <TaskEditModal
        taskId={openTaskId}
        open={Boolean(openTaskId)}
        onClose={() => setOpenTaskId(null)}
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
