import type { Context } from "hono";
import { createCrudHandlers } from "@/server/utils/handler-factory";
import { requireOrganizationId } from "@/server/utils/organization/require-organization-id";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { attachMedia, createMediaFolder, deleteMediaFolder, updateMedia, deleteMedia } from "../services/media";
import { attachMediaPayloadSchema, createMediaFolderPayloadSchema, updateMediaPayloadSchema } from "../validation/media.schema";

export const { handleUpdate: handleUpdateMedia, handleDelete: handleDeleteMedia } = createCrudHandlers({
  resourceName: "mediaAsset",
  createSchema: attachMediaPayloadSchema,
  updateSchema: updateMediaPayloadSchema,
  resourceIdParam: "mediaId",
  service: { create: attachMedia, update: updateMedia, delete: deleteMedia },
});

export async function handleAttachMedia(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const parsed = await validateJsonBody(c, attachMediaPayloadSchema, "Invalid media payload.");
  if (!parsed.ok) return parsed.response;

  try {
    return c.json({ mediaAsset: await attachMedia(org.organizationId, parsed.data) });
  } catch (error) {
    return actionErrorJson(c, error, "Media action failed.");
  }
}

export async function handleCreateMediaFolder(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const parsed = await validateJsonBody(c, createMediaFolderPayloadSchema, "Invalid media folder payload.");
  if (!parsed.ok) return parsed.response;

  try {
    return c.json({ folder: await createMediaFolder(org.organizationId, parsed.data) });
  } catch (error) {
    return actionErrorJson(c, error, "Media action failed.");
  }
}

export async function handleDeleteMediaFolder(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const folderId = c.req.param("folderId");
  if (!folderId) return c.json({ error: "Folder id is required." }, 400);

  try {
    return c.json(await deleteMediaFolder(org.organizationId, folderId));
  } catch (error) {
    return actionErrorJson(c, error, "Media action failed.");
  }
}
