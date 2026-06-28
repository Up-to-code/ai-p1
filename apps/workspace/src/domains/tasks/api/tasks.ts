"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { workspaceMutation } from "@/domains/resources/workspace-resource-request";
import type { TaskFormValues, TaskRecord, TaskStats } from "../tasks.types";

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

  // Priority: spaceTasks > projectTasks > allTasks
  const tasks = options?.spaceId ? spaceTasks : options?.projectId ? projectTasks : allTasks;

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
    spaceId: values.spaceId || undefined,
    dueDate: values.dueDate || undefined,
    description: values.description || undefined,
    tags: values.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
  };
}

export async function createTaskRequest(organizationId: string, values: TaskFormValues) {
  return workspaceMutation<{ task: TaskRecord }>(organizationId, "tasks", {
    method: "POST",
    body: taskPayloadFromForm(values),
    fallbackMessage: "Task request failed.",
  });
}

export async function updateTaskRequest(organizationId: string, taskId: string, values: TaskFormValues) {
  return workspaceMutation<{ task: TaskRecord }>(organizationId, `tasks/${taskId}`, {
    method: "PATCH",
    body: taskPayloadFromForm(values),
    fallbackMessage: "Task request failed.",
  });
}

export async function deleteTaskRequest(organizationId: string, taskId: string) {
  return workspaceMutation(organizationId, `tasks/${taskId}`, {
    method: "DELETE",
    body: undefined,
    fallbackMessage: "Task request failed.",
  });
}

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
