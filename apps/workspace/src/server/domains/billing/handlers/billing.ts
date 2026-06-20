import type { Context } from "hono";
import { requireOrganizationId } from "@/server/utils/organization/require-organization-id";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { billingCheckoutSchema, dodoWebhookSchema } from "../validation/billing.schema";
import {
  createBillingCheckout,
  getBillingSubscription,
  getBillingPaymentStatus,
  getBillingUsage,
  processDodoWebhook,
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
    return c.json(await createBillingCheckout(org.organizationId, parsed.data));
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

export async function handleDodoWebhook(c: Context) {
  const parsed = await validateJsonBody(c, dodoWebhookSchema, "Invalid DodoPayments webhook payload.");
  if (!parsed.ok) return parsed.response;

  const tokenFromHeader = c.req.header("authorization")?.match(/^Bearer\s+(.+)$/iu)?.[1]?.trim();
  const tokenFromQuery = c.req.query("dodoToken")?.trim();
  const token = tokenFromHeader || tokenFromQuery || "";

  try {
    return c.json(await processDodoWebhook({ token, payload: parsed.data }));
  } catch (error) {
    return actionErrorJson(c, error, "Billing request failed.");
  }
}
