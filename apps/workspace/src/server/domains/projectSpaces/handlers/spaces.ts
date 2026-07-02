import type { Context } from "hono";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { spacePayloadSchema } from "../validation/space.schema";
import { createSpace, deleteSpace, updateSpace } from "../services/spaces";

function extractProjectId(c: Context): string | undefined {
  return c.req.param("projectId");
}

export async function handleCreateSpace(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) {
    return c.json({ error: "Organization id is required." }, 400);
  }

  const parsed = await validateJsonBody(c, spacePayloadSchema, "Invalid space payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const result = await createSpace(organizationId, parsed.data);
    return c.json({ space: result });
  } catch (error) {
    return actionErrorJson(c, error, "Space action failed.");
  }
}

export async function handleUpdateSpace(c: Context) {
  const organizationId = c.req.param("organizationId");
  const spaceId = c.req.param("spaceId");
  if (!organizationId || !spaceId) {
    return c.json({ error: "Organization and space ids are required." }, 400);
  }

  const parsed = await validateJsonBody(c, spacePayloadSchema, "Invalid space payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const result = await updateSpace(organizationId, spaceId, parsed.data);
    return c.json({ space: result });
  } catch (error) {
    return actionErrorJson(c, error, "Space action failed.");
  }
}

export async function handleDeleteSpace(c: Context) {
  const organizationId = c.req.param("organizationId");
  const spaceId = c.req.param("spaceId");
  if (!organizationId || !spaceId) {
    return c.json({ error: "Organization and space ids are required." }, 400);
  }

  try {
    const result = await deleteSpace(organizationId, spaceId);
    return c.json(result);
  } catch (error) {
    return actionErrorJson(c, error, "Space action failed.");
  }
}
