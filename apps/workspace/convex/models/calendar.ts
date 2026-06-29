import { defineTable } from "convex/server";
import { v } from "convex/values";
import { workOsCustomFieldValueValidator } from "./shared";

export const calendarTables = {
  calendarEvents: defineTable({
    organizationId: v.string(),
    title: v.string(),
    ownerUserId: v.optional(v.string()),
    clientId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    taskId: v.optional(v.string()),
    startAt: v.number(),
    endAt: v.number(),
    type: v.union(
      v.literal("meeting"),
      v.literal("deadline"),
      v.literal("reminder"),
      v.literal("milestone"),
      v.literal("focusBlock"),
    ),
    status: v.union(v.literal("confirmed"), v.literal("pending"), v.literal("draft")),
    attendeeUserIds: v.optional(v.array(v.string())),
    externalAttendees: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    meetingUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    customFields: v.optional(v.array(workOsCustomFieldValueValidator)),
    spaceId: v.optional(v.string()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_owner", ["organizationId", "ownerUserId"])
    .index("by_organization_project", ["organizationId", "projectId"])
    .index("by_organization_project_space", ["organizationId", "projectId", "spaceId"])
    .index("by_organization_client", ["organizationId", "clientId"])
    .index("by_start", ["organizationId", "startAt"])
    .index("by_updated", ["updatedAt"]),
};
