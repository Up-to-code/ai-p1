import { v } from "convex/values";

export const docVisibilityValidator = v.union(
  v.literal("private"),
  v.literal("team"),
  v.literal("workspace"),
);

export const docInputValidator = v.object({
  title: v.string(),
  content: v.optional(v.string()),
  folderId: v.optional(v.string()),
  projectId: v.optional(v.string()),
  visibility: v.optional(docVisibilityValidator),
  tags: v.optional(v.array(v.string())),
});

export const docValidator = v.object({
  _id: v.id("docs"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  title: v.string(),
  content: v.optional(v.string()),
  folderId: v.optional(v.string()),
  projectId: v.optional(v.string()),
  visibility: docVisibilityValidator,
  tags: v.optional(v.array(v.string())),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});

export const docFolderInputValidator = v.object({
  name: v.string(),
  parentId: v.optional(v.string()),
  projectId: v.optional(v.string()),
  icon: v.optional(v.string()),
});

export const docFolderValidator = v.object({
  _id: v.id("docFolders"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  name: v.string(),
  parentId: v.optional(v.string()),
  projectId: v.optional(v.string()),
  icon: v.optional(v.string()),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});
