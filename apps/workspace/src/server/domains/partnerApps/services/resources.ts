import { api } from "@convex/_generated/api";
import { convexCalls } from "@/server/convex/http-client";
import type {
  PartnerPermissionAction,
  PartnerPermissionResource,
} from "@qentrah/partner-auth-core";
import type { OrganizationApiKeyAccessContext } from "./organization-api-key-access";
import { oauthDebug } from "./oauth-debug";

function convexBridgeSecret() {
  const secret = process.env.WORKSPACE_CONVEX_BRIDGE_SECRET?.trim() ?? "";
  if (secret.length < 32) {
    throw new Error("WORKSPACE_CONVEX_BRIDGE_SECRET must be configured for partner resource access.");
  }
  return secret;
}

export function readOrganizationApiKeyResource(
  organizationId: string,
  resource: PartnerPermissionResource,
  input?: unknown,
) {
  oauthDebug("workspace.organization_api_key_resource.read.start", {
    organizationId,
    resource,
    hasInput: input !== undefined,
  });
  return convexCalls.query<Record<string, unknown>, unknown>(api.organizationApiKeys.readResource, {
    serverToken: convexBridgeSecret(),
    organizationId,
    resource,
    action: "read",
    input,
  });
}

export function writeOrganizationApiKeyResource(
  access: OrganizationApiKeyAccessContext,
  resource: PartnerPermissionResource,
  action: Exclude<PartnerPermissionAction, "read">,
  input?: unknown,
) {
  oauthDebug("workspace.organization_api_key_resource.write.start", {
    organizationId: access.organizationId,
    apiKeyId: access.apiKeyId,
    resource,
    action,
    hasInput: input !== undefined,
  });
  return convexCalls.mutation<Record<string, unknown>, unknown>(api.organizationApiKeys.writeResource, {
    serverToken: convexBridgeSecret(),
    organizationId: access.organizationId,
    apiKeyId: access.apiKeyId,
    resource,
    action,
    input,
  });
}
