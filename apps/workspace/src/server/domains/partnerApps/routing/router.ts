import { Hono } from "hono";
import type { Context, Next } from "hono";
import { partnerAppsRuntimeConfig } from "@/packages/config";
import {
  handleListPartnerApps,
} from "../handlers/partner-apps";
import {
  handlePartnerClientWrite,
  handlePartnerInboundWebhook,
  handlePartnerMe,
  handlePartnerMediaList,
  handlePartnerReadById,
  handlePartnerReadCollection,
} from "../handlers/resources";

export const partnerAppsRouter = new Hono();
export const partnerResourceRouter = new Hono();

async function requirePartnerAppsEnabled(c: Context, next: Next) {
  if (!partnerAppsRuntimeConfig.enabled) {
    return c.json({ error: "Partner apps are disabled." }, 404);
  }

  return next();
}

partnerAppsRouter.use("*", requirePartnerAppsEnabled);
partnerResourceRouter.use("*", requirePartnerAppsEnabled);

partnerAppsRouter.get("/", handleListPartnerApps);

partnerResourceRouter.get("/organizations/:organizationId/me", handlePartnerMe);
partnerResourceRouter.get("/organizations/:organizationId/clients", (c) => handlePartnerReadCollection(c, "client"));
partnerResourceRouter.post("/organizations/:organizationId/clients", (c) => handlePartnerClientWrite(c, "create"));
partnerResourceRouter.get("/organizations/:organizationId/clients/:clientId", (c) => handlePartnerReadById(c, "client", "clientId"));
partnerResourceRouter.patch("/organizations/:organizationId/clients/:clientId", (c) => handlePartnerClientWrite(c, "update"));
partnerResourceRouter.delete("/organizations/:organizationId/clients/:clientId", (c) => handlePartnerClientWrite(c, "delete"));

partnerResourceRouter.get("/organizations/:organizationId/properties", (c) => handlePartnerReadCollection(c, "property"));
partnerResourceRouter.get("/organizations/:organizationId/properties/:propertyId", (c) => handlePartnerReadById(c, "property", "propertyId"));
partnerResourceRouter.get("/organizations/:organizationId/projects", (c) => handlePartnerReadCollection(c, "project"));
partnerResourceRouter.get("/organizations/:organizationId/projects/:projectId", (c) => handlePartnerReadById(c, "project", "projectId"));
partnerResourceRouter.get("/organizations/:organizationId/tasks", (c) => handlePartnerReadCollection(c, "task"));
partnerResourceRouter.get("/organizations/:organizationId/tasks/:taskId", (c) => handlePartnerReadById(c, "task", "taskId"));
partnerResourceRouter.get("/organizations/:organizationId/calendar", (c) => handlePartnerReadCollection(c, "calendar"));
partnerResourceRouter.get("/organizations/:organizationId/calendar/:eventId", (c) => handlePartnerReadById(c, "calendar", "eventId"));
partnerResourceRouter.get("/organizations/:organizationId/media", handlePartnerMediaList);
partnerResourceRouter.post("/organizations/:organizationId/webhooks/inbound", handlePartnerInboundWebhook);

export type PartnerAppsRouterType = typeof partnerAppsRouter;
export type PartnerResourceRouterType = typeof partnerResourceRouter;
