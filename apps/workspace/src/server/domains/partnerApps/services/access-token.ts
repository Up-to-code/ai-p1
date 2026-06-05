import type { Context } from "hono";
import { partnerAppsRuntimeConfig } from "@/packages/config";
import type {
  PartnerPermissionAction,
  PartnerPermissionResource,
} from "@qentrah/partner-auth-core";
import { oauthDebug } from "./oauth-debug";

export type PartnerAccessContext = {
  type: "oauth";
  token: string;
  organizationId: string;
  partnersClientId: string;
  partnerAppId: string;
  connectionId: string;
  scopes: string[];
  appName?: string;
};

export function partnerJwksUrl(issuer = partnerAppsRuntimeConfig.issuer) {
  return `${issuer.replace(/\/+$/u, "")}/api/auth/convex/jwks`;
}

export function partnerIssuerCandidates(issuer = partnerAppsRuntimeConfig.issuer) {
  const normalized = issuer.replace(/\/+$/u, "");
  return Array.from(new Set([normalized, `${normalized}/api/auth`]));
}

function bearerToken(c: Context) {
  const url = new URL(c.req.url);
  if (url.searchParams.has("access_token") || url.searchParams.has("token")) {
    throw new Response(JSON.stringify({ error: "Bearer tokens must use the Authorization header." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const authorization = c.req.header("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new Response(JSON.stringify({ error: "Bearer token is required." }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "WWW-Authenticate": `Bearer resource_metadata="${partnerAppsRuntimeConfig.oauthAudience}"`,
      },
    });
  }

  return match[1].trim();
}

export async function authorizePartnerResourceRequest(
  c: Context,
  organizationId: string,
  resource: PartnerPermissionResource,
  action: PartnerPermissionAction,
): Promise<PartnerAccessContext> {
  const token = bearerToken(c);
  oauthDebug("workspace.partner_resource.verify.start", {
    organizationId,
    resource,
    action,
    token,
  });
  void token;

  throw new Response(JSON.stringify({ error: "Partner OAuth bearer access is disabled during the dev-only auth purge." }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export const requirePartnerAccess = authorizePartnerResourceRequest;

export function partnerAccessError(error: unknown) {
  if (error instanceof Response) return error;
  if (error instanceof Error) {
    return Response.json({ error: error.message }, { status: 401 });
  }
  return Response.json({ error: "Partner access denied." }, { status: 401 });
}
