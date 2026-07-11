import type { Context } from "hono";
import type {
  PartnerPermissionAction,
  PartnerPermissionResource,
} from "@qentrah/partner-auth-core";
import {
  isOrganizationApiKeyToken,
  organizationApiKeyAccessError,
  requireOrganizationApiKeyAccess,
  type OrganizationApiKeyAccessContext,
  type OrganizationApiKeyResource,
} from "./organization-api-key-access";
import {
  readOrganizationApiKeyResource,
  writeOrganizationApiKeyResource,
} from "./resources";

export type PartnerResourceAccessContext = OrganizationApiKeyAccessContext;
export type PartnerApiResource = OrganizationApiKeyResource;

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

function assertNoQueryBearerToken(c: Context) {
  const url = new URL(c.req.url);
  if (url.searchParams.has("access_token") || url.searchParams.has("token")) {
    throw new Response(JSON.stringify({ error: "Bearer tokens must use the Authorization header." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function rejectUnsupportedPartnerBearer(): never {
  throw new Response(JSON.stringify({ error: "Legacy partner OAuth bearer tokens are no longer supported." }), {
    status: 410,
    headers: { "Content-Type": "application/json" },
  });
}

export async function requirePartnerResourceAccess(
  c: Context,
  resource: PartnerApiResource,
  action: PartnerPermissionAction,
): Promise<PartnerResourceAccessContext> {
  assertNoQueryBearerToken(c);
  const organizationId = routeOrganizationId(c);
  const token = authorizationBearerToken(c);
  if (isOrganizationApiKeyToken(token)) {
    return requireOrganizationApiKeyAccess(c, organizationId, resource, action);
  }
  return rejectUnsupportedPartnerBearer();
}

export function partnerResourceAccessError(error: unknown) {
  return organizationApiKeyAccessError(error);
}

export function partnerResourceAccessIdentity(access: PartnerResourceAccessContext) {
  return { apiKeyId: access.apiKeyId, keyId: access.keyId, appName: access.name };
}

export function readAuthorizedPartnerResource(
  access: PartnerResourceAccessContext,
  resource: PartnerApiResource,
  input?: unknown,
) {
  return readOrganizationApiKeyResource(access.organizationId, resource, input);
}

export function writeAuthorizedPartnerResource(
  access: PartnerResourceAccessContext,
  resource: PartnerApiResource,
  action: Exclude<PartnerPermissionAction, "read">,
  input?: unknown,
) {
  return writeOrganizationApiKeyResource(access, resource, action, input);
}
