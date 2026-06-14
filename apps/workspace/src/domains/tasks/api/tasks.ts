"use client";

import { useWorkspaceResource } from "@/domains/resources/workspace-resource-request";
import {
  organizationApiPath,
  requestOrganizationAction,
} from "@/domains/organization/api/organization-request";
import type { TaskFormValues, TaskRecord, TaskStats } from "../tasks.types";

export function useTasksQuery(organizationId?: string, options?: { status?: TaskRecord["status"] | "all"; search?: string; projectId?: string | null }) {
  return useWorkspaceResource<TaskRecord[]>(
    ["tasks", organizationId, options?.status, options?.search, options?.projectId],
    organizationId,
    "tasks",
    {
      status: options?.status === "all" ? undefined : options?.status,
      search: options?.search,
      projectId: options?.projectId ?? undefined,
    },
  );
}

export function useTaskStatsQuery(organizationId?: string) {
  return useWorkspaceResource<TaskStats>(
    ["tasks-stats", organizationId],
    organizationId,
    "tasks/stats",
  );
}

export function useTaskQuery(organizationId: string | undefined, taskId: string) {
  return useWorkspaceResource<TaskRecord | null>(
    ["task", organizationId, taskId],
    organizationId && taskId ? organizationId : undefined,
    `tasks/${taskId}`,
  );
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
