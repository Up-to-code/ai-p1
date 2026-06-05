import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/clerk-convex";
import type { ClientTaskPayload } from "../validation/client-task.schema";

function toConvexInput(input: ClientTaskPayload) {
  return {
    clientId: input.clientId as never,
    title: input.title,
    status: input.status,
    priority: input.priority,
    ...(input.dueAt ? { dueAt: input.dueAt } : {}),
    ...(input.propertyId ? { propertyId: input.propertyId as never } : {}),
    ...(input.projectId ? { projectId: input.projectId as never } : {}),
    ...(input.calendarEventId ? { calendarEventId: input.calendarEventId as never } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
  };
}

export async function createClientTask(organizationId: string, input: ClientTaskPayload) {
  return fetchAuthMutation(api.clientTasks.write.createFromHono, {
    organizationId,
    input: toConvexInput(input),
  });
}

export async function updateClientTask(organizationId: string, taskId: string, input: ClientTaskPayload) {
  return fetchAuthMutation(api.clientTasks.write.updateFromHono, {
    organizationId,
    taskId: taskId as never,
    input: toConvexInput(input),
  });
}

export async function deleteClientTask(organizationId: string, taskId: string) {
  return fetchAuthMutation(api.clientTasks.write.deleteFromHono, {
    organizationId,
    taskId: taskId as never,
  });
}
