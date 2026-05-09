import { Hono } from "hono";
import { organizationRouter } from "@/server/domains/organization/routing/router";
import { profileRouter } from "@/server/domains/profile/routing/router";

export const v1Router = new Hono();

v1Router.route("/organizations", organizationRouter);
v1Router.route("/profile", profileRouter);

export type V1RouterType = typeof v1Router;
