import { defineTable } from "convex/server";
import { v } from "convex/values";
import { workOsCustomFieldValueValidator } from "./shared";

export const projectTables = {
  projects: defineTable({
    organizationId: v.string(),
    name: v.string(),
    clientId: v.optional(v.id("clients")),
    opportunityId: v.optional(v.id("opportunities")),
    ownerUserId: v.string(),
    teamMemberIds: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("planned"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("archived"),
    ),
    health: v.union(v.literal("onTrack"), v.literal("atRisk"), v.literal("blocked")),
    visibility: v.optional(v.union(v.literal("private"), v.literal("team"), v.literal("workspace"))),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    budget: v.optional(v.number()),
    currency: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    customFields: v.optional(v.array(workOsCustomFieldValueValidator)),
    isStrict: v.optional(v.boolean()),
    isRollupEnabled: v.optional(v.boolean()),
    templateId: v.optional(v.string()),
    customTabs: v.optional(v.array(v.string())),
    progress: v.optional(v.number()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_organization_health", ["organizationId", "health"])
    .index("by_organization_owner", ["organizationId", "ownerUserId"])
    .index("by_organization_deleted_updated", ["organizationId", "isDeleted", "updatedAt"])
    .index("by_organization_deleted_status_updated", ["organizationId", "isDeleted", "status", "updatedAt"])
    .index("by_client", ["organizationId", "clientId"])
    .index("by_opportunity", ["organizationId", "opportunityId"])
    .index("by_organization_updated", ["organizationId", "updatedAt"])
    .index("by_updated", ["updatedAt"]),

  projectSpaces: defineTable({
    organizationId: v.string(),
    projectId: v.id("projects"),
    name: v.string(),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    visibility: v.union(v.literal("all_members"), v.literal("selected_members")),
    defaultAssigneeIds: v.optional(v.array(v.string())),
    slug: v.string(),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_project_id", ["organizationId", "projectId"])
    .index("by_project_slug", ["organizationId", "projectId", "slug"])
    .index("by_organization_id", ["organizationId"]),

  workspaceWidgetLayouts: defineTable({
    organizationId: v.string(),
    userId: v.string(),
    widgets: v.array(v.object({
      id: v.string(),
      type: v.string(),
      title: v.string(),
      w: v.number(),
      h: v.number(),
      x: v.optional(v.number()),
      y: v.optional(v.number()),
    })),
    layout: v.optional(v.any()),
    updatedAt: v.number(),
  })
    .index("by_organization_user", ["organizationId", "userId"])
    .index("by_updated", ["updatedAt"]),

  projectDashboards: defineTable({
    organizationId: v.string(),
    projectId: v.string(),
    widgetConfig: v.string(),
    layout: v.string(),
    notes: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_organization_project", ["organizationId", "projectId"]),

  milestones: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    spaceId: v.optional(v.id("projectSpaces")),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("inProgress"),
      v.literal("completed"),
      v.literal("delayed"),
      v.literal("cancelled"),
    ),
    dueDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    order: v.number(),
    tags: v.optional(v.array(v.string())),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_workspace_project", ["workspaceId", "projectId"])
    .index("by_workspace_space", ["workspaceId", "spaceId"]),
};
