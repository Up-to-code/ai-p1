"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { workspaceMutation } from "@/domains/resources/workspace-resource-request";
import { createResourceApi } from "@/domains/resources/resource-api-factory";
import type { TaskFormValues, TaskRecord, TaskStats } from "../tasks.types";

export type GroupBy = "none" | "status" | "priority" | "assignee" | "dueDate"

const GROUP_BY_STORAGE_PREFIX = "qentrah.tasks.groupBy."

export function readPersistedGroupBy(projectId: string | null | undefined, fallback: GroupBy = "none"): GroupBy {
  if (typeof window === "undefined") return fallback
  try {
    const key = `${GROUP_BY_STORAGE_PREFIX}${projectId ?? "_"}`
    const v = window.localStorage.getItem(key)
    if (!v) return fallback
    if (["none", "status", "priority", "assignee", "dueDate"].includes(v)) return v as GroupBy
  } catch {
    // localStorage may be unavailable
  }
  return fallback
}

export function writePersistedGroupBy(projectId: string | null | undefined, value: GroupBy) {
  if (typeof window === "undefined") return
  try {
    const key = `${GROUP_BY_STORAGE_PREFIX}${projectId ?? "_"}`
    window.localStorage.setItem(key, value)
  } catch {
    // ignore
  }
}

export function useTasksQuery(organizationId?: string, options?: { status?: TaskRecord["status"] | "all"; search?: string; projectId?: string | null; spaceId?: string | null }) {
  const allTasks = useQuery(
    api.clientTasks.read.list,
    organizationId ? { organizationId } : "skip",
  );

  const projectTasks = useQuery(
    api.clientTasks.read.listByProject,
    organizationId && options?.projectId && !options?.spaceId
      ? { organizationId, projectId: options.projectId }
      : "skip",
  );

  const spaceTasks = useQuery(
    api.clientTasks.read.listBySpace,
    organizationId && options?.projectId && options?.spaceId
      ? { organizationId, projectId: options.projectId, spaceId: options.spaceId }
      : "skip",
  );

  const tasks = options?.spaceId ? spaceTasks : options?.projectId ? projectTasks : allTasks;
  const status = options?.status;
  const search = options?.search?.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!tasks) return undefined;
    if (!status && !search) return tasks;
    return tasks.filter((task) => {
      if (status && status !== "all" && task.status !== status) return false;
      if (search) {
        const haystack = [task.title, task.description, task.assigneeUserId, ...(task.tags ?? [])];
        if (!haystack.some((v) => v?.toLowerCase().includes(search))) return false;
      }
      return true;
    });
  }, [tasks, status, search]);

  return { data: filtered, isLoading: tasks === undefined, isError: false, error: undefined as string | undefined, refetch: () => {} };
}

export function useTasksGroupedQuery(
  organizationId: string | undefined,
  options: { projectId?: string | null; groupBy: GroupBy },
) {
  // Prefer the generated listGrouped reference. If it is missing (stale
  // codegen) or the deployment hasn't picked it up yet, fall back to the
  // appropriate flat-list query. The function reference is resolved once
  // at module load so the hook order stays stable across renders.
  const listGrouped = (api as unknown as { clientTasks?: { read?: { listGrouped?: unknown } } })
    .clientTasks?.read?.listGrouped;
  const hasGroupedFn = typeof listGrouped === "function";

  const queryRef = hasGroupedFn
    ? (listGrouped as unknown as Parameters<typeof useQuery>[0])
    : options.projectId
      ? api.clientTasks.read.listByProject
      : api.clientTasks.read.list;

  const args = hasGroupedFn
    ? organizationId
      ? {
          organizationId,
          projectId: options.projectId ?? undefined,
          groupBy: options.groupBy,
        }
      : "skip"
    : organizationId
      ? options.projectId
        ? { organizationId, projectId: options.projectId }
        : { organizationId }
      : "skip";

  const data = useQuery(queryRef, args as never);

  if (!hasGroupedFn) {
    return {
      groups: [] as { key: string; label: string; count: number; tasks: TaskRecord[] }[],
      flat: (data ?? []) as TaskRecord[],
    };
  }
  const result = (data ?? { groups: [], flat: [] }) as {
    groups: { key: string; label: string; count: number; tasks: TaskRecord[] }[];
    flat: TaskRecord[];
  };
  return result;
}

export function useTaskStatsQuery(organizationId?: string) {
  return useQuery(
    api.clientTasks.read.stats,
    organizationId ? { organizationId } : "skip",
  ) as TaskStats | undefined;
}

export function useTaskQuery(organizationId: string | undefined, taskId: string) {
  const task = useQuery(
    api.clientTasks.read.get,
    organizationId && taskId ? { organizationId, taskId: taskId as any } : "skip",
  );
  return { data: task ?? null, isLoading: task === undefined, isError: false, error: undefined as string | undefined, refetch: () => {} };
}

export function taskPayloadFromForm(values: TaskFormValues) {
  return {
    title: values.title,
    status: values.status,
    pipelineOrder: typeof values.pipelineOrder === "number" && Number.isFinite(values.pipelineOrder) ? values.pipelineOrder : undefined,
    priority: values.priority,
    visibility: values.visibility,
    assigneeUserId: values.assigneeUserId || undefined,
    clientId: values.clientId || undefined,
    projectId: values.projectId || undefined,
    spaceId: values.spaceId || undefined,
    dueDate: values.dueDate || undefined,
    description: values.description || undefined,
    tags: values.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
  };
}

export const taskApi = createResourceApi<TaskRecord, TaskFormValues, TaskFormValues>({
  resourcePath: "tasks",
  resourceKey: "task",
  toPayload: taskPayloadFromForm,
});

export const createTaskRequest = taskApi.create;
export const updateTaskRequest = taskApi.update;
export const deleteTaskRequest = taskApi.remove;

export async function assignTasksToProjectRequest(
  organizationId: string,
  taskIds: string[],
  projectId: string,
) {
  return workspaceMutation<{ updated: number }>(organizationId, "tasks/assign-to-project", {
    method: "POST",
    body: { taskIds, projectId },
    fallbackMessage: "Failed to assign tasks to project.",
  });
}
