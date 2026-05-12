import type { Context } from "hono";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { attachMedia, createMediaFolder, deleteMedia, deleteMediaFolder, updateMedia } from "../services/media";
import { attachMediaPayloadSchema, createMediaFolderPayloadSchema, updateMediaPayloadSchema } from "../validation/media.schema";

function handleError(c: Context, error: unknown) {
  return actionErrorJson(c, error, "Media action failed.");
}

export async function handleAttachMedia(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);
  const parsed = await validateJsonBody(c, attachMediaPayloadSchema, "Invalid media payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const mediaAsset = await attachMedia(organizationId, parsed.data);
    return c.json({ mediaAsset });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleUpdateMedia(c: Context) {
  const organizationId = c.req.param("organizationId");
  const mediaId = c.req.param("mediaId");
  if (!organizationId || !mediaId) return c.json({ error: "Organization and media ids are required." }, 400);
  const parsed = await validateJsonBody(c, updateMediaPayloadSchema, "Invalid media payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const mediaAsset = await updateMedia(organizationId, mediaId, parsed.data);
    return c.json({ mediaAsset });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleDeleteMedia(c: Context) {
  const organizationId = c.req.param("organizationId");
  const mediaId = c.req.param("mediaId");
  if (!organizationId || !mediaId) return c.json({ error: "Organization and media ids are required." }, 400);

  try {
    const result = await deleteMedia(organizationId, mediaId);
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleCreateMediaFolder(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);
  const parsed = await validateJsonBody(c, createMediaFolderPayloadSchema, "Invalid media folder payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const folder = await createMediaFolder(organizationId, parsed.data);
    return c.json({ folder });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleDeleteMediaFolder(c: Context) {
  const organizationId = c.req.param("organizationId");
  const folderId = c.req.param("folderId");
  if (!organizationId || !folderId) return c.json({ error: "Organization and folder ids are required." }, 400);

  try {
    const result = await deleteMediaFolder(organizationId, folderId);
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}
