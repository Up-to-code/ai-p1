"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  organizationApiPath,
  requestOrganizationAction,
} from "@/domains/organization/api/organization-request";
import type { TaskFormValues, TaskRecord, TaskStats } from "../tasks.types";

export function useTasksQuery(organizationId?: string, options?: { status?: TaskRecord["status"] | "all"; search?: string; projectId?: string | null }) {
  const allTasks = useQuery(
    api.clientTasks.read.list,
    organizationId ? { organizationId } : "skip",
  );

  const projectTasks = useQuery(
    api.clientTasks.read.listByProject,
    organizationId && options?.projectId
      ? { organizationId, projectId: options.projectId }
      : "skip",
  );

  const tasks = options?.projectId ? projectTasks : allTasks;

  const filtered = tasks?.filter((task) => {
    if (options?.status && options.status !== "all" && task.status !== options.status) return false;
    if (options?.search?.trim()) {
      const needle = options.search.trim().toLowerCase();
      const haystack = [task.title, task.description, task.assigneeUserId, ...(task.tags ?? [])];
      if (!haystack.some((v) => v?.toLowerCase().includes(needle))) return false;
    }
    return true;
  });

  return { data: filtered, error: undefined as string | undefined, refetch: () => {} };
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
  return { data: task ?? null, error: undefined as string | undefined, refetch: () => {} };
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
