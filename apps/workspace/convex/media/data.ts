import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import type { Infer } from "convex/values";
import type { mediaResourceTypeValidator } from "./validators";

export type MediaResourceType = Infer<typeof mediaResourceTypeValidator>;

const MAX_RESOURCE_MEDIA = 100;
const MAX_RESOURCE_FOLDERS = 100;

export async function getMediaAsset(ctx: QueryCtx | MutationCtx, mediaId: Id<"mediaAssets">) {
  return ctx.db.get(mediaId);
}

export async function getMediaFolder(ctx: QueryCtx | MutationCtx, folderId: Id<"mediaFolders">) {
  return ctx.db.get(folderId);
}

export async function listResourceMedia(
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
  resourceType: MediaResourceType,
  resourceId: string,
) {
  return ctx.db
    .query("mediaAssets")
    .withIndex("by_organization_resource", (q) =>
      q.eq("organizationId", organizationId).eq("resourceType", resourceType).eq("resourceId", resourceId),
    )
    .take(MAX_RESOURCE_MEDIA);
}

export function orderedResourceMedia<TAsset extends { sortOrder: number; createdAt: number }>(media: TAsset[]) {
  return media.sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt - b.createdAt);
}

export async function listResourceMediaFolders(
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
  resourceType: MediaResourceType,
  resourceId: string,
) {
  return ctx.db
    .query("mediaFolders")
    .withIndex("by_organization_resource", (q) =>
      q.eq("organizationId", organizationId).eq("resourceType", resourceType).eq("resourceId", resourceId),
    )
    .filter((q) => q.eq(q.field("deletedAt"), undefined))
    .take(MAX_RESOURCE_FOLDERS);
}

export function orderedResourceMediaFolders<TFolder extends { name: string; createdAt: number }>(folders: TFolder[]) {
  return folders.sort((a, b) => a.name.localeCompare(b.name) || a.createdAt - b.createdAt);
}

export function selectCoverUrl(media: Awaited<ReturnType<typeof listResourceMedia>>) {
  const images = orderedResourceMedia(media.filter((asset) => asset.kind === "image"))
    .sort((a, b) => Number(b.isCover) - Number(a.isCover));

  return images[0]?.url;
}
