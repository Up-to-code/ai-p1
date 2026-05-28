"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  organizationApiPath,
  requestOrganizationAction,
} from "@/domains/organization/api/organization-request";
import { useWorkspaceResource } from "@/domains/resources/workspace-resource-request";

export type ClientTaskPayload = {
  clientId: string;
  title: string;
  status?: "open" | "done" | "canceled";
  visibility?: "private" | "public";
  priority?: "normal" | "high" | "urgent";
  dueAt?: number;
  propertyId?: string;
  projectId?: string;
  calendarEventId?: string;
  notes?: string;
};

type ClientTaskOption = {
  id: string;
  title: string;
  clientId: string;
};

export function useClientTasksQuery(organizationId: string | undefined, clientId?: string) {
  return useQuery(
    api.clientTasks.read.list,
    organizationId ? { organizationId, clientId: clientId ? (clientId as Id<"clients">) : undefined } : "skip",
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
