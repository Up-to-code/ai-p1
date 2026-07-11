import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { convexCalls } from "@/server/convex/http-client";
import type {
  PartnerPermissionAction,
  PartnerPermissionResource,
} from "@qentrah/partner-auth-core";

export type OrganizationApiKeyResource = PartnerPermissionResource | "document";

export type OrganizationApiKeyAccessContext = {
  type: "apiKey";
  token: string;
  organizationId: string;
  apiKeyId: Id<"organizationApiKeys">;
  keyId: string;
  name?: string;
  scopes: string[];
};

const API_KEY_PREFIX = "qentrah_org_";

export function isOrganizationApiKeyToken(token: string) {
  return token.startsWith(API_KEY_PREFIX);
}

function bearerToken(c: Context) {
  const authorization = c.req.header("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim();
}

function toApiKeyResource(resource: OrganizationApiKeyResource) {
  return resource;
}

export async function requireOrganizationApiKeyAccess(
  c: Context,
  organizationId: string,
  resource: OrganizationApiKeyResource,
  action: PartnerPermissionAction,
): Promise<OrganizationApiKeyAccessContext> {
  const token = bearerToken(c);
  if (!token || !isOrganizationApiKeyToken(token)) {
    throw new Response(JSON.stringify({ error: "API key is required." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validation = await convexCalls.mutation<{
    organizationId: string;
    secret: string;
    resource: OrganizationApiKeyResource;
    action: PartnerPermissionAction;
  }, {
    ok: boolean;
    reason?: string;
    apiKeyId?: Id<"organizationApiKeys">;
    keyId?: string;
    name?: string;
    permissions?: Array<{ resource: OrganizationApiKeyResource; actions: PartnerPermissionAction[] }>;
  }>(api.organizationApiKeys.validateAndReserve, {
    organizationId,
    secret: token,
    resource: toApiKeyResource(resource),
    action,
  });

  if (!validation.ok || !validation.apiKeyId || !validation.keyId) {
    const status = validation.reason === "permission_denied" || validation.reason === "organization_mismatch"
      ? 403
      : validation.reason === "rate_limited"
        ? 429
        : 401;
    throw new Response(JSON.stringify({ error: validation.reason ?? "API key access denied." }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  return {
    type: "apiKey",
    token,
    organizationId,
    apiKeyId: validation.apiKeyId,
    keyId: validation.keyId,
    name: validation.name,
    scopes: validation.permissions?.flatMap((permission) =>
      permission.actions.map((permissionAction) => `${permission.resource}:${permissionAction}`),
    ) ?? [],
  };
}

export function organizationApiKeyAccessError(error: unknown) {
  if (error instanceof Response) return error;
  if (error instanceof Error) return Response.json({ error: error.message }, { status: 401 });
  return Response.json({ error: "API key access denied." }, { status: 401 });
}
