import { defineTable } from "convex/server";
import { v } from "convex/values";

export const clientFollowUpTables = {
  clientFollowUps: defineTable({
    organizationId: v.string(),
    clientId: v.string(),
    type: v.union(
      v.literal("call"),
      v.literal("meeting"),
      v.literal("email"),
      v.literal("task"),
    ),
    title: v.string(),
    notes: v.optional(v.string()),
    followUpDate: v.number(),
    dueDate: v.optional(v.string()),
    status: v.union(
      v.literal("completed"),
      v.literal("upcoming"),
      v.literal("past"),
      v.literal("canceled"),
    ),
    opportunityId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    calendarEventId: v.optional(v.string()),
    assigneeUserId: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("private"), v.literal("team"), v.literal("workspace"))),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_client", ["organizationId", "clientId"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_organization_date", ["organizationId", "followUpDate"])
    .index("by_updated", ["updatedAt"]),
};
