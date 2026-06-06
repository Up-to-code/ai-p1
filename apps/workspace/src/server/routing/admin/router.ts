import { Hono } from "hono";
import {
  handleSyncOAuthClientRuntimeFromPartners,
} from "@/server/domains/partnerApps/handlers/admin-partner-apps";

export const adminRouter = new Hono();

adminRouter.post("/oauth-client-runtime-sync", handleSyncOAuthClientRuntimeFromPartners);
