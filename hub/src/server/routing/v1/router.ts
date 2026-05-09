import { Hono } from "hono";
import { organizationRouter } from "@/server/domains/organization/routing/router";

export const v1Router = new Hono();

v1Router.route("/organizations", organizationRouter);

export type V1RouterType = typeof v1Router;
