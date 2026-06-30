import { defineTable } from "convex/server";
import { v } from "convex/values";

export const docsTables = {
  docFolders: defineTable({
    organizationId: v.string(),
    name: v.string(),
    parentId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    icon: v.optional(v.string()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization", ["organizationId"])
    .index("by_organization_project", ["organizationId", "projectId"])
    .index("by_parent", ["parentId"])
    .index("by_organization_parent", ["organizationId", "parentId"]),

  docs: defineTable({
    organizationId: v.string(),
    title: v.string(),
    content: v.optional(v.string()),
    folderId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    visibility: v.union(v.literal("private"), v.literal("team"), v.literal("workspace")),
    tags: v.optional(v.array(v.string())),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization", ["organizationId"])
    .index("by_organization_project", ["organizationId", "projectId"])
    .index("by_folder", ["folderId"])
    .index("by_organization_folder", ["organizationId", "folderId"]),
};
