import type { Context } from "hono";
import type {
  PartnerPermissionAction,
  PartnerPermissionResource,
} from "@qentrah/partner-auth-core";
import { authorizePartnerResourceRequest, partnerAccessError, type PartnerAccessContext } from "./access-token";
import {
  isOrganizationApiKeyToken,
  organizationApiKeyAccessError,
  requireOrganizationApiKeyAccess,
  type OrganizationApiKeyAccessContext,
} from "./organization-api-key-access";
import {
  isLikelyWorkOSPartnerApiKeyToken,
  requireWorkOSPartnerApiKeyAccess,
  type WorkOSPartnerApiKeyAccessContext,
} from "./workos-partner-api-key-access";
import {
  readOrganizationApiKeyResource,
  readPartnerResource,
  writeOrganizationApiKeyResource,
  writePartnerResource,
} from "./resources";

export type PartnerResourceAccessContext = PartnerAccessContext | OrganizationApiKeyAccessContext | WorkOSPartnerApiKeyAccessContext;

function routeOrganizationId(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) {
    throw new Response(JSON.stringify({ error: "Organization id is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  return organizationId;
}

function authorizationBearerToken(c: Context) {
  const authorization = c.req.header("authorization");
  return authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? "";
}

export function isPartnerApiKeyAccess(
  access: PartnerResourceAccessContext,
): access is OrganizationApiKeyAccessContext | WorkOSPartnerApiKeyAccessContext {
  return access.type === "apiKey" || access.type === "workosPartnerApiKey";
}

export function isOrganizationApiKeyAccess(
  access: PartnerResourceAccessContext,
): access is OrganizationApiKeyAccessContext {
  return access.type === "apiKey";
}

export function isPartnerOAuthAccess(
  access: PartnerResourceAccessContext,
): access is PartnerAccessContext & { type: "oauth" } {
  return access.type === "oauth";
}

export function isPartnerAppAccess(
  access: PartnerResourceAccessContext,
): access is PartnerAccessContext {
  return access.type === "oauth" || access.type === "partnerApp";
}

export function toPartnerAppAccess(
  access: PartnerResourceAccessContext,
): PartnerAccessContext | null {
  if (access.type === "oauth" || access.type === "partnerApp") return access;
  if (access.type !== "workosPartnerApiKey") return null;
  return {
    type: "partnerApp",
    token: access.token,
    organizationId: access.organizationId,
    partnersClientId: access.partnersClientId,
    partnerAppId: access.partnersAppId,
    connectionId: access.connectionId,
    scopes: access.scopes,
    appName: access.name,
  };
}

export async function requirePartnerResourceAccess(
  c: Context,
  resource: PartnerPermissionResource,
  action: PartnerPermissionAction,
): Promise<PartnerResourceAccessContext> {
  const organizationId = routeOrganizationId(c);
  const token = authorizationBearerToken(c);
  if (isOrganizationApiKeyToken(token)) {
    return requireOrganizationApiKeyAccess(c, organizationId, resource, action);
  }
  if (isLikelyWorkOSPartnerApiKeyToken(token)) {
    return requireWorkOSPartnerApiKeyAccess(c, organizationId, resource, action);
  }
  return authorizePartnerResourceRequest(c, organizationId, resource, action);
}

export function partnerResourceAccessError(error: unknown) {
  if (error instanceof Response) return organizationApiKeyAccessError(error);
  return partnerAccessError(error);
}

export function partnerResourceAccessIdentity(access: PartnerResourceAccessContext) {
  return isPartnerApiKeyAccess(access)
    ? {
      apiKeyId: access.apiKeyId,
      keyId: access.type === "apiKey" ? access.keyId : access.workosApiKeyId,
      appName: access.name,
    }
    : { partnerAppId: access.partnerAppId, connectionId: access.connectionId, appName: access.appName };
}

export function readAuthorizedPartnerResource(
  access: PartnerResourceAccessContext,
  resource: PartnerPermissionResource,
  input?: unknown,
) {
  return isPartnerApiKeyAccess(access)
    ? access.type === "apiKey"
      ? readOrganizationApiKeyResource(access.organizationId, resource, input)
      : readPartnerResource(access.organizationId, resource, input)
    : readPartnerResource(access.organizationId, resource, input);
}

export function writeAuthorizedPartnerResource(
  access: PartnerResourceAccessContext,
  resource: PartnerPermissionResource,
  action: Exclude<PartnerPermissionAction, "read">,
  input?: unknown,
) {
  if (access.type === "apiKey") {
    return writeOrganizationApiKeyResource(access, resource, action, input);
  }
  if (access.type === "workosPartnerApiKey") {
    const partnerAccess = toPartnerAppAccess(access);
    if (!partnerAccess) throw new Error("Partner access denied.");
    return writePartnerResource(partnerAccess, resource, action, input);
  }
  return writePartnerResource(access, resource, action, input);
}
