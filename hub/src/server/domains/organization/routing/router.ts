import { Hono } from "hono";
import { handleUpdateOrganizationProfile } from "../handlers/update-profile";

export const organizationRouter = new Hono();

organizationRouter.patch(
  "/:organizationId/profile",
  handleUpdateOrganizationProfile,
);

export type OrganizationRouterType = typeof organizationRouter;
