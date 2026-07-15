import { v } from "convex/values";
import { query } from "../_generated/server";
import {
  getMediaAsset,
  listResourceMedia,
  listResourceMediaFolders,
  orderedResourceMedia,
  orderedResourceMediaFolders,
} from "./data";
import { assertMediaPermission } from "./resourcePolicy";
import { mediaAssetValidator, mediaFolderValidator, mediaResourceTypeValidator } from "./validators";

export function isPublicMediaAvailable(asset: { shareVisibility?: string; malwareScanStatus?: string }) {
  return (asset.shareVisibility ?? "private") === "public" && asset.malwareScanStatus === "clean";
}

export const listForResource = query({
  args: {
    organizationId: v.string(),
    resourceType: mediaResourceTypeValidator,
    resourceId: v.string(),
  },
  returns: v.array(mediaAssetValidator),
  handler: async (ctx, args) => {
    await assertMediaPermission(ctx, args.organizationId, args.resourceType, "read");

    const media = await listResourceMedia(ctx, args.organizationId, args.resourceType, args.resourceId);
    return orderedResourceMedia(media);
  },
});

export const getForDelete = query({
  args: {
    organizationId: v.string(),
    mediaId: v.id("mediaAssets"),
  },
  returns: mediaAssetValidator,
  handler: async (ctx, args) => {
    const asset = await getMediaAsset(ctx, args.mediaId);
    if (!asset || asset.organizationId !== args.organizationId) {
      throw new Error("Media asset was not found.");
    }

    await assertMediaPermission(ctx, args.organizationId, asset.resourceType, "update");

    return asset;
  },
});

export const listFoldersForResource = query({
  args: {
    organizationId: v.string(),
    resourceType: mediaResourceTypeValidator,
    resourceId: v.string(),
  },
  returns: v.array(mediaFolderValidator),
  handler: async (ctx, args) => {
    await assertMediaPermission(ctx, args.organizationId, args.resourceType, "read");

    const folders = await listResourceMediaFolders(ctx, args.organizationId, args.resourceType, args.resourceId);
    return orderedResourceMediaFolders(folders);
  },
});

export const getForPublicRoute = query({
  args: {
    mediaId: v.id("mediaAssets"),
  },
  returns: v.union(
    v.object({
      asset: mediaAssetValidator,
      organization: v.object({
        name: v.string(),
        logo: v.optional(v.string()),
      }),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const asset = await getMediaAsset(ctx, args.mediaId);
    if (!asset || !isPublicMediaAvailable(asset)) return null;

    const profile = await ctx.db
      .query("organizations")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", asset.organizationId))
      .first();

    return {
      asset,
      organization: {
        name: profile?.name || "Workspace",
        logo: profile?.logo,
      },
    };
  },
});

export const getForAuthorizedRoute = query({
  args: {
    mediaId: v.id("mediaAssets"),
  },
  returns: v.union(mediaAssetValidator, v.null()),
  handler: async (ctx, args) => {
    const asset = await getMediaAsset(ctx, args.mediaId);
    if (!asset) return null;

    await assertMediaPermission(ctx, asset.organizationId, asset.resourceType, "read");

    return asset;
  },
});
