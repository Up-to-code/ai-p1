import type { Context } from "hono";
import { createCrudHandlers } from "@/server/utils/handler-factory";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { attachMedia, createMediaFolder, deleteMediaFolder, updateMedia, deleteMedia } from "../services/media";
import { attachMediaPayloadSchema, createMediaFolderPayloadSchema } from "../validation/media.schema";

export const { handleUpdate: handleUpdateMedia, handleDelete: handleDeleteMedia } = createCrudHandlers({
  resourceName: "mediaAsset",
  createSchema: attachMediaPayloadSchema,
  updateSchema: attachMediaPayloadSchema,
  resourceIdParam: "mediaId",
  service: { create: attachMedia, update: updateMedia, delete: deleteMedia },
});

export async function handleAttachMedia(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);
  const parsed = await validateJsonBody(c, attachMediaPayloadSchema, "Invalid media payload.");
  if (!parsed.ok) return parsed.response;

  try {
    return c.json({ mediaAsset: await attachMedia(organizationId, parsed.data) });
  } catch (error) {
    return actionErrorJson(c, error, "Media action failed.");
  }
}

export async function handleCreateMediaFolder(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);
  const parsed = await validateJsonBody(c, createMediaFolderPayloadSchema, "Invalid media folder payload.");
  if (!parsed.ok) return parsed.response;

  try {
    return c.json({ folder: await createMediaFolder(organizationId, parsed.data) });
  } catch (error) {
    return actionErrorJson(c, error, "Media action failed.");
  }
}

export async function handleDeleteMediaFolder(c: Context) {
  const organizationId = c.req.param("organizationId");
  const folderId = c.req.param("folderId");
  if (!organizationId || !folderId) return c.json({ error: "Organization and folder ids are required." }, 400);

  try {
    return c.json(await deleteMediaFolder(organizationId, folderId));
  } catch (error) {
    return actionErrorJson(c, error, "Media action failed.");
  }
}
