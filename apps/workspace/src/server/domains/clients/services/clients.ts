import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/clerk-convex";
import type { ClientPayload, ClientAssetLinkPayload } from "../validation/client.schema";

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

export async function linkClientAsset(organizationId: string, clientId: string, input: ClientAssetLinkPayload) {
  return fetchAuthMutation(api.clients.write.linkAssetFromHono, {
    organizationId,
    input: {
      clientId: clientId as never,
      assetId: input.assetId as never,
      status: input.status,
      ...(input.notes ? { notes: input.notes } : {}),
    },
  });
}

export async function unlinkClientAsset(organizationId: string, clientId: string, assetId: string) {
  return fetchAuthMutation(api.clients.write.unlinkAssetFromHono, {
    organizationId,
    clientId: clientId as never,
    assetId: assetId as never,
  });
}
