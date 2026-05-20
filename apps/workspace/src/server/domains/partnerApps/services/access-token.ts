import type { Context } from "hono";
import { verifyAccessToken } from "better-auth/oauth2";
import { api } from "@convex/_generated/api";
import { convexCalls } from "@/server/convex/http-client";
import { partnerAppsRuntimeConfig } from "@/packages/config";
import type {
  PartnerPermissionAction,
  PartnerPermissionResource,
} from "@qentrah/partner-auth-core";
import { parsePartnerAccessClaims } from "@qentrah/partner-auth-core";
import { oauthDebug } from "./oauth-debug";

export type PartnerAccessContext = {
  type?: "oauth";
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
  const jwt = await verifyAccessToken(token, {
    jwksUrl: partnerJwksUrl(),
    verifyOptions: {
      issuer: partnerIssuerCandidates(),
      audience: partnerAppsRuntimeConfig.oauthAudience,
    },
    scopes: [`${resource}:${action}`],
  });

  let claims;
  try {
    claims = parsePartnerAccessClaims(jwt as Record<string, unknown>);
  } catch (error) {
    throw new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Invalid partner token claims." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (claims.organizationId !== organizationId) {
    oauthDebug("workspace.partner_resource.verify.organization_mismatch", {
      routeOrganizationId: organizationId,
      tokenOrganizationId: claims.organizationId,
      partnersClientId: claims.partnersClientId,
    });
    throw new Response(JSON.stringify({ error: "Token organization does not match this route." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validation = await convexCalls.query<{
    organizationId: string;
    partnersClientId: string;
    scopes: string[];
    resource: PartnerPermissionResource;
    action: PartnerPermissionAction;
  }, {
    ok: boolean;
    reason?: string;
    partnerAppId?: string;
    connectionId?: string;
    scopes?: string[];
    appName?: string;
  }>(api.partnerApps.apps.validateAccess, {
    organizationId,
    partnersClientId: claims.partnersClientId,
    scopes: claims.partnerScopes,
    resource,
    action,
  });

  if (!validation.ok || !validation.partnerAppId || !validation.connectionId) {
    oauthDebug("workspace.partner_resource.validate.denied", {
      organizationId,
      partnersClientId: claims.partnersClientId,
      resource,
      action,
      reason: validation.reason,
    });
    throw new Response(JSON.stringify({ error: validation.reason ?? "Partner access denied." }), {
      status: validation.reason === "scope_denied" ? 403 : 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  oauthDebug("workspace.partner_resource.validate.success", {
    organizationId,
    partnersClientId: claims.partnersClientId,
    partnerAppId: validation.partnerAppId,
    connectionId: validation.connectionId,
    resource,
    action,
    scopeCount: (validation.scopes ?? claims.partnerScopes).length,
  });

  return {
    type: "oauth",
    token,
    organizationId,
    partnersClientId: claims.partnersClientId,
    partnerAppId: validation.partnerAppId,
    connectionId: validation.connectionId,
    scopes: validation.scopes ?? claims.partnerScopes,
    appName: validation.appName,
  };
}

export const requirePartnerAccess = authorizePartnerResourceRequest;

export function partnerAccessError(error: unknown) {
  if (error instanceof Response) return error;
  if (error instanceof Error) {
    return Response.json({ error: error.message }, { status: 401 });
  }
  return Response.json({ error: "Partner access denied." }, { status: 401 });
}
