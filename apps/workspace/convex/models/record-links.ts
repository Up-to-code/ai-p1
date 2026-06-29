import { defineTable } from "convex/server";
import { v } from "convex/values";

export const recordLinkTables = {
  recordLinks: defineTable({
    organizationId: v.string(),
    linkType: v.union(
      v.literal("related"),
      v.literal("owns"),
      v.literal("dependsOn"),
      v.literal("blocks"),
      v.literal("createdFrom"),
      v.literal("attachedTo"),
    ),
    sourceRecordType: v.union(
      v.literal("client"), v.literal("deal"), v.literal("opportunity"),
      v.literal("project"), v.literal("task"), v.literal("calendarEvent"),
      v.literal("space"),
    ),
    sourceRecordId: v.string(),
    targetRecordType: v.union(
      v.literal("client"), v.literal("deal"), v.literal("opportunity"),
      v.literal("project"), v.literal("task"), v.literal("calendarEvent"),
      v.literal("space"),
    ),
    targetRecordId: v.string(),
    label: v.optional(v.string()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_source", ["organizationId", "sourceRecordType", "sourceRecordId"])
    .index("by_target", ["organizationId", "targetRecordType", "targetRecordId"])
    .index("by_type", ["organizationId", "linkType"]),
};
