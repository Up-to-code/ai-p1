import { defineTable } from "convex/server";
import { v } from "convex/values";

export const permissionTables = {
  workspaces: defineTable({
    organizationId: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_slug", ["organizationId", "slug"])
    .index("by_updated", ["updatedAt"]),

  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    organizationId: v.string(),
    userId: v.string(),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer"),
    ),
    joinedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace_id", ["workspaceId"])
    .index("by_workspace_user", ["workspaceId", "userId"])
    .index("by_organization_user", ["organizationId", "userId"])
    .index("by_user", ["userId"]),

  spaceMembers: defineTable({
    workspaceId: v.string(),
    spaceId: v.id("projectSpaces"),
    organizationId: v.string(),
    userId: v.string(),
    role: v.union(
      v.literal("manager"),
      v.literal("editor"),
      v.literal("viewer"),
    ),
    joinedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_space_id", ["spaceId"])
    .index("by_workspace_user", ["workspaceId", "userId"])
    .index("by_organization_user", ["organizationId", "userId"])
    .index("by_user", ["userId"]),

  projectMembers: defineTable({
    workspaceId: v.string(),
    projectId: v.id("projects"),
    organizationId: v.string(),
    userId: v.string(),
    role: v.union(
      v.literal("manager"),
      v.literal("editor"),
      v.literal("viewer"),
      v.literal("guest"),
    ),
    joinedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project_id", ["projectId"])
    .index("by_workspace_user", ["workspaceId", "userId"])
    .index("by_organization_user", ["organizationId", "userId"])
    .index("by_user", ["userId"]),
};
