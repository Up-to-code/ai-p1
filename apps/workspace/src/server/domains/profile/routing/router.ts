import { Hono } from "hono";
import { handleUpdateCurrentUserProfile } from "../handlers/update-profile";
import { handleUpdateCurrentUserAvatar } from "../handlers/update-avatar";
import {
  handleGetPushDeviceStatus,
  handleRegisterPushDevice,
  handleRemovePushDevice,
} from "@/server/domains/notifications/handlers/notifications";

export const profileRouter = new Hono();

profileRouter.patch("/", handleUpdateCurrentUserProfile);
profileRouter.patch("/avatar", handleUpdateCurrentUserAvatar);
profileRouter.get("/push-devices", handleGetPushDeviceStatus);
profileRouter.post("/push-devices", handleRegisterPushDevice);
profileRouter.delete("/push-devices/:installationId", handleRemovePushDevice);
