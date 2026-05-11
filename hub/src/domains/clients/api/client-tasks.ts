"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useHttpQuery } from "@/components/shared/use-http-query";

export type ClientTaskPayload = {
  clientId: string;
  title: string;
  status?: "open" | "done" | "canceled";
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

export function useClientTaskOptionsQuery(organizationId?: string) {
  return useHttpQuery<ClientTaskOption[]>(
    ["client-tasks", "options", organizationId],
    organizationId ? `/api/v1/organizations/${organizationId}/read/tasks/options` : undefined,
  );
}

async function jsonOrThrow(response: Response) {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Task request failed.");
  }
  return payload;
}

export async function createClientTaskRequest(organizationId: string, input: ClientTaskPayload) {
  const response = await fetch(`/api/v1/organizations/${organizationId}/client-tasks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return jsonOrThrow(response);
}

export async function updateClientTaskRequest(organizationId: string, taskId: string, input: ClientTaskPayload) {
  const response = await fetch(`/api/v1/organizations/${organizationId}/client-tasks/${taskId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return jsonOrThrow(response);
}

export async function deleteClientTaskRequest(organizationId: string, taskId: string) {
  const response = await fetch(`/api/v1/organizations/${organizationId}/client-tasks/${taskId}`, {
    method: "DELETE",
  });
  return jsonOrThrow(response);
}
