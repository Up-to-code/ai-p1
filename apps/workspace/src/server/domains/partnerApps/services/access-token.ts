import type { Context } from "hono";
import { verifyAccessToken } from "better-auth/oauth2";
import { api } from "@convex/_generated/api";
import { convexHttp } from "@/server/convex/http-client";
import { partnerAppsRuntimeConfig } from "@/packages/config";
import type {
  PartnerPermissionAction,
  PartnerPermissionResource,
} from "@/packages/partner-apps/scopes";

export type PartnerAccessContext = {
  type?: "oauth";
  token: string;
  organizationId: string;
  oauthClientId: string;
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

function stringClaim(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function requirePartnerAccess(
  c: Context,
  organizationId: string,
  resource: PartnerPermissionResource,
  action: PartnerPermissionAction,
): Promise<PartnerAccessContext> {
  const token = bearerToken(c);
  const jwt = await verifyAccessToken(token, {
    jwksUrl: partnerJwksUrl(),
    verifyOptions: {
      issuer: partnerIssuerCandidates(),
      audience: partnerAppsRuntimeConfig.oauthAudience,
    },
    scopes: [`${resource}:${action}`],
  });

  const tokenOrganizationId = stringClaim(jwt.organization_id);
  if (!tokenOrganizationId || tokenOrganizationId !== organizationId) {
    throw new Response(JSON.stringify({ error: "Token organization does not match this route." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const oauthClientId = stringClaim(jwt.azp) ?? stringClaim(jwt.client_id);
  if (!oauthClientId) {
    throw new Response(JSON.stringify({ error: "Token client is missing." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const scopes = stringClaim(jwt.scope)?.split(/\s+/).filter(Boolean) ?? [];
  const validation = await convexHttp.query(api.partnerApps.apps.validateAccess, {
    organizationId,
    oauthClientId,
    scopes,
    resource,
    action,
  });

  if (!validation.ok || !validation.partnerAppId || !validation.connectionId) {
    throw new Response(JSON.stringify({ error: validation.reason ?? "Partner access denied." }), {
      status: validation.reason === "scope_denied" ? 403 : 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return {
    type: "oauth",
    token,
    organizationId,
    oauthClientId,
    partnerAppId: validation.partnerAppId,
    connectionId: validation.connectionId,
    scopes: validation.scopes ?? scopes,
    appName: validation.appName,
  };
}

export function partnerAccessError(error: unknown) {
  if (error instanceof Response) return error;
  if (error instanceof Error) {
    return Response.json({ error: error.message }, { status: 401 });
  }
  return Response.json({ error: "Partner access denied." }, { status: 401 });
}
