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
  readOrganizationApiKeyResource,
  readPartnerResource,
  writeOrganizationApiKeyResource,
  writePartnerResource,
} from "./resources";

export type PartnerResourceAccessContext = PartnerAccessContext | OrganizationApiKeyAccessContext;

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
): access is OrganizationApiKeyAccessContext {
  return access.type === "apiKey";
}

export function isPartnerOAuthAccess(
  access: PartnerResourceAccessContext,
): access is PartnerAccessContext {
  return access.type === "oauth";
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
  return authorizePartnerResourceRequest(c, organizationId, resource, action);
}

export function partnerResourceAccessError(error: unknown) {
  if (error instanceof Response) return organizationApiKeyAccessError(error);
  return partnerAccessError(error);
}

export function partnerResourceAccessIdentity(access: PartnerResourceAccessContext) {
  return isPartnerApiKeyAccess(access)
    ? { apiKeyId: access.apiKeyId, keyId: access.keyId, appName: access.name }
    : { partnerAppId: access.partnerAppId, connectionId: access.connectionId, appName: access.appName };
}

export function readAuthorizedPartnerResource(
  access: PartnerResourceAccessContext,
  resource: PartnerPermissionResource,
  input?: unknown,
) {
  return isPartnerApiKeyAccess(access)
    ? readOrganizationApiKeyResource(access.organizationId, resource, input)
    : readPartnerResource(access.organizationId, resource, input);
}

export function writeAuthorizedPartnerResource(
  access: PartnerResourceAccessContext,
  resource: PartnerPermissionResource,
  action: Exclude<PartnerPermissionAction, "read">,
  input?: unknown,
) {
  return isPartnerApiKeyAccess(access)
    ? writeOrganizationApiKeyResource(access, resource, action, input)
    : writePartnerResource(access, resource, action, input);
}
