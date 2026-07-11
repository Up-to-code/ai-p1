import { Hono } from "hono";
import type { Context, Next } from "hono";
import { partnerAppsRuntimeConfig } from "@/packages/config";
import { oauthDebug } from "../services/oauth-debug";
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
  handlePartnerResourceWrite,
} from "../handlers/resources";

export const partnerAppsRouter = new Hono();
export const partnerResourceRouter = new Hono();

async function requirePartnerAppsEnabled(c: Context, next: Next) {
  if (!partnerAppsRuntimeConfig.enabled) {
    oauthDebug("workspace.partner_apps.disabled", {
      path: new URL(c.req.url).pathname,
    });
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

partnerResourceRouter.get("/organizations/:organizationId/assets", (c) => handlePartnerReadCollection(c, "asset"));
partnerResourceRouter.get("/organizations/:organizationId/assets/:assetId", (c) => handlePartnerReadById(c, "asset", "assetId"));
partnerResourceRouter.get("/organizations/:organizationId/projects", (c) => handlePartnerReadCollection(c, "project"));
partnerResourceRouter.get("/organizations/:organizationId/projects/:projectId", (c) => handlePartnerReadById(c, "project", "projectId"));
partnerResourceRouter.get("/organizations/:organizationId/tasks", (c) => handlePartnerReadCollection(c, "task"));
partnerResourceRouter.get("/organizations/:organizationId/tasks/:taskId", (c) => handlePartnerReadById(c, "task", "taskId"));
partnerResourceRouter.post("/organizations/:organizationId/tasks", (c) => handlePartnerResourceWrite(c, "task", "create"));
partnerResourceRouter.patch("/organizations/:organizationId/tasks/:taskId", (c) => handlePartnerResourceWrite(c, "task", "update", "taskId"));
partnerResourceRouter.get("/organizations/:organizationId/documents", (c) => handlePartnerReadCollection(c, "document"));
partnerResourceRouter.get("/organizations/:organizationId/documents/:docId", (c) => handlePartnerReadById(c, "document", "docId"));
partnerResourceRouter.post("/organizations/:organizationId/documents", (c) => handlePartnerResourceWrite(c, "document", "create"));
partnerResourceRouter.patch("/organizations/:organizationId/documents/:docId", (c) => handlePartnerResourceWrite(c, "document", "update", "docId"));
partnerResourceRouter.get("/organizations/:organizationId/calendar", (c) => handlePartnerReadCollection(c, "calendar"));
partnerResourceRouter.get("/organizations/:organizationId/calendar/:eventId", (c) => handlePartnerReadById(c, "calendar", "eventId"));
partnerResourceRouter.get("/organizations/:organizationId/media", handlePartnerMediaList);
partnerResourceRouter.post("/organizations/:organizationId/webhooks/inbound", handlePartnerInboundWebhook);
