import { Hono } from "hono";
import { handleListApprovedPartnerAppsCatalog } from "@/server/domains/partnerApps/handlers/admin-partner-apps";
import { adminRouter } from "@/server/routing/admin/router";
import { organizationRouter } from "@/server/domains/organization/routing/router";
import { partnerAppsRouter, partnerResourceRouter } from "@/server/domains/partnerApps/routing/router";
import { profileRouter } from "@/server/domains/profile/routing/router";
import { billingRouter } from "@/server/domains/billing/routing";
import { portalRouter } from "@/server/domains/portal/routing/router";

export const v1Router = new Hono();

v1Router.route("/admin", adminRouter);
v1Router.get("/integrations/partner-apps", handleListApprovedPartnerAppsCatalog);
v1Router.route("/organizations", organizationRouter);
v1Router.route("/partner-apps", partnerAppsRouter);
v1Router.route("/partner", partnerResourceRouter);
v1Router.route("/profile", profileRouter);
v1Router.route("/billing", billingRouter);
v1Router.route("/portal", portalRouter);
