import type { Context } from "hono";
import { requireOrganizationId } from "@/server/utils/organization/require-organization-id";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { listOrganizationMembers } from "@/server/domains/organization/services/actions";
import { billingCancellationSchema, billingCheckoutSchema, billingCreditCheckoutSchema, billingPlanChangeSchema } from "../validation/billing.schema";
import {
  createBillingCheckout,
  createCreditPurchaseCheckout,
  createCustomerPortal,
  getBillingSubscription,
  getBillingPaymentStatus,
  getBillingUsage,
  setSubscriptionCancellation,
  scheduleSubscriptionPlan,
} from "../services/billing";

export async function handleGetBillingSubscription(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  try {
    return c.json(await getBillingSubscription(org.organizationId));
  } catch (error) {
    return actionErrorJson(c, error, "Billing request failed.");
  }
}

export async function handleSchedulePlanChange(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const parsed = await validateJsonBody(c, billingPlanChangeSchema, "Invalid scheduled plan payload.");
  if (!parsed.ok) return parsed.response;
  try {
    return c.json(await scheduleSubscriptionPlan(org.organizationId, parsed.data.planId));
  } catch (error) {
    return actionErrorJson(c, error, "Scheduled plan request failed.");
  }
}

export async function handleSubscriptionCancellation(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const parsed = await validateJsonBody(c, billingCancellationSchema, "Invalid cancellation payload.");
  if (!parsed.ok) return parsed.response;
  try {
    return c.json(await setSubscriptionCancellation(org.organizationId, parsed.data.cancelAtPeriodEnd));
  } catch (error) {
    return actionErrorJson(c, error, "Subscription cancellation request failed.");
  }
}

export async function handleCreateCustomerPortal(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  try {
    return c.json(await createCustomerPortal(org.organizationId));
  } catch (error) {
    return actionErrorJson(c, error, "Customer portal request failed.");
  }
}

export async function handleCreateCreditCheckout(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const parsed = await validateJsonBody(c, billingCreditCheckoutSchema, "Invalid AI credit checkout payload.");
  if (!parsed.ok) return parsed.response;
  try {
    return c.json(await createCreditPurchaseCheckout(org.organizationId, parsed.data));
  } catch (error) {
    return actionErrorJson(c, error, "AI credit checkout failed.");
  }
}

export async function handleGetBillingUsage(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  try {
    return c.json(await getBillingUsage(org.organizationId));
  } catch (error) {
    return actionErrorJson(c, error, "Billing request failed.");
  }
}

export async function handleCreateCheckout(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const parsed = await validateJsonBody(c, billingCheckoutSchema, "Invalid billing checkout payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const members = await listOrganizationMembers(c, org.organizationId);
    return c.json(await createBillingCheckout(org.organizationId, {
      ...parsed.data,
      // Seat quantity is authoritative server state; clients cannot understate it.
      seats: Math.max(1, members.length),
    }));
  } catch (error) {
    return actionErrorJson(c, error, "Billing request failed.");
  }
}

export async function handleGetPaymentStatus(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const orderId = c.req.param("orderId");
  if (!orderId) return c.json({ error: "Order id is required." }, 400);

  try {
    return c.json(await getBillingPaymentStatus(org.organizationId, orderId));
  } catch (error) {
    return actionErrorJson(c, error, "Billing request failed.");
  }
}
