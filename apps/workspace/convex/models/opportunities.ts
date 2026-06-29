import { defineTable } from "convex/server";
import { v } from "convex/values";
import { workOsCustomFieldValueValidator } from "./shared";

export const opportunityTables = {
  opportunities: defineTable({
    organizationId: v.string(),
    title: v.string(),
    clientId: v.optional(v.id("clients")),
    projectId: v.optional(v.id("projects")),
    stage: v.union(
      v.literal("new"),
      v.literal("qualified"),
      v.literal("proposal"),
      v.literal("negotiation"),
      v.literal("won"),
      v.literal("lost"),
    ),
    status: v.union(
      v.literal("open"),
      v.literal("won"),
      v.literal("lost"),
      v.literal("paused"),
    ),
    value: v.optional(v.number()),
    currency: v.optional(v.string()),
    source: v.optional(v.string()),
    priority: v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent")),
    closeDate: v.optional(v.string()),
    nextStep: v.optional(v.string()),
    ownerUserId: v.string(),
    tags: v.optional(v.array(v.string())),
    customFields: v.optional(v.array(workOsCustomFieldValueValidator)),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    closedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_stage", ["organizationId", "stage"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_organization_owner", ["organizationId", "ownerUserId"])
    .index("by_organization_deleted_updated", ["organizationId", "isDeleted", "updatedAt"])
    .index("by_client", ["organizationId", "clientId"])
    .index("by_project", ["organizationId", "projectId"])
    .index("by_updated", ["updatedAt"]),
};
