import { defineTable } from "convex/server";
import { v } from "convex/values";

export const automationTables = {
  automations: defineTable({
    organizationId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    enabled: v.boolean(),
    trigger: v.any(),
    conditions: v.optional(v.array(v.any())),
    conditionMode: v.optional(v.union(v.literal("all"), v.literal("any"))),
    actions: v.array(v.any()),
    ownerUserId: v.optional(v.string()),
    lastRunAt: v.optional(v.number()),
    lastRunStatus: v.optional(v.union(v.literal("success"), v.literal("failed"), v.literal("skipped"))),
    lastRunSummary: v.optional(v.string()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_enabled", ["organizationId", "enabled"])
    .index("by_organization_owner", ["organizationId", "ownerUserId"])
    .index("by_updated", ["updatedAt"]),
};
