import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import type { Infer } from "convex/values";
import type { mediaResourceTypeValidator } from "./validators";

export type MediaResourceType = Infer<typeof mediaResourceTypeValidator>;

export async function getMediaAsset(ctx: QueryCtx | MutationCtx, mediaId: Id<"mediaAssets">) {
  return ctx.db.get(mediaId);
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
    .collect();
}

export function selectCoverUrl(media: Awaited<ReturnType<typeof listResourceMedia>>) {
  const images = media
    .filter((asset) => asset.kind === "image")
    .sort((a, b) => Number(b.isCover) - Number(a.isCover) || a.sortOrder - b.sortOrder || a.createdAt - b.createdAt);

  return images[0]?.url;
}
