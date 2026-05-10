import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { getMediaAsset, listResourceMedia } from "./data";
import { mediaAssetValidator, mediaResourceTypeValidator } from "./validators";

export const listForResource = query({
  args: {
    organizationId: v.string(),
    resourceType: mediaResourceTypeValidator,
    resourceId: v.string(),
  },
  returns: v.array(mediaAssetValidator),
  handler: async (ctx, args) => {
    const resource = args.resourceType === "project" ? "project" : "property";
    await assertOrganizationResourcePermission(ctx, args.organizationId, resource, "read");

    const media = await listResourceMedia(ctx, args.organizationId, args.resourceType, args.resourceId);
    return media.sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt - b.createdAt);
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

    const resource = asset.resourceType === "project" ? "project" : "property";
    await assertOrganizationResourcePermission(ctx, args.organizationId, resource, "update");

    return asset;
  },
});
