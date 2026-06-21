"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  organizationApiPath,
  requestOrganizationAction,
} from "@/domains/organization/api/organization-request";
import { useWorkspaceResource } from "@/domains/resources/workspace-resource-request";

export type ClientTaskPayload = {
  title: string;
  status?: "todo" | "inProgress" | "waiting" | "done" | "canceled";
  visibility?: "private" | "team" | "workspace";
  priority?: "low" | "normal" | "high" | "urgent";
  assigneeUserId?: string;
  dueDate?: string;
  description?: string;
  tags?: string[];
  clientId?: string;
  projectId?: string;
};

type ClientTaskOption = {
  id: string;
  title: string;
  clientId: string;
};

export function useClientTasksQuery(organizationId: string | undefined, assigneeUserId?: string) {
  return useQuery(
    api.clientTasks.read.list,
    organizationId ? { organizationId, assigneeUserId } : "skip",
  );
}

export function useClientTaskOptionsQuery(organizationId?: string, options: { enabled?: boolean } = {}) {
  return useWorkspaceResource<ClientTaskOption[]>(
    ["client-tasks", "options", organizationId],
    options.enabled !== false ? organizationId : undefined,
    "tasks/options",
  );
}

export async function createClientTaskRequest(organizationId: string, input: ClientTaskPayload) {
  return requestOrganizationAction(
    organizationApiPath(organizationId, "client-tasks"),
    "POST",
    input,
    "Task request failed.",
  );
}

export async function updateClientTaskRequest(organizationId: string, taskId: string, input: ClientTaskPayload) {
  return requestOrganizationAction(
    organizationApiPath(organizationId, "client-tasks", taskId),
    "PATCH",
    input,
    "Task request failed.",
  );
}

export async function deleteClientTaskRequest(organizationId: string, taskId: string) {
  return requestOrganizationAction(
    organizationApiPath(organizationId, "client-tasks", taskId),
    "DELETE",
    undefined,
    "Task request failed.",
  );
}
