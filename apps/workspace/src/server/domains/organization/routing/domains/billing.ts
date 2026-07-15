import { Hono } from "hono";
import {
  handleCreateCheckout,
  handleCreateCreditCheckout,
  handleCreateCustomerPortal,
  handleGetBillingSubscription,
  handleGetBillingUsage,
  handleGetPaymentStatus,
  handleSubscriptionCancellation,
  handleSchedulePlanChange,
} from "@/server/domains/billing/handlers/billing";

export const billingSubRouter = new Hono();

billingSubRouter.get("/:organizationId/billing/subscription", handleGetBillingSubscription);
billingSubRouter.get("/:organizationId/billing/usage", handleGetBillingUsage);
billingSubRouter.post("/:organizationId/billing/checkout", handleCreateCheckout);
billingSubRouter.post("/:organizationId/billing/credits/checkout", handleCreateCreditCheckout);
billingSubRouter.post("/:organizationId/billing/customer-portal", handleCreateCustomerPortal);
billingSubRouter.post("/:organizationId/billing/cancellation", handleSubscriptionCancellation);
billingSubRouter.post("/:organizationId/billing/scheduled-plan", handleSchedulePlanChange);
billingSubRouter.get("/:organizationId/billing/payments/:orderId", handleGetPaymentStatus);
