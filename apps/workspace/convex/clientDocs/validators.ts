import { v } from "convex/values";

export const customFieldValidator = v.object({
  id: v.string(),
  name: v.string(),
  type: v.union(
    v.literal("text"),
    v.literal("number"),
    v.literal("date"),
    v.literal("select"),
    v.literal("status"),
    v.literal("boolean"),
  ),
  value: v.union(v.string(), v.number(), v.boolean(), v.null()),
  options: v.optional(v.array(v.string())),
  color: v.optional(v.union(
    v.literal("gray"), v.literal("blue"), v.literal("green"), v.literal("yellow"),
    v.literal("orange"), v.literal("red"), v.literal("purple"), v.literal("pink"),
  )),
  layout: v.optional(v.union(v.literal("half"), v.literal("full"))),
});

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
  customFields: v.optional(v.array(customFieldValidator)),
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
  customFields: v.optional(v.array(customFieldValidator)),
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
