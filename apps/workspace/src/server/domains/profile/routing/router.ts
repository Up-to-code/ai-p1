import { Hono } from "hono";
import { handleUpdateCurrentUserProfile } from "../handlers/update-profile";
import { handleUpdateCurrentUserAvatar } from "../handlers/update-avatar";

export const profileRouter = new Hono();

profileRouter.patch("/", handleUpdateCurrentUserProfile);
profileRouter.patch("/avatar", handleUpdateCurrentUserAvatar);
