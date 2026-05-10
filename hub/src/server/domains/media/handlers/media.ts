import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { attachMedia, deleteMedia, updateMedia } from "../services/media";
import { attachMediaPayloadSchema, updateMediaPayloadSchema } from "../validation/media.schema";

function handleError(c: Context, error: unknown) {
  const message = error instanceof Error ? error.message : "Media action failed.";
  return c.json({ error: message }, 500 as ContentfulStatusCode);
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
