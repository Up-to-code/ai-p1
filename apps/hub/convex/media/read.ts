import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { getMediaAsset, listResourceMedia, listResourceMediaFolders } from "./data";
import { mediaAssetValidator, mediaFolderValidator, mediaResourceTypeValidator } from "./validators";

function permissionResourceForMedia(resourceType: "project" | "property" | "client" | "calendarEvent" | "task") {
  if (resourceType === "project") return "project";
  if (resourceType === "property") return "property";
  if (resourceType === "calendarEvent") return "calendar";
  return "client";
}

export const listForResource = query({
  args: {
    organizationId: v.string(),
    resourceType: mediaResourceTypeValidator,
    resourceId: v.string(),
  },
  returns: v.array(mediaAssetValidator),
  handler: async (ctx, args) => {
    const resource = permissionResourceForMedia(args.resourceType);
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

    const resource = permissionResourceForMedia(asset.resourceType);
    await assertOrganizationResourcePermission(ctx, args.organizationId, resource, "update");

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
    const resource = permissionResourceForMedia(args.resourceType);
    await assertOrganizationResourcePermission(ctx, args.organizationId, resource, "read");

    const folders = await listResourceMediaFolders(ctx, args.organizationId, args.resourceType, args.resourceId);
    return folders.sort((a, b) => a.name.localeCompare(b.name) || a.createdAt - b.createdAt);
  },
});

export const getForPublicRoute = query({
  args: {
    mediaId: v.id("mediaAssets"),
  },
  returns: v.union(mediaAssetValidator, v.null()),
  handler: async (ctx, args) => {
    const asset = await getMediaAsset(ctx, args.mediaId);
    if (!asset || (asset.shareVisibility ?? "private") !== "public") return null;
    return asset;
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

    const resource = permissionResourceForMedia(asset.resourceType);
    await assertOrganizationResourcePermission(ctx, asset.organizationId, resource, "read");

    return asset;
  },
});
