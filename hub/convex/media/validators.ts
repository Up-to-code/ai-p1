import { v } from "convex/values";

export const mediaKindValidator = v.union(
  v.literal("image"),
  v.literal("video"),
  v.literal("document"),
);

export const mediaResourceTypeValidator = v.union(
  v.literal("project"),
  v.literal("property"),
);

export const mediaAssetValidator = v.object({
  _id: v.id("mediaAssets"),
  _creationTime: v.number(),
  organizationId: v.string(),
  key: v.string(),
  url: v.string(),
  name: v.string(),
  mimeType: v.string(),
  size: v.number(),
  kind: mediaKindValidator,
  resourceType: mediaResourceTypeValidator,
  resourceId: v.string(),
  sortOrder: v.number(),
  isCover: v.boolean(),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const attachMediaInputValidator = v.object({
  key: v.string(),
  url: v.string(),
  name: v.string(),
  mimeType: v.string(),
  size: v.number(),
  kind: mediaKindValidator,
  resourceType: mediaResourceTypeValidator,
  resourceId: v.string(),
  isCover: v.optional(v.boolean()),
});

export const updateMediaInputValidator = v.object({
  sortOrder: v.optional(v.number()),
  isCover: v.optional(v.boolean()),
});
