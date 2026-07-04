import { Hono } from "hono";
import { organizationRequestSafetyMiddleware } from "@/server/security";
import { organizationSubRouter } from "./domains/organization";
import { crudSubRouter } from "./domains/crud";
import { notificationsSubRouter } from "./domains/notifications";
import { mediaSubRouter } from "./domains/media";
import { mcpSubRouter } from "./domains/mcp";
import { partnersSubRouter } from "./domains/partners";
import { billingSubRouter } from "./domains/billing";
import { customFieldsSubRouter } from "@/server/domains/custom-fields/routing/router";

export const organizationRouter = new Hono();

organizationRouter.use("/:organizationId/*", organizationRequestSafetyMiddleware);

organizationRouter.route("/", organizationSubRouter);
organizationRouter.route("/", crudSubRouter);
organizationRouter.route("/", notificationsSubRouter);
organizationRouter.route("/", mediaSubRouter);
organizationRouter.route("/", mcpSubRouter);
organizationRouter.route("/", partnersSubRouter);
organizationRouter.route("/", billingSubRouter);
organizationRouter.route("/", customFieldsSubRouter);
