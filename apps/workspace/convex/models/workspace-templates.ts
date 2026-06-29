import { defineTable } from "convex/server";
import { v } from "convex/values";
import { workOsCustomFieldDefinitionValidator } from "./shared";

export const workspaceTemplateTables = {
  workspaceTemplates: defineTable({
    organizationId: v.optional(v.string()),
    key: v.union(
      v.literal("custom"),
      v.literal("sales_crm"),
      v.literal("agency_marketing"),
      v.literal("consulting_services"),
      v.literal("operations"),
      v.literal("real_estate_legacy"),
    ),
    name: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    version: v.string(),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("archived")),
    recordLabels: v.optional(v.any()),
    recordStatuses: v.optional(v.any()),
    opportunityStages: v.optional(v.array(v.string())),
    customFieldDefinitions: v.optional(v.array(workOsCustomFieldDefinitionValidator)),
    automationRecipes: v.optional(v.array(v.string())),
    views: v.optional(v.array(v.object({
      recordType: v.union(
        v.literal("client"), v.literal("deal"), v.literal("opportunity"),
        v.literal("project"), v.literal("task"), v.literal("calendarEvent"),
        v.literal("space"),
      ),
      type: v.union(v.literal("table"), v.literal("board"), v.literal("calendar"), v.literal("detail")),
      name: v.string(),
    }))),
    createdByUserId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_key", ["key"])
    .index("by_organization_key", ["organizationId", "key"])
    .index("by_updated", ["updatedAt"]),
};
