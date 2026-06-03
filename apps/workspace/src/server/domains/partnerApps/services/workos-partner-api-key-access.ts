import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { convexCalls } from "@/server/convex/http-client";
import { getWorkOSClient } from "@/server/auth/workos/client";
import type {
  PartnerPermissionAction,
  PartnerPermissionResource,
} from "@qentrah/partner-auth-core";

export type WorkOSPartnerApiKeyAccessContext = {
  type: "workosPartnerApiKey";
  token: string;
  organizationId: string;
  partnerId: string;
  partnerClientId: string;
  partnersAppId: string;
  partnersClientId: string;
  connectionId: Id<"organizationPartnerConnections">;
  apiKeyId: Id<"workosPartnerApiKeys">;
  workosApiKeyId: string;
  workosOwnerOrganizationId: string;
  name?: string;
  scopes: string[];
};

function bearerToken(c: Context) {
  const authorization = c.req.header("authorization");
  return authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? "";
}

function isWorkOSApiKeyId(id: string | undefined) {
  return Boolean(id?.startsWith("api_key_"));
}

export function isLikelyWorkOSPartnerApiKeyToken(token: string) {
  return token.startsWith("sk_") || token.startsWith("sk_test_") || token.startsWith("sk_live_");
}

export async function requireWorkOSPartnerApiKeyAccess(
  c: Context,
  organizationId: string,
  resource: PartnerPermissionResource,
  action: PartnerPermissionAction,
): Promise<WorkOSPartnerApiKeyAccessContext> {
  const token = bearerToken(c);
  if (!token || !isLikelyWorkOSPartnerApiKeyToken(token)) {
    throw new Response(JSON.stringify({ error: "WorkOS partner API key is required." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validation = await getWorkOSClient().apiKeys.createValidation({ value: token });
  if (!validation.apiKey || !isWorkOSApiKeyId(validation.apiKey.id)) {
    throw new Response(JSON.stringify({ error: "WorkOS API key is invalid." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const grant = await convexCalls.mutation<{
    organizationId: string;
    workosApiKeyId: string;
    workosOwnerOrganizationId: string;
    permissions: string[];
    resource: PartnerPermissionResource;
    action: PartnerPermissionAction;
  }, {
    ok: boolean;
    reason?: string;
    organizationId?: string;
    partnerId?: string;
    partnerClientId?: string;
    partnersAppId?: string;
    partnersClientId?: string;
    connectionId?: Id<"organizationPartnerConnections">;
    apiKeyId?: Id<"workosPartnerApiKeys">;
    permissions?: string[];
    name?: string;
  }>(api.workosPartnerApiKeys.validateGrant, {
    organizationId,
    workosApiKeyId: validation.apiKey.id,
    workosOwnerOrganizationId: validation.apiKey.owner.id,
    permissions: validation.apiKey.permissions,
    resource,
    action,
  });

  if (
    !grant.ok ||
    !grant.partnerId ||
    !grant.partnerClientId ||
    !grant.partnersAppId ||
    !grant.partnersClientId ||
    !grant.connectionId ||
    !grant.apiKeyId
  ) {
    throw new Response(JSON.stringify({ error: grant.reason ?? "WorkOS partner API key grant denied." }), {
      status: grant.reason?.includes("permission") || grant.reason?.includes("mismatch") ? 403 : 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return {
    type: "workosPartnerApiKey",
    token,
    organizationId,
    partnerId: grant.partnerId,
    partnerClientId: grant.partnerClientId,
    partnersAppId: grant.partnersAppId,
    partnersClientId: grant.partnersClientId,
    connectionId: grant.connectionId,
    apiKeyId: grant.apiKeyId,
    workosApiKeyId: validation.apiKey.id,
    workosOwnerOrganizationId: validation.apiKey.owner.id,
    name: grant.name,
    scopes: grant.permissions ?? validation.apiKey.permissions,
  };
}

