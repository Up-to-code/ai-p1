import { defineTable } from "convex/server";
import { v } from "convex/values";

const customFieldValidator = v.object({
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
    customFields: v.optional(v.array(customFieldValidator)),
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
