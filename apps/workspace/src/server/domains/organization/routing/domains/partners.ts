import { Hono } from "hono";
import {
  handleAuthorizePartnerConnection,
  handleCreatePartnerWebhookEndpoint,
  handleListPartnerConnections,
  handleRevokePartnerConnection,
  handleUpdatePartnerConnection,
} from "@/server/domains/partnerApps/handlers/partner-apps";

export const partnersSubRouter = new Hono();

partnersSubRouter.get("/:organizationId/partner-connections", handleListPartnerConnections);
partnersSubRouter.post("/:organizationId/partner-connections", handleAuthorizePartnerConnection);
partnersSubRouter.patch("/:organizationId/partner-connections/:connectionId", handleUpdatePartnerConnection);
partnersSubRouter.delete("/:organizationId/partner-connections/:connectionId", handleRevokePartnerConnection);
partnersSubRouter.post("/:organizationId/partner-webhook-endpoints", handleCreatePartnerWebhookEndpoint);
