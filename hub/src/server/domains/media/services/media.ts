import { api } from "@convex/_generated/api";
import { UTApi } from "uploadthing/server";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/better-auth/server";
import { validateMediaKind, type AttachMediaPayload, type UpdateMediaPayload } from "../validation/media.schema";

export async function attachMedia(organizationId: string, input: AttachMediaPayload) {
  validateMediaKind(input.mimeType, input.kind);
  return fetchAuthMutation(api.media.write.attachFromHono, { organizationId, input });
}

export async function updateMedia(organizationId: string, mediaId: string, input: UpdateMediaPayload) {
  return fetchAuthMutation(api.media.write.updateFromHono, {
    organizationId,
    mediaId: mediaId as never,
    input,
  });
}

export async function deleteMedia(organizationId: string, mediaId: string) {
  const asset = await fetchAuthQuery(api.media.read.getForDelete, {
    organizationId,
    mediaId: mediaId as never,
  });

  const utapi = new UTApi();
  await utapi.deleteFiles(asset.key);

  return fetchAuthMutation(api.media.write.removeFromHono, {
    organizationId,
    mediaId: mediaId as never,
  });
}
