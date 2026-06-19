import type { Context } from "hono";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { followUpPayloadSchema } from "../validation/follow-up.schema";
import { createFollowUp, deleteFollowUp, updateFollowUp, markFollowUpComplete } from "../services/follow-ups";

function handleError(c: Context, error: unknown) {
  return actionErrorJson(c, error, "Follow-up action failed.");
}

export async function handleCreateFollowUp(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);
  const parsed = await validateJsonBody(c, followUpPayloadSchema, "Invalid follow-up payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const followUp = await createFollowUp(organizationId, parsed.data);
    return c.json({ followUp });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleUpdateFollowUp(c: Context) {
  const organizationId = c.req.param("organizationId");
  const followUpId = c.req.param("followUpId");
  if (!organizationId || !followUpId) return c.json({ error: "Organization and follow-up ids are required." }, 400);
  const parsed = await validateJsonBody(c, followUpPayloadSchema, "Invalid follow-up payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const followUp = await updateFollowUp(organizationId, followUpId, parsed.data);
    return c.json({ followUp });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleDeleteFollowUp(c: Context) {
  const organizationId = c.req.param("organizationId");
  const followUpId = c.req.param("followUpId");
  if (!organizationId || !followUpId) return c.json({ error: "Organization and follow-up ids are required." }, 400);

  try {
    const result = await deleteFollowUp(organizationId, followUpId);
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleMarkFollowUpComplete(c: Context) {
  const organizationId = c.req.param("organizationId");
  const followUpId = c.req.param("followUpId");
  if (!organizationId || !followUpId) return c.json({ error: "Organization and follow-up ids are required." }, 400);

  try {
    const followUp = await markFollowUpComplete(organizationId, followUpId);
    return c.json({ followUp });
  } catch (error) {
    return handleError(c, error);
  }
}
