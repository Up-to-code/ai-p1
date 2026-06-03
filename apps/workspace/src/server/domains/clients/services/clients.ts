import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/convex-workos/server";
import type { ClientPayload, ClientUnitLinkPayload } from "../validation/client.schema";

function toConvexInput(input: ClientPayload) {
  const { issue, ...required } = input;
  return { ...required, ...(issue ? { issue } : {}) };
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

export async function linkClientUnit(organizationId: string, clientId: string, input: ClientUnitLinkPayload) {
  return fetchAuthMutation(api.clients.write.linkUnitFromHono, {
    organizationId,
    input: {
      clientId: clientId as never,
      propertyId: input.propertyId as never,
      status: input.status,
      ...(input.notes ? { notes: input.notes } : {}),
    },
  });
}

export async function unlinkClientUnit(organizationId: string, clientId: string, propertyId: string) {
  return fetchAuthMutation(api.clients.write.unlinkUnitFromHono, {
    organizationId,
    clientId: clientId as never,
    propertyId: propertyId as never,
  });
}
