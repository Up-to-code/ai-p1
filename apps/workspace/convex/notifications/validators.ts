import { v } from "convex/values";

export const notificationEventKindValidator = v.union(
  v.literal("task_assigned"),
  v.literal("mentioned"),
  v.literal("thread_reply"),
);

export const notificationEventLaneValidator = v.union(
  v.literal("primary"),
  v.literal("other"),
);

export const notificationEventDispositionValidator = v.union(
  v.literal("active"),
  v.literal("later"),
  v.literal("cleared"),
);

export const notificationEventResourceTypeValidator = v.union(
  v.literal("task"),
  v.literal("message"),
  v.literal("document"),
  v.literal("project"),
  v.literal("client"),
  v.literal("deal"),
  v.literal("file"),
);

export const notificationEventValidator = v.object({
  _id: v.id("notificationEvents"),
  _creationTime: v.number(),
  organizationId: v.string(),
  recipientUserId: v.string(),
  actorUserId: v.string(),
  kind: notificationEventKindValidator,
  lane: v.optional(notificationEventLaneValidator),
  disposition: v.optional(notificationEventDispositionValidator),
  resourceType: notificationEventResourceTypeValidator,
  resourceId: v.string(),
  title: v.string(),
  body: v.optional(v.string()),
  href: v.string(),
  dedupeKey: v.string(),
  readAt: v.optional(v.number()),
  deferredAt: v.optional(v.number()),
  clearedAt: v.optional(v.number()),
  createdAt: v.number(),
});

export const notificationCategoryValidator = v.union(
  v.literal("calendar"),
  v.literal("task"),
  v.literal("manual"),
  v.literal("organization"),
);

export const notificationSourceTypeValidator = v.union(
  v.literal("calendarEvent"),
  v.literal("task"),
  v.literal("manualSchedule"),
);

export const notificationTriggerValidator = v.union(
  v.literal("before_start"),
  v.literal("at_start"),
  v.literal("after_start"),
  v.literal("after_complete"),
);

export const notificationJobTriggerValidator = v.union(
  notificationTriggerValidator,
  v.literal("manual"),
);

export const quietHoursValidator = v.object({
  enabled: v.boolean(),
  startMinute: v.number(),
  endMinute: v.number(),
  timezone: v.string(),
});

export const reminderRuleValidator = v.object({
  id: v.string(),
  sourceType: notificationSourceTypeValidator,
  trigger: notificationTriggerValidator,
  offsetMinutes: v.number(),
  enabled: v.boolean(),
});

export const notificationCategoriesValidator = v.object({
  calendar: v.boolean(),
  task: v.boolean(),
  manual: v.boolean(),
  organization: v.boolean(),
});

export const notificationPreferenceInputValidator = v.object({
  enabled: v.boolean(),
  categories: notificationCategoriesValidator,
  quietHours: v.optional(quietHoursValidator),
  reminderRules: v.array(reminderRuleValidator),
});

export const notificationPreferenceValidator = v.object({
  _id: v.id("notificationPreferences"),
  _creationTime: v.number(),
  organizationId: v.string(),
  principalType: v.union(v.literal("user"), v.literal("organization")),
  principalKey: v.string(),
  principalUserId: v.optional(v.string()),
  enabled: v.boolean(),
  categories: notificationCategoriesValidator,
  quietHours: v.optional(quietHoursValidator),
  reminderRules: v.array(reminderRuleValidator),
  createdByUserId: v.string(),
  updatedByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const notificationPreferenceSurfaceValidator = v.object({
  _id: v.optional(v.id("notificationPreferences")),
  _creationTime: v.optional(v.number()),
  organizationId: v.string(),
  principalType: v.union(v.literal("user"), v.literal("organization")),
  principalKey: v.string(),
  principalUserId: v.optional(v.string()),
  enabled: v.boolean(),
  categories: notificationCategoriesValidator,
  quietHours: v.optional(quietHoursValidator),
  reminderRules: v.array(reminderRuleValidator),
  createdByUserId: v.string(),
  updatedByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const notificationDeviceValidator = v.object({
  _id: v.id("notificationDevices"),
  _creationTime: v.number(),
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
});

export const notificationScheduleInputValidator = v.object({
  title: v.string(),
  body: v.string(),
  category: notificationCategoryValidator,
  scheduledAt: v.number(),
  timezone: v.optional(v.string()),
  recurrence: v.optional(v.object({
    frequency: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    interval: v.number(),
    untilAt: v.optional(v.number()),
  })),
});

export const notificationScheduleValidator = v.object({
  _id: v.id("notificationSchedules"),
  _creationTime: v.number(),
  organizationId: v.string(),
  ownerUserId: v.string(),
  title: v.string(),
  body: v.string(),
  category: notificationCategoryValidator,
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
});

export const notificationJobPayloadValidator = v.object({
  url: v.optional(v.string()),
  organizationId: v.optional(v.string()),
  sourceType: v.optional(v.string()),
  sourceId: v.optional(v.string()),
});
