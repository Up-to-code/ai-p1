import type { Context } from "hono";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { docFolderPayloadSchema, docFolderRenameSchema } from "../validation/doc.schema";
import { createDocFolder, renameDocFolder, deleteDocFolder } from "../services/doc-folders";

export async function handleCreateDocFolder(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);

  const parsed = await validateJsonBody(c, docFolderPayloadSchema, "Invalid folder payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const folder = await createDocFolder(organizationId, parsed.data);
    return c.json({ folder });
  } catch (error) {
    return actionErrorJson(c, error, "Folder action failed.");
  }
}

export async function handleRenameDocFolder(c: Context) {
  const organizationId = c.req.param("organizationId");
  const folderId = c.req.param("folderId");
  if (!organizationId || !folderId) {
    return c.json({ error: "Organization and folder ids are required." }, 400);
  }

  const parsed = await validateJsonBody(c, docFolderRenameSchema, "Invalid folder payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const folder = await renameDocFolder(organizationId, folderId, parsed.data);
    return c.json({ folder });
  } catch (error) {
    return actionErrorJson(c, error, "Folder action failed.");
  }
}

export async function handleDeleteDocFolder(c: Context) {
  const organizationId = c.req.param("organizationId");
  const folderId = c.req.param("folderId");
  if (!organizationId || !folderId) {
    return c.json({ error: "Organization and folder ids are required." }, 400);
  }

  try {
    const result = await deleteDocFolder(organizationId, folderId);
    return c.json(result);
  } catch (error) {
    return actionErrorJson(c, error, "Folder action failed.");
  }
}
