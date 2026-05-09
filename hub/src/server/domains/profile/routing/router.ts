import { Hono } from "hono";
import { handleUpdateCurrentUserAvatar } from "../handlers/update-avatar";

export const profileRouter = new Hono();

profileRouter.patch("/avatar", handleUpdateCurrentUserAvatar);

export type ProfileRouterType = typeof profileRouter;
