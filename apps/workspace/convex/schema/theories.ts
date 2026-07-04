import { defineTable } from "convex/server";
import { v } from "convex/values";

export const theoriesTables = {
  theories: defineTable({
    organizationId: v.string(),
    title: v.string(),
    content: v.string(),
    isPrivate: v.boolean(),
    source: v.union(v.literal("ai_generated"), v.literal("user_created")),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization", ["organizationId"])
    .index("by_organization_private", ["organizationId", "isPrivate"])
    .index("by_organization_creator", ["organizationId", "createdByUserId"])
    .index("by_organization_updated", ["organizationId", "updatedAt"]),
};
