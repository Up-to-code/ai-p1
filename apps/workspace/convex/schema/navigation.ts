import { defineTable } from "convex/server";
import { v } from "convex/values";

const railModeValidator = v.union(v.literal("expanded"), v.literal("compact"));

export const navigationTables = {
  organizationNavigationLayouts: defineTable({
    organizationId: v.string(),
    roleKey: v.string(),
    domainOrder: v.array(v.string()),
    hiddenOptionalNodeIds: v.array(v.string()),
    aliases: v.record(v.string(), v.string()),
    railMode: v.optional(railModeValidator),
    secondaryPanelWidth: v.optional(v.number()),
    version: v.number(),
    updatedByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization_role", ["organizationId", "roleKey"])
    .index("by_organization_updated", ["organizationId", "updatedAt"]),

  userNavigationOverlays: defineTable({
    organizationId: v.string(),
    userId: v.string(),
    domainOrder: v.array(v.string()),
    hiddenOptionalNodeIds: v.array(v.string()),
    aliases: v.record(v.string(), v.string()),
    railMode: railModeValidator,
    secondaryPanelWidth: v.number(),
    version: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization_user", ["organizationId", "userId"])
    .index("by_user_updated", ["userId", "updatedAt"]),
};
