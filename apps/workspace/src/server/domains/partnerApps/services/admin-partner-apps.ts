import { makeFunctionReference } from "convex/server";
import { timingSafeEqual } from "node:crypto";
import { convexCalls } from "@/server/convex/http-client";
import type { OAuthClientRuntimeSyncPayload } from "../validation/admin-partner-app.schema";
import { listPublishedPartnerApps } from "./partners-platform";
import { oauthDebug } from "./oauth-debug";

const refs = {
  upsertOAuthClientFromPartnersService: makeFunctionReference<
    "action",
    { input: OAuthClientSyncInput },
    { clientId: string; created: boolean }
  >("partnerApps/oauthClients:upsertFromPartnersService"),
};

type ServiceTokenEnv = Record<string, string | undefined>;
type OAuthClientSyncInput = {
  workspacePartnerAppId: string;
  clientId: string;
  clientType: "public" | "confidential";
  name: string;
  homepageUrl?: string;
  logoUrl?: string;
  redirectUris: string[];
  allowedScopes: string[];
  status: "approved" | "rejected" | "suspended";
};
export function adminServiceTokenFromEnv(env: ServiceTokenEnv = process.env) {
  return env.WORKSPACE_ADMIN_SERVICE_TOKEN?.trim() || "";
}

function timingSafeTokenEqual(supplied: string, expected: string) {
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(suppliedBuffer, expectedBuffer);
}

export function assertAdminServiceToken(headers: Headers, env: ServiceTokenEnv = process.env) {
  const expected = adminServiceTokenFromEnv(env);
  const authorization = headers.get("authorization");
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  const supplied = bearer || headers.get("x-workspace-admin-service-token")?.trim();
  if (!expected || !supplied || !timingSafeTokenEqual(supplied, expected)) {
    throw new Error("Invalid Workspace admin service token.");
  }
}

export async function syncOAuthClientRuntime(input: OAuthClientRuntimeSyncPayload) {
  oauthDebug("workspace.oauth.runtime_sync.start", {
    partnersAppId: input.partnersAppId,
    partnersClientId: input.partnersClientId,
    status: input.status,
    redirectUriCount: input.redirectUris.length,
    scopeCount: input.allowedScopes.length,
  });
  await upsertOAuthRuntimeProjection(input);
  oauthDebug("workspace.oauth.runtime_sync.success", {
    partnersAppId: input.partnersAppId,
    partnersClientId: input.partnersClientId,
    status: input.status,
  });
  return {
    partnersAppId: input.partnersAppId,
    clientId: input.partnersClientId,
    status: input.status,
  };
}

export async function listApprovedPartnerApps() {
  const apps = await listPublishedPartnerApps();
  return apps.map((app) => ({
    id: app.id,
    partnersAppId: app.id,
    partnersClientId: app.clientId,
    name: app.name,
    publisherName: app.publisherName,
    description: app.description,
    homepageUrl: app.homepageUrl ?? undefined,
    logoUrl: app.logoUrl ?? app.iconUrl ?? undefined,
    redirectUris: app.redirectUris,
    allowedScopes: app.allowedScopes,
    clientType: app.clientType,
    status: "approved" as const,
    createdAt: app.updatedAt,
    updatedAt: app.updatedAt,
  }));
}

export function upsertOAuthRuntimeProjection(input: OAuthClientRuntimeSyncPayload) {
  oauthDebug("workspace.oauth.runtime_projection.upsert", {
    partnersAppId: input.partnersAppId,
    partnersClientId: input.partnersClientId,
    clientType: input.clientType,
    status: input.status,
  });
  return convexCalls.action<{ input: OAuthClientSyncInput }, { clientId: string; created: boolean }>(refs.upsertOAuthClientFromPartnersService, {
    input: {
      workspacePartnerAppId: input.partnersAppId,
      clientId: input.partnersClientId,
      clientType: input.clientType,
      name: input.name,
      homepageUrl: input.homepageUrl,
      logoUrl: input.logoUrl,
      redirectUris: input.redirectUris,
      allowedScopes: input.allowedScopes,
      status: input.status,
    },
  });
}
