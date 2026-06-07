import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/clerk-convex";
import type { ClientTaskPayload } from "../validation/client-task.schema";

function toConvexInput(input: ClientTaskPayload) {
  return input;
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
