import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/better-auth/server";
import { callBetterAuth } from "@/server/domains/organization/services/better-auth-proxy";
import type { Context } from "hono";
import type {
  AuthorizePartnerConnectionPayload,
  CreatePartnerAppPayload,
  CreatePartnerWebhookEndpointPayload,
  ReviewPartnerAppPayload,
  UpdatePartnerConnectionPayload,
} from "../validation/partner-app.schema";

type OAuthClientResponse = {
  client_id: string;
  client_secret?: string;
  scope?: string;
};

function scopeString(scopes: string[]) {
  return Array.from(new Set(scopes)).join(" ");
}

function oauthClientScopes(scopes: string[]) {
  return scopeString(["openid", "profile", "email", "offline_access", ...scopes]);
}

export async function submitPartnerApp(c: Context, input: CreatePartnerAppPayload) {
  const client = await callBetterAuth<OAuthClientResponse>(
    c,
    "/oauth2/create-client",
    {
      body: {
        client_name: input.name,
        client_uri: input.homepageUrl,
        logo_uri: input.logoUrl,
        redirect_uris: input.redirectUris,
        scope: oauthClientScopes(input.scopes),
        token_endpoint_auth_method: "client_secret_basic",
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        type: "web",
      },
      fallback: "OAuth client could not be created.",
    },
  );

  const app = await fetchAuthMutation(api.partnerApps.apps.createFromHono, {
    input: {
      oauthClientId: client.client_id,
      name: input.name,
      description: input.description,
      homepageUrl: input.homepageUrl,
      logoUrl: input.logoUrl,
      redirectUris: input.redirectUris,
      allowedScopes: input.scopes,
    },
  });

  return {
    app,
    oauthClient: {
      clientId: client.client_id,
      clientSecret: client.client_secret,
    },
  };
}

export function listPartnerApps() {
  return fetchAuthQuery(api.partnerApps.apps.listForCurrentUser, {});
}

export async function reviewPartnerApp(
  c: Context,
  appId: string,
  input: ReviewPartnerAppPayload,
) {
  const app = await fetchAuthMutation(api.partnerApps.apps.reviewFromHono, {
    appId: appId as Id<"partnerApps">,
    input,
  });
  const status = input.status === "approved" ? "approved" : input.status;

  await callBetterAuth(
    c,
    "/admin/oauth2/update-client",
    {
      method: "PATCH",
      body: {
        client_id: app.oauthClientId,
        update: {
          scope: oauthClientScopes(app.allowedScopes),
          metadata: {
            partnerAppId: app.id,
            partnerAppStatus: status,
          },
        },
      },
      fallback: "OAuth client review metadata could not be updated.",
    },
  );

  return app;
}

export function authorizePartnerConnection(
  organizationId: string,
  input: AuthorizePartnerConnectionPayload,
) {
  return fetchAuthMutation(api.partnerApps.apps.authorizeConnectionFromHono, {
    organizationId,
    oauthClientId: input.oauthClientId,
    scopes: input.scopes,
  });
}

export function listPartnerConnections(organizationId: string) {
  return fetchAuthQuery(api.partnerApps.apps.listConnections, { organizationId });
}

export function updatePartnerConnection(
  organizationId: string,
  connectionId: string,
  input: UpdatePartnerConnectionPayload,
) {
  return fetchAuthMutation(api.partnerApps.apps.updateConnectionFromHono, {
    organizationId,
    connectionId: connectionId as Id<"organizationPartnerConnections">,
    input,
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
    partnerAppId: input.partnerAppId as Id<"partnerApps">,
    input: {
      url: input.url,
      events: input.events,
      organizationId,
    },
  });
}
