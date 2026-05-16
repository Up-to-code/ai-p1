import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/better-auth/server";
import type {
  CreatePartnerWebhookEndpointPayload,
  AuthorizePartnerConnectionPayload,
  UpdatePartnerConnectionPayload,
} from "../validation/partner-app.schema";
import { listPublishedPartnerApps, verifyPartnerAuthorization } from "./partners-platform";

function toPartnerCatalogApp(app: Awaited<ReturnType<typeof listPublishedPartnerApps>>[number]) {
  return {
    id: app.id,
    partnersClientId: app.clientId,
    name: app.name,
    publisherName: app.publisherName,
    description: app.description,
    homepageUrl: app.homepageUrl ?? undefined,
    logoUrl: app.logoUrl ?? app.iconUrl ?? undefined,
    allowedScopes: app.allowedScopes,
    redirectUris: app.redirectUris,
    status: "approved" as const,
    updatedAt: app.updatedAt,
  };
}

export async function listPartnerApps() {
  return (await listPublishedPartnerApps()).map(toPartnerCatalogApp);
}

export async function authorizePartnerConnection(
  organizationId: string,
  input: AuthorizePartnerConnectionPayload,
) {
  const verification = await verifyPartnerAuthorization({
    partnersAppId: input.partnersAppId,
    partnersClientId: input.partnersClientId,
    redirectUri: input.redirectUri,
    scopes: input.scopes,
  });
  if (!verification.allowed || !verification.app) {
    throw new Error(verification.reason ?? "Partner app authorization was denied.");
  }
  return fetchAuthMutation(api.partnerApps.apps.authorizeConnectionFromHono, {
    organizationId,
    partnersAppId: verification.app.id,
    partnersClientId: verification.app.clientId,
    scopes: input.scopes,
    verifiedAt: Date.now(),
  });
}

export async function listPartnerConnections(organizationId: string) {
  const [connections, apps] = await Promise.all([
    fetchAuthQuery(api.partnerApps.apps.listConnections, { organizationId }) as Promise<Array<Record<string, unknown>>>,
    listPublishedPartnerApps().catch(() => []),
  ]);
  const appById = new Map(apps.map((app) => [app.id, toPartnerCatalogApp(app)]));
  return connections.map((connection) => ({
    ...connection,
    partnerApp: appById.get(String(connection.partnersAppId)) ?? null,
  }));
}

export async function updatePartnerConnection(
  organizationId: string,
  connectionId: string,
  input: UpdatePartnerConnectionPayload,
) {
  if (input.status === "active") {
    const current = await fetchAuthQuery(api.partnerApps.apps.listConnections, { organizationId }) as Array<{
      id: string;
      partnersAppId: string;
      partnersClientId: string;
      scopes: string[];
    }>;
    const connection = current.find((item) => item.id === connectionId);
    if (!connection) throw new Error("Partner connection was not found.");
    const verification = await verifyPartnerAuthorization({
      partnersAppId: connection.partnersAppId,
      partnersClientId: connection.partnersClientId,
      scopes: connection.scopes,
    });
    if (!verification.allowed) throw new Error(verification.reason ?? "Partner app authorization was denied.");
  }
  return fetchAuthMutation(api.partnerApps.apps.updateConnectionFromHono, {
    organizationId,
    connectionId: connectionId as Id<"organizationPartnerConnections">,
    input,
    verifiedAt: input.status === "active" ? Date.now() : undefined,
  });
}

export function revokePartnerConnection(organizationId: string, connectionId: string) {
  return fetchAuthMutation(api.partnerApps.apps.revokeConnectionFromHono, {
    organizationId,
    connectionId: connectionId as Id<"organizationPartnerConnections">,
  });
}

export function createPartnerWebhookEndpoint(
  organizationId: string,
  input: CreatePartnerWebhookEndpointPayload,
) {
  return fetchAuthMutation(api.partnerApps.webhooks.createEndpointFromHono, {
    organizationId,
    partnerAppId: input.partnerAppId,
    input: {
      url: input.url,
      events: input.events,
      organizationId,
    },
  });
}
