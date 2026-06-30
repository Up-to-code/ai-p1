import { defineTable } from "convex/server";
import { v } from "convex/values";

export const userTables = {
  userProfiles: defineTable({
    userId: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(v.string()),
    language: v.optional(v.union(v.literal("en"), v.literal("ar"))),
    timezone: v.optional(v.string()),
    notifications: v.optional(v.object({
      product: v.boolean(),
      approvals: v.boolean(),
      billing: v.boolean(),
      security: v.boolean(),
    })),
    avatarUrl: v.optional(v.string()),
    avatarKey: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_updated", ["updatedAt"]),

  notificationDevices: defineTable({
    userId: v.string(),
    installationId: v.string(),
    recipientKey: v.string(),
    platform: v.string(),
    appVersion: v.optional(v.string()),
    tokenLast4: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("revoked")),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastRegisteredAt: v.number(),
    revokedAt: v.optional(v.number()),
  })
    .index("by_user_id", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_recipient_key", ["recipientKey"])
    .index("by_installation", ["userId", "installationId"]),

  notificationPreferences: defineTable({
    organizationId: v.string(),
    principalType: v.union(v.literal("user"), v.literal("organization")),
    principalKey: v.string(),
    principalUserId: v.optional(v.string()),
    enabled: v.boolean(),
    categories: v.object({
      calendar: v.boolean(),
      task: v.boolean(),
      manual: v.boolean(),
      organization: v.boolean(),
    }),
    quietHours: v.optional(v.object({
      enabled: v.boolean(),
      startMinute: v.number(),
      endMinute: v.number(),
      timezone: v.string(),
    })),
    reminderRules: v.array(v.object({
      id: v.string(),
      sourceType: v.union(v.literal("calendarEvent"), v.literal("task"), v.literal("manualSchedule")),
      trigger: v.union(v.literal("before_start"), v.literal("at_start"), v.literal("after_start"), v.literal("after_complete")),
      offsetMinutes: v.number(),
      enabled: v.boolean(),
    })),
    createdByUserId: v.string(),
    updatedByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization_principal", ["organizationId", "principalKey"])
    .index("by_organization_type", ["organizationId", "principalType"]),

  notificationSchedules: defineTable({
    organizationId: v.string(),
    ownerUserId: v.string(),
    title: v.string(),
    body: v.string(),
    category: v.union(v.literal("calendar"), v.literal("task"), v.literal("manual"), v.literal("organization")),
    scheduledAt: v.number(),
    timezone: v.optional(v.string()),
    recurrence: v.optional(v.object({
      frequency: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
      interval: v.number(),
      untilAt: v.optional(v.number()),
    })),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("canceled")),
    createdByUserId: v.string(),
    updatedByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    canceledAt: v.optional(v.number()),
  })
    .index("by_organization_owner", ["organizationId", "ownerUserId"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_status_scheduled", ["status", "scheduledAt"]),

  notificationJobs: defineTable({
    organizationId: v.string(),
    recipientUserId: v.string(),
    sourceType: v.union(v.literal("calendarEvent"), v.literal("task"), v.literal("manualSchedule")),
    sourceId: v.string(),
    trigger: v.union(v.literal("before_start"), v.literal("at_start"), v.literal("after_start"), v.literal("after_complete"), v.literal("manual")),
    category: v.union(v.literal("calendar"), v.literal("task"), v.literal("manual"), v.literal("organization")),
    scheduledAt: v.number(),
    state: v.union(
      v.literal("queued"),
      v.literal("delivered"),
      v.literal("skipped"),
      v.literal("failed"),
      v.literal("canceled"),
    ),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.object({
      url: v.optional(v.string()),
      organizationId: v.optional(v.string()),
      sourceType: v.optional(v.string()),
      sourceId: v.optional(v.string()),
    })),
    componentNotificationId: v.optional(v.string()),
    error: v.optional(v.string()),
    scheduledFunctionId: v.optional(v.id("_scheduled_functions")),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deliveredAt: v.optional(v.number()),
    skippedAt: v.optional(v.number()),
    failedAt: v.optional(v.number()),
    canceledAt: v.optional(v.number()),
  })
    .index("by_recipient_state_scheduled", ["recipientUserId", "state", "scheduledAt"])
    .index("by_organization_state_scheduled", ["organizationId", "state", "scheduledAt"])
    .index("by_source_state", ["organizationId", "sourceType", "sourceId", "state"])
    .index("by_state_scheduled", ["state", "scheduledAt"]),

  userTableViews: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    resourceType: v.string(),
    viewType: v.string(),
    scope: v.union(
      v.literal("project"),
      v.literal("space"),
      v.literal("workspace"),
      v.literal("global"),
    ),
    scopeKey: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    spaceId: v.optional(v.string()),
    config: v.object({
      groupBy: v.optional(v.string()),
      sortBy: v.optional(v.string()),
      search: v.optional(v.string()),
      density: v.optional(v.union(v.literal("compact"), v.literal("normal"))),
      showFields: v.optional(v.boolean()),
      filters: v.optional(
        v.array(
          v.object({
            id: v.string(),
            field: v.string(),
            operator: v.string(),
            value: v.optional(v.any()),
          }),
        ),
      ),
      columnWidths: v.optional(v.record(v.string(), v.number())),
      columnVisibility: v.optional(v.record(v.string(), v.boolean())),
      columnOrder: v.optional(v.array(v.string())),
    }),
    isDefault: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_resource", ["userId", "resourceType"])
    .index("by_user_resource_view", ["userId", "resourceType", "viewType"])
    .index("by_user_default", ["userId", "isDefault"]),
};
