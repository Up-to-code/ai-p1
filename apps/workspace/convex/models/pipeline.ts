import { defineTable } from "convex/server";
import { v } from "convex/values";

export const pipelineTables = {
  pipeline_stages: defineTable({
    organizationId: v.string(),
    key: v.string(),
    name: v.string(),
    color: v.string(),
    order: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_org_key", ["organizationId", "key"]),
};
