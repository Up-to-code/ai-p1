import { api } from "@convex/_generated/api";
import { convexCalls } from "@/server/convex/http-client";
import type {
  PartnerPermissionAction,
  PartnerPermissionResource,
} from "@qentrah/partner-auth-core";
import type { InboundWebhookPayload } from "../validation/partner-app.schema";
import type { PartnerAccessContext } from "./access-token";
import type { OrganizationApiKeyAccessContext } from "./organization-api-key-access";

function convexBridgeSecret() {
  const secret = process.env.WORKSPACE_CONVEX_BRIDGE_SECRET?.trim() ?? "";
  if (secret.length < 32) {
    throw new Error("WORKSPACE_CONVEX_BRIDGE_SECRET must be configured for partner resource access.");
  }
  return secret;
}

export function readPartnerResource(
  organizationId: string,
  resource: PartnerPermissionResource,
  input?: unknown,
) {
  return convexCalls.query<Record<string, unknown>, unknown>(api.partnerApps.resources.read, {
    serverToken: convexBridgeSecret(),
    organizationId,
    resource,
    action: "read",
    input,
  });
}

export function writePartnerResource(
  access: PartnerAccessContext,
  resource: PartnerPermissionResource,
  action: Exclude<PartnerPermissionAction, "read">,
  input?: unknown,
) {
  return convexCalls.mutation<Record<string, unknown>, unknown>(api.partnerApps.resources.write, {
    serverToken: convexBridgeSecret(),
    organizationId: access.organizationId,
    partnerAppId: access.partnerAppId,
    resource,
    action,
    input,
  });
}

export function readOrganizationApiKeyResource(
  organizationId: string,
  resource: PartnerPermissionResource,
  input?: unknown,
) {
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
  return convexCalls.mutation<Record<string, unknown>, unknown>(api.organizationApiKeys.writeResource, {
    serverToken: convexBridgeSecret(),
    organizationId: access.organizationId,
    apiKeyId: access.apiKeyId,
    resource,
    action,
    input,
  });
}

export function acceptInboundWebhook(
  access: PartnerAccessContext,
  input: InboundWebhookPayload & { idempotencyKey?: string },
) {
  return convexCalls.mutation<Record<string, unknown>, unknown>(api.partnerApps.webhooks.acceptInboundFromHono, {
    serverToken: convexBridgeSecret(),
    organizationId: access.organizationId,
    partnerAppId: access.partnerAppId,
    input,
  });
}
