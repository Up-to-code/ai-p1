import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/clerk-convex";
import type { ClientPayload } from "../validation/client.schema";

function toConvexInput(input: ClientPayload) {
  return input;
}

export async function createClient(organizationId: string, input: ClientPayload) {
  return fetchAuthMutation(api.clients.write.createFromHono, {
    organizationId,
    input: toConvexInput(input),
  });
}

export async function updateClient(organizationId: string, clientId: string, input: ClientPayload) {
  return fetchAuthMutation(api.clients.write.updateFromHono, {
    organizationId,
    clientId: clientId as never,
    input: toConvexInput(input),
  });
}

export async function deleteClient(organizationId: string, clientId: string) {
  return fetchAuthMutation(api.clients.write.deleteFromHono, {
    organizationId,
    clientId: clientId as never,
  });
}
