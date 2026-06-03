import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/convex-workos/server";
import type {
  CreatePartnerWebhookEndpointPayload,
  AuthorizePartnerConnectionPayload,
  CreateWorkOSPartnerApiKeyPayload,
  UpdatePartnerConnectionPayload,
} from "../validation/partner-app.schema";
import { getWorkOSClient } from "@/server/auth/workos/client";
import { listPublishedPartnerApps, verifyPartnerAuthorization } from "./partners-platform";
import { oauthDebug } from "./oauth-debug";

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
  oauthDebug("workspace.partner_apps.catalog.list.start");
  const apps = (await listPublishedPartnerApps()).map(toPartnerCatalogApp);
  oauthDebug("workspace.partner_apps.catalog.list.success", {
    appCount: apps.length,
  });
  return apps;
}

export async function authorizePartnerConnection(
  organizationId: string,
  input: AuthorizePartnerConnectionPayload,
) {
  oauthDebug("workspace.oauth.connection.verify.start", {
    organizationId,
    partnersAppId: input.partnersAppId,
    partnersClientId: input.partnersClientId,
    redirectUri: input.redirectUri,
    scopeCount: input.scopes.length,
  });
  const verification = await verifyPartnerAuthorization({
    partnersAppId: input.partnersAppId,
    partnersClientId: input.partnersClientId,
    redirectUri: input.redirectUri,
    scopes: input.scopes,
  });
  if (!verification.allowed || !verification.app) {
    oauthDebug("workspace.oauth.connection.verify.denied", {
      organizationId,
      partnersAppId: input.partnersAppId,
      partnersClientId: input.partnersClientId,
      reason: verification.reason,
    });
    throw new Error(verification.reason ?? "Partner app authorization was denied.");
  }
  oauthDebug("workspace.oauth.connection.authorize.start", {
    organizationId,
    partnersAppId: verification.app.id,
    partnersClientId: verification.app.clientId,
    scopeCount: input.scopes.length,
  });
  const connection = await fetchAuthMutation(api.partnerApps.apps.authorizeConnectionFromHono, {
    organizationId,
    partnersAppId: verification.app.id,
    partnersClientId: verification.app.clientId,
    scopes: input.scopes,
    verifiedAt: Date.now(),
  });
  oauthDebug("workspace.oauth.connection.authorize.success", {
    organizationId,
    partnersAppId: verification.app.id,
    partnersClientId: verification.app.clientId,
  });
  return connection;
}

export async function listPartnerConnections(organizationId: string) {
  oauthDebug("workspace.partner_apps.connections.list.start", { organizationId });
  const [connections, apps] = await Promise.all([
    fetchAuthQuery(api.partnerApps.apps.listConnections, { organizationId }) as Promise<Array<Record<string, unknown>>>,
    listPublishedPartnerApps().catch(() => []),
  ]);
  const appById = new Map(apps.map((app) => [app.id, toPartnerCatalogApp(app)]));
  const hydratedConnections = connections.map((connection) => ({
    ...connection,
    partnerApp: appById.get(String(connection.partnersAppId)) ?? null,
  }));
  oauthDebug("workspace.partner_apps.connections.list.success", {
    organizationId,
    connectionCount: hydratedConnections.length,
    catalogAppCount: apps.length,
  });
  return hydratedConnections;
}

export async function updatePartnerConnection(
  organizationId: string,
  connectionId: string,
  input: UpdatePartnerConnectionPayload,
) {
  oauthDebug("workspace.partner_apps.connection.update.start", {
    organizationId,
    connectionId,
    status: input.status,
  });
  if (input.status === "active") {
    const current = await fetchAuthQuery(api.partnerApps.apps.listConnections, { organizationId }) as Array<{
      id: string;
      partnersAppId: string;
      partnersClientId: string;
      scopes: string[];
    }>;
    const connection = current.find((item) => item.id === connectionId);
    if (!connection) {
      oauthDebug("workspace.partner_apps.connection.update.not_found", {
        organizationId,
        connectionId,
      });
      throw new Error("Partner connection was not found.");
    }
    oauthDebug("workspace.partner_apps.connection.reverify.start", {
      organizationId,
      connectionId,
      partnersAppId: connection.partnersAppId,
      partnersClientId: connection.partnersClientId,
      scopeCount: connection.scopes.length,
    });
    const verification = await verifyPartnerAuthorization({
      partnersAppId: connection.partnersAppId,
      partnersClientId: connection.partnersClientId,
      scopes: connection.scopes,
    });
    if (!verification.allowed) {
      oauthDebug("workspace.partner_apps.connection.reverify.denied", {
        organizationId,
        connectionId,
        partnersAppId: connection.partnersAppId,
        partnersClientId: connection.partnersClientId,
        reason: verification.reason,
      });
      throw new Error(verification.reason ?? "Partner app authorization was denied.");
    }
  }
  const connection = await fetchAuthMutation(api.partnerApps.apps.updateConnectionFromHono, {
    organizationId,
    connectionId: connectionId as Id<"organizationPartnerConnections">,
    input,
    verifiedAt: input.status === "active" ? Date.now() : undefined,
  });
  oauthDebug("workspace.partner_apps.connection.update.success", {
    organizationId,
    connectionId,
    status: input.status,
  });
  return connection;
}

export async function revokePartnerConnection(organizationId: string, connectionId: string) {
  oauthDebug("workspace.partner_apps.connection.revoke.start", {
    organizationId,
    connectionId,
  });
  const result = await fetchAuthMutation(api.partnerApps.apps.revokeConnectionFromHono, {
    organizationId,
    connectionId: connectionId as Id<"organizationPartnerConnections">,
  });
  oauthDebug("workspace.partner_apps.connection.revoke.success", {
    organizationId,
    connectionId,
  });
  return result;
}

export async function createPartnerWebhookEndpoint(
  organizationId: string,
  input: CreatePartnerWebhookEndpointPayload,
) {
  oauthDebug("workspace.partner_apps.webhook_endpoint.create.start", {
    organizationId,
    partnerAppId: input.partnerAppId,
    eventCount: input.events.length,
  });
  const endpoint = await fetchAuthMutation(api.partnerApps.webhooks.createEndpointFromHono, {
    organizationId,
    partnerAppId: input.partnerAppId,
    input: {
      url: input.url,
      events: input.events,
      organizationId,
    },
  });
  oauthDebug("workspace.partner_apps.webhook_endpoint.create.success", {
    organizationId,
    partnerAppId: input.partnerAppId,
  });
  return endpoint;
}

function keyLast4(value: string) {
  return value.slice(-4) || "----";
}

export async function createWorkOSPartnerApiKey(
  organizationId: string,
  input: CreateWorkOSPartnerApiKeyPayload,
) {
  oauthDebug("workspace.workos_partner_api_key.create.start", {
    organizationId,
    connectionId: input.connectionId,
    partnerId: input.partnerId,
    partnerClientId: input.partnerClientId,
    permissionCount: input.permissions.length,
  });

  const connections = await fetchAuthQuery(api.partnerApps.apps.listConnections, { organizationId }) as Array<{
    id: string;
    partnersAppId: string;
    partnersClientId: string;
    scopes: string[];
    status: string;
    effectiveStatus?: string;
  }>;
  const connection = connections.find((item) => item.id === input.connectionId);
  if (!connection || connection.effectiveStatus !== "active") {
    throw new Error("Active partner connection is required before issuing a WorkOS API key.");
  }
  if (input.partnerClientId !== connection.partnersClientId) {
    throw new Error("Partner client id does not match the authorized connection.");
  }

  for (const permission of input.permissions) {
    if (!connection.scopes.includes(permission)) {
      throw new Error(`Partner connection has not approved ${permission}.`);
    }
  }

  const organization = await fetchAuthQuery(api.workosAuth.resolveOrganizationForPartnerKey, {
    organizationId,
  }).catch(() => null) as { workosOrganizationId?: string } | null;
  if (!organization?.workosOrganizationId) {
    throw new Error("Workspace is not linked to a WorkOS organization.");
  }

  const apiKey = await getWorkOSClient().apiKeys.createOrganizationApiKey({
    organizationId: organization.workosOrganizationId,
    name: input.name,
    permissions: input.permissions,
  });

  const recorded = await fetchAuthMutation(api.workosPartnerApiKeys.recordIssued, {
    organizationId,
    connectionId: input.connectionId as Id<"organizationPartnerConnections">,
    partnerId: input.partnerId,
    partnerClientId: connection.partnersClientId,
    workosApiKeyId: apiKey.id,
    workosOwnerOrganizationId: apiKey.owner.id,
    keyLast4: keyLast4(apiKey.value),
    name: input.name,
    permissions: input.permissions,
    expiresAt: input.expiresAt,
  });

  oauthDebug("workspace.workos_partner_api_key.create.success", {
    organizationId,
    connectionId: input.connectionId,
    partnerId: input.partnerId,
    workosApiKeyId: apiKey.id,
  });

  return {
    id: recorded.id,
    workosApiKeyId: apiKey.id,
    key: apiKey.value,
    keyLast4: keyLast4(apiKey.value),
    permissions: apiKey.permissions,
  };
}
