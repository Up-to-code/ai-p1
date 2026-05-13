import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { convexHttp } from "@/server/convex/http-client";
import type {
  PartnerPermissionAction,
  PartnerPermissionResource,
} from "@/packages/partner-apps/scopes";
import type { InboundWebhookPayload } from "../validation/partner-app.schema";
import type { PartnerAccessContext } from "./access-token";
import type { OrganizationApiKeyAccessContext } from "./organization-api-key-access";

export function readPartnerResource(
  organizationId: string,
  resource: PartnerPermissionResource,
  input?: unknown,
) {
  return convexHttp.query(api.partnerApps.resources.read, {
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
  return convexHttp.mutation(api.partnerApps.resources.write, {
    organizationId: access.organizationId,
    partnerAppId: access.partnerAppId as Id<"partnerApps">,
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
  return convexHttp.query(api.organizationApiKeys.readResource, {
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
  return convexHttp.mutation(api.organizationApiKeys.writeResource, {
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
  return convexHttp.mutation(api.partnerApps.webhooks.acceptInboundFromHono, {
    organizationId: access.organizationId,
    partnerAppId: access.partnerAppId as Id<"partnerApps">,
    input,
  });
}
