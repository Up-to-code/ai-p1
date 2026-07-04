import type { Context } from "hono";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { theoryPayloadSchema } from "../validation/theory.schema";
import { createTheory, updateTheory, deleteTheory } from "../services/theories";

export async function handleCreateTheory(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);

  const parsed = await validateJsonBody(c, theoryPayloadSchema, "Invalid theory payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const theory = await createTheory(organizationId, parsed.data);
    return c.json({ theory });
  } catch (error) {
    return actionErrorJson(c, error, "Theory action failed.");
  }
}

export async function handleUpdateTheory(c: Context) {
  const organizationId = c.req.param("organizationId");
  const theoryId = c.req.param("theoryId");
  if (!organizationId || !theoryId) {
    return c.json({ error: "Organization and theory ids are required." }, 400);
  }

  const parsed = await validateJsonBody(c, theoryPayloadSchema, "Invalid theory payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const theory = await updateTheory(organizationId, theoryId, parsed.data);
    return c.json({ theory });
  } catch (error) {
    return actionErrorJson(c, error, "Theory action failed.");
  }
}

export async function handleDeleteTheory(c: Context) {
  const organizationId = c.req.param("organizationId");
  const theoryId = c.req.param("theoryId");
  if (!organizationId || !theoryId) {
    return c.json({ error: "Organization and theory ids are required." }, 400);
  }

  try {
    const result = await deleteTheory(organizationId, theoryId);
    return c.json(result);
  } catch (error) {
    return actionErrorJson(c, error, "Theory action failed.");
  }
}
