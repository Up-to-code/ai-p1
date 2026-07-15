import { Hono } from "hono";
import { handleActivatePortalSession, handlePortalApproval, handlePortalEngagement, handlePortalRequest } from "../handlers/portal";

export const portalRouter = new Hono();
portalRouter.post("/session/activate", handleActivatePortalSession);
portalRouter.get("/engagements/:engagementId", handlePortalEngagement);
portalRouter.post("/engagements/:engagementId/requests", handlePortalRequest);
portalRouter.post("/engagements/:engagementId/approvals/:approvalId", handlePortalApproval);
