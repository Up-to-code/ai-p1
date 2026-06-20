"use client";

import { useWorkspaceResource, useWorkspaceResourceResult } from "@/domains/resources/workspace-resource-request";
import {
  organizationApiPath,
  requestOrganizationAction,
} from "@/domains/organization/api/organization-request";
import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { TaskFormValues, TaskRecord, TaskStats } from "../tasks.types";

export function useTasksQuery(organizationId?: string, options?: { status?: TaskRecord["status"] | "all"; search?: string; projectId?: string | null }) {
  const result = useWorkspaceResourceResult<TaskRecord[]>(
    ["tasks", organizationId, options?.status, options?.search, options?.projectId],
    organizationId,
    "tasks",
    {
      status: options?.status === "all" ? undefined : options?.status,
      search: options?.search,
      projectId: options?.projectId ?? undefined,
    },
  );
  return { data: result.data, error: result.errorMessage, refetch: result.refetch };
}

export function useTaskStatsQuery(organizationId?: string) {
  return useWorkspaceResource<TaskStats>(
    ["tasks-stats", organizationId],
    organizationId,
    "tasks/stats",
  );
}

export function useTaskQuery(organizationId: string | undefined, taskId: string) {
  const result = useWorkspaceResourceResult<TaskRecord | null>(
    ["task", organizationId, taskId],
    organizationId && taskId ? organizationId : undefined,
    `tasks/${taskId}`,
  );
  return { data: result.data, error: result.errorMessage, refetch: result.refetch };
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
    dueDate: values.dueDate || undefined,
    description: values.description || undefined,
    tags: values.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
  };
}

export async function createTaskRequest(organizationId: string, values: TaskFormValues) {
  return requestOrganizationAction<{ task: TaskRecord }>(
    organizationApiPath(organizationId, "tasks"),
    "POST",
    taskPayloadFromForm(values),
    "Task request failed.",
  );
}

export async function updateTaskRequest(organizationId: string, taskId: string, values: TaskFormValues) {
  return requestOrganizationAction<{ task: TaskRecord }>(
    organizationApiPath(organizationId, "tasks", taskId),
    "PATCH",
    taskPayloadFromForm(values),
    "Task request failed.",
  );
}

export async function deleteTaskRequest(organizationId: string, taskId: string) {
  return requestOrganizationAction(
    organizationApiPath(organizationId, "tasks", taskId),
    "DELETE",
    undefined,
    "Task request failed.",
  );
}

function taskMatchesTasksQuery(task: TaskRecord, queryKey: QueryKey) {
  const [, , status, search, projectId] = queryKey;
  if (typeof status === "string" && status !== "all" && task.status !== status) {
    return false;
  }
  if (typeof projectId === "string" && projectId && task.projectId !== projectId) {
    return false;
  }
  if (typeof search === "string" && search.trim()) {
    const needle = search.trim().toLowerCase();
    const haystack = [
      task.title,
      task.description,
      task.assigneeUserId,
      ...(task.tags ?? []),
    ];
    if (!haystack.some((value) => value?.toLowerCase().includes(needle))) {
      return false;
    }
  }
  return true;
}

export function upsertTaskInTaskCaches(
  queryClient: QueryClient,
  organizationId: string,
  task: TaskRecord,
) {
  const entries = queryClient.getQueriesData<TaskRecord[]>({
    queryKey: ["tasks", organizationId],
  });
  for (const [queryKey, data] of entries) {
    if (!data) continue;
    const exists = data.some((candidate) => candidate.id === task.id);
    const belongs = taskMatchesTasksQuery(task, queryKey);
    const next = exists
      ? belongs
        ? data.map((candidate) => (candidate.id === task.id ? task : candidate))
        : data.filter((candidate) => candidate.id !== task.id)
      : belongs
        ? [task, ...data]
        : data;
    queryClient.setQueryData(queryKey, next);
  }
  queryClient.setQueryData<TaskRecord | null>(
    ["task", organizationId, task.id],
    task,
  );
}

export function removeTaskFromTaskCaches(
  queryClient: QueryClient,
  organizationId: string,
  taskId: string,
) {
  queryClient.setQueriesData<TaskRecord[]>(
    { queryKey: ["tasks", organizationId] },
    (data) => data?.filter((task) => task.id !== taskId),
  );
  queryClient.setQueryData<TaskRecord | null>(
    ["task", organizationId, taskId],
    null,
  );
}

export async function assignTasksToProjectRequest(
  organizationId: string,
  taskIds: string[],
  projectId: string,
) {
  return requestOrganizationAction<{ updated: number }>(
    organizationApiPath(organizationId, "tasks", "assign-to-project"),
    "POST",
    { taskIds, projectId },
    "Failed to assign tasks to project.",
  );
}
