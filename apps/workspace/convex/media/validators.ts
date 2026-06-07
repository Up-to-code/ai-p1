import { v } from "convex/values";

export const mediaKindValidator = v.union(
  v.literal("image"),
  v.literal("video"),
  v.literal("document"),
);

export const mediaResourceTypeValidator = v.union(
  v.literal("project"),
  v.literal("asset"),
  v.literal("client"),
  v.literal("calendarEvent"),
  v.literal("task"),
);

export const mediaShareVisibilityValidator = v.union(
  v.literal("private"),
  v.literal("public"),
);

export const mediaFolderValidator = v.object({
  _id: v.id("mediaFolders"),
  _creationTime: v.number(),
  organizationId: v.string(),
  resourceType: mediaResourceTypeValidator,
  resourceId: v.string(),
  name: v.string(),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});

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
  folderId: v.optional(v.id("mediaFolders")),
  shareVisibility: v.optional(mediaShareVisibilityValidator),
  publicEnabledAt: v.optional(v.number()),
  publicDisabledAt: v.optional(v.number()),
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
  folderId: v.optional(v.id("mediaFolders")),
  isCover: v.optional(v.boolean()),
});

export const updateMediaInputValidator = v.object({
  sortOrder: v.optional(v.number()),
  isCover: v.optional(v.boolean()),
  shareVisibility: v.optional(mediaShareVisibilityValidator),
});

export const createMediaFolderInputValidator = v.object({
  resourceType: mediaResourceTypeValidator,
  resourceId: v.string(),
  name: v.string(),
});
