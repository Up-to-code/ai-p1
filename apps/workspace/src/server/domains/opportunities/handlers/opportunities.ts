import type { Context } from "hono";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { createOpportunity, deleteOpportunity, updateOpportunity } from "../services/opportunities";
import { opportunityPayloadSchema } from "../validation/opportunity.schema";

function handleError(c: Context, error: unknown) {
  return actionErrorJson(c, error, "Opportunity action failed.");
}

export async function handleCreateOpportunity(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);
  const parsed = await validateJsonBody(c, opportunityPayloadSchema, "Invalid opportunity payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const opportunity = await createOpportunity(organizationId, parsed.data);
    return c.json({ opportunity });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleUpdateOpportunity(c: Context) {
  const organizationId = c.req.param("organizationId");
  const opportunityId = c.req.param("opportunityId");
  if (!organizationId || !opportunityId) return c.json({ error: "Organization and opportunity ids are required." }, 400);
  const parsed = await validateJsonBody(c, opportunityPayloadSchema, "Invalid opportunity payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const opportunity = await updateOpportunity(organizationId, opportunityId, parsed.data);
    return c.json({ opportunity });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleDeleteOpportunity(c: Context) {
  const organizationId = c.req.param("organizationId");
  const opportunityId = c.req.param("opportunityId");
  if (!organizationId || !opportunityId) return c.json({ error: "Organization and opportunity ids are required." }, 400);

  try {
    const result = await deleteOpportunity(organizationId, opportunityId);
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}

