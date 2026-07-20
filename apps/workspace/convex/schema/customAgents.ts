import { defineTable } from "convex/server";
import { v } from "convex/values";

export const customAgentStatusValidator = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived"),
);

export const customAgentTables = {
  customAgents: defineTable({
    organizationId: v.string(),
    ownerUserId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    instructions: v.string(),
    model: v.string(),
    status: customAgentStatusValidator,
    draftRevision: v.number(),
    publishedRevision: v.optional(v.number()),
    publishedInstructions: v.optional(v.string()),
    publishedModel: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    publishedAt: v.optional(v.number()),
    archivedAt: v.optional(v.number()),
  })
    .index("by_owner_organization_updated", [
      "ownerUserId",
      "organizationId",
      "updatedAt",
    ])
    .index("by_owner_organization_status", [
      "ownerUserId",
      "organizationId",
      "status",
    ]),
};
