import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthUser } from "../auth";
import {
  attachMediaToResource,
  createMediaFolderForResource,
  deleteMediaFolderForResource,
  removeMediaAsset,
  updateMediaAsset,
} from "./attachment";
import {
  attachMediaInputValidator,
  createMediaFolderInputValidator,
  mediaAssetValidator,
  mediaFolderValidator,
  updateMediaInputValidator,
} from "./validators";

export const attachFromHono = mutation({
  args: {
    organizationId: v.string(),
    input: attachMediaInputValidator,
  },
  returns: mediaAssetValidator,
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    return attachMediaToResource(ctx, {
      organizationId: args.organizationId,
      input: args.input,
      actorUserId: user._id,
    });
  },
});

export const updateFromHono = mutation({
  args: {
    organizationId: v.string(),
    mediaId: v.id("mediaAssets"),
    input: updateMediaInputValidator,
  },
  returns: mediaAssetValidator,
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    return updateMediaAsset(ctx, {
      organizationId: args.organizationId,
      mediaId: args.mediaId,
      input: args.input,
      actorUserId: user._id,
    });
  },
});

export const removeFromHono = mutation({
  args: {
    organizationId: v.string(),
    mediaId: v.id("mediaAssets"),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    return removeMediaAsset(ctx, {
      organizationId: args.organizationId,
      mediaId: args.mediaId,
      actorUserId: user._id,
    });
  },
});

export const createFolderFromHono = mutation({
  args: {
    organizationId: v.string(),
    input: createMediaFolderInputValidator,
  },
  returns: mediaFolderValidator,
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    return createMediaFolderForResource(ctx, {
      organizationId: args.organizationId,
      input: args.input,
      actorUserId: user._id,
    });
  },
});

export const deleteFolderFromHono = mutation({
  args: {
    organizationId: v.string(),
    folderId: v.id("mediaFolders"),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    return deleteMediaFolderForResource(ctx, {
      organizationId: args.organizationId,
      folderId: args.folderId,
      actorUserId: user._id,
    });
  },
});
