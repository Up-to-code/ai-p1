import type { Context } from "hono";
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

function organizationId(c: Context) {
  return c.req.param("organizationId");
}

function handleBillingError(c: Context, error: unknown) {
  return actionErrorJson(c, error, "Billing request failed.");
}

export async function handleGetBillingSubscription(c: Context) {
  const id = organizationId(c);
  if (!id) return c.json({ error: "Organization id is required." }, 400);

  try {
    return c.json(await getBillingSubscription(id));
  } catch (error) {
    return handleBillingError(c, error);
  }
}

export async function handleGetBillingUsage(c: Context) {
  const id = organizationId(c);
  if (!id) return c.json({ error: "Organization id is required." }, 400);

  try {
    return c.json(await getBillingUsage(id));
  } catch (error) {
    return handleBillingError(c, error);
  }
}

export async function handleCreateCheckout(c: Context) {
  const id = organizationId(c);
  if (!id) return c.json({ error: "Organization id is required." }, 400);
  const parsed = await validateJsonBody(c, billingCheckoutSchema, "Invalid billing checkout payload.");
  if (!parsed.ok) return parsed.response;

  try {
    return c.json(await createBillingCheckout(id, parsed.data));
  } catch (error) {
    return handleBillingError(c, error);
  }
}

export async function handleGetPaymentStatus(c: Context) {
  const id = organizationId(c);
  const orderId = c.req.param("orderId");
  if (!id || !orderId) return c.json({ error: "Organization and order ids are required." }, 400);

  try {
    return c.json(await getBillingPaymentStatus(id, orderId));
  } catch (error) {
    return handleBillingError(c, error);
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
    return handleBillingError(c, error);
  }
}
