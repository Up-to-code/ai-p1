import type { Context } from "hono";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { docPayloadSchema, docMoveSchema } from "../validation/doc.schema";
import { createDoc, updateDoc, deleteDoc, moveDoc } from "../services/docs";

export async function handleCreateDoc(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);

  const parsed = await validateJsonBody(c, docPayloadSchema, "Invalid doc payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const doc = await createDoc(organizationId, parsed.data);
    return c.json({ doc });
  } catch (error) {
    return actionErrorJson(c, error, "Doc action failed.");
  }
}

export async function handleUpdateDoc(c: Context) {
  const organizationId = c.req.param("organizationId");
  const docId = c.req.param("docId");
  if (!organizationId || !docId) {
    return c.json({ error: "Organization and doc ids are required." }, 400);
  }

  const parsed = await validateJsonBody(c, docPayloadSchema, "Invalid doc payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const doc = await updateDoc(organizationId, docId, parsed.data);
    return c.json({ doc });
  } catch (error) {
    return actionErrorJson(c, error, "Doc action failed.");
  }
}

export async function handleDeleteDoc(c: Context) {
  const organizationId = c.req.param("organizationId");
  const docId = c.req.param("docId");
  if (!organizationId || !docId) {
    return c.json({ error: "Organization and doc ids are required." }, 400);
  }

  try {
    const result = await deleteDoc(organizationId, docId);
    return c.json(result);
  } catch (error) {
    return actionErrorJson(c, error, "Doc action failed.");
  }
}

export async function handleMoveDoc(c: Context) {
  const organizationId = c.req.param("organizationId");
  const docId = c.req.param("docId");
  if (!organizationId || !docId) {
    return c.json({ error: "Organization and doc ids are required." }, 400);
  }

  const parsed = await validateJsonBody(c, docMoveSchema, "Invalid move payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const doc = await moveDoc(organizationId, docId, parsed.data);
    return c.json({ doc });
  } catch (error) {
    return actionErrorJson(c, error, "Failed to move doc.");
  }
}
