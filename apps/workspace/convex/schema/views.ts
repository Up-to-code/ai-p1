import { defineTable } from "convex/server";
import { v } from "convex/values";

export const viewTables = {
  views: defineTable({
    organizationId: v.string(),
    domain: v.string(), // "projects", "clients", "deals", "docs", "calendar"
    spaceId: v.optional(v.id("spaces")),
    projectId: v.optional(v.id("projects")),
    userId: v.string(),
    viewConfig: v.object({
      type: v.union(
        v.literal("table"),
        v.literal("board"),
        v.literal("calendar"),
        v.literal("gantt"),
        v.literal("filemanager")
      ),
      label: v.string(),
      filters: v.array(
        v.object({
          field: v.string(),
          operator: v.union(
            v.literal("equals"),
            v.literal("contains"),
            v.literal("startsWith"),
            v.literal("endsWith"),
            v.literal("gt"),
            v.literal("lt"),
            v.literal("gte"),
            v.literal("lte")
          ),
          value: v.any(),
        })
      ),
      sortBy: v.string(),
      sortDirection: v.union(v.literal("asc"), v.literal("desc")),
      groupBy: v.optional(v.string()),
      columns: v.array(
        v.object({
          id: v.string(),
          label: v.string(),
          width: v.optional(v.number()),
          visible: v.optional(v.boolean()),
          sortable: v.optional(v.boolean()),
          filterable: v.optional(v.boolean()),
        })
      ),
      density: v.union(v.literal("compact"), v.literal("normal")),
    }),
    isDefault: v.optional(v.boolean()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_domain", ["organizationId", "domain"])
    .index("by_organization_space", ["organizationId", "spaceId"])
    .index("by_organization_project", ["organizationId", "projectId"])
    .index("by_user", ["organizationId", "userId"])
    .index("by_user_domain", ["organizationId", "userId", "domain"])
    .index("by_user_space", ["organizationId", "userId", "spaceId"])
    .index("by_user_project", ["organizationId", "userId", "projectId"])
    .index("by_organization_updated", ["organizationId", "updatedAt"]),

  workspaceSettings: defineTable({
    organizationId: v.string(),
    viewScope: v.union(v.literal("space"), v.literal("project"), v.literal("workspace")),
    defaultViews: v.optional(
      v.record(
        v.string(),
        v.array(
          v.union(
            v.literal("table"),
            v.literal("board"),
            v.literal("calendar"),
            v.literal("gantt"),
            v.literal("filemanager")
          )
        )
      )
    ),
    updatedAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"]),
};
