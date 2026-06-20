import { Hono } from "hono";
import {
  handleCreateCheckout,
  handleGetBillingSubscription,
  handleGetBillingUsage,
  handleGetPaymentStatus,
} from "@/server/domains/billing/handlers/billing";

export const billingSubRouter = new Hono();

billingSubRouter.get("/:organizationId/billing/subscription", handleGetBillingSubscription);
billingSubRouter.get("/:organizationId/billing/usage", handleGetBillingUsage);
billingSubRouter.post("/:organizationId/billing/checkout", handleCreateCheckout);
billingSubRouter.get("/:organizationId/billing/payments/:orderId", handleGetPaymentStatus);
