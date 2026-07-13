import type { Context } from "hono";
import { UTApi } from "uploadthing/server";
import { createDomainRouter } from "@/server/utils/create-domain-router";
import { requireOrganizationId } from "@/server/utils/organization/require-organization-id";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/auth-request";
import { hydrateUploadThingEnvFromToken } from "@/server/uploadthing/config";
import { api } from "@convex/_generated/api";
import {
  validateMediaKind,
  attachMediaPayloadSchema,
  updateMediaPayloadSchema,
  createMediaFolderPayloadSchema,
  type AttachMediaPayload,
  type UpdateMediaPayload,
  type CreateMediaFolderPayload,
} from "../validation/media.schema";

export const { handleUpdate: handleUpdateMedia } = createDomainRouter({
  resourceName: "mediaAsset",
  createSchema: attachMediaPayloadSchema,
  updateSchema: updateMediaPayloadSchema,
  resourceIdParam: "mediaId",
  convex: {
    create: api.media.write.attachFromHono,
    update: api.media.write.updateFromHono,
    delete: api.media.write.removeFromHono,
  },
});

export async function handleDeleteMedia(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const mediaId = c.req.param("mediaId");
  if (!mediaId) return c.json({ error: "Media id is required." }, 400);

  try {
    const asset = await fetchAuthQuery(api.media.read.getForDelete, {
      organizationId: org.organizationId,
      mediaId: mediaId as never,
    });
    hydrateUploadThingEnvFromToken();
    const utapi = new UTApi();
    await utapi.deleteFiles(asset.key);

    return c.json(await fetchAuthMutation(api.media.write.removeFromHono, {
      organizationId: org.organizationId,
      mediaId: mediaId as never,
    }));
  } catch (error) {
    return actionErrorJson(c, error, "Media action failed.");
  }
}

export async function handleAttachMedia(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const parsed = await validateJsonBody(c, attachMediaPayloadSchema, "Invalid media payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const input = parsed.data as AttachMediaPayload;
    validateMediaKind(input.mimeType, input.kind);
    return c.json({ mediaAsset: await fetchAuthMutation(api.media.write.attachFromHono, {
      organizationId: org.organizationId,
      input: input as never,
    }) });
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
    return c.json({ folder: await fetchAuthMutation(api.media.write.createFolderFromHono, {
      organizationId: org.organizationId,
      input: parsed.data as CreateMediaFolderPayload,
    }) });
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
    return c.json(await fetchAuthMutation(api.media.write.deleteFolderFromHono, {
      organizationId: org.organizationId,
      folderId: folderId as never,
    }));
  } catch (error) {
    return actionErrorJson(c, error, "Media action failed.");
  }
}
