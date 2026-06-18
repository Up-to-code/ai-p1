import type { Context } from "hono";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { createDeal, deleteDeal, updateDeal } from "../services/deals";
import { dealPayloadSchema } from "../validation/deal.schema";

function handleError(c: Context, error: unknown) {
  return actionErrorJson(c, error, "Deal action failed.");
}

export async function handleCreateDeal(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);
  const parsed = await validateJsonBody(c, dealPayloadSchema, "Invalid deal payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const deal = await createDeal(organizationId, parsed.data);
    return c.json({ deal });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleUpdateDeal(c: Context) {
  const organizationId = c.req.param("organizationId");
  const dealId = c.req.param("dealId");
  if (!organizationId || !dealId) return c.json({ error: "Organization and deal ids are required." }, 400);
  const parsed = await validateJsonBody(c, dealPayloadSchema, "Invalid deal payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const deal = await updateDeal(organizationId, dealId, parsed.data);
    return c.json({ deal });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleDeleteDeal(c: Context) {
  const organizationId = c.req.param("organizationId");
  const dealId = c.req.param("dealId");
  if (!organizationId || !dealId) return c.json({ error: "Organization and deal ids are required." }, 400);

  try {
    const result = await deleteDeal(organizationId, dealId);
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}
