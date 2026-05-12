import { Hono } from "hono";
import {
  handleListAdminPartnerApps,
  handleRegisterPartnerAppFromPartners,
  handleReviewAdminPartnerApp,
} from "@/server/domains/partnerApps/handlers/admin-partner-apps";

export const adminRouter = new Hono();

adminRouter.post("/partner-app-registrations", handleRegisterPartnerAppFromPartners);
adminRouter.get("/partner-apps", handleListAdminPartnerApps);
adminRouter.patch("/partner-apps/:appId/review", handleReviewAdminPartnerApp);

export type AdminRouterType = typeof adminRouter;
