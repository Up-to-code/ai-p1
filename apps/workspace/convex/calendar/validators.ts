import { v } from "convex/values";

export const calendarEventTypeValidator = v.union(
  v.literal("meeting"),
  v.literal("deadline"),
  v.literal("reminder"),
  v.literal("milestone"),
  v.literal("focusBlock"),
);

export const calendarEventStatusValidator = v.union(
  v.literal("confirmed"),
  v.literal("pending"),
  v.literal("draft"),
);

export const calendarEventInputValidator = v.object({
  title: v.string(),
  ownerUserId: v.optional(v.string()),
  startAt: v.number(),
  endAt: v.number(),
  type: calendarEventTypeValidator,
  status: calendarEventStatusValidator,
  attendeeUserIds: v.optional(v.array(v.string())),
  externalAttendees: v.optional(v.array(v.string())),
  location: v.optional(v.string()),
  meetingUrl: v.optional(v.string()),
  notes: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
});

export const calendarEventValidator = v.object({
  _id: v.id("calendarEvents"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  title: v.string(),
  ownerUserId: v.optional(v.string()),
  startAt: v.number(),
  endAt: v.number(),
  date: v.string(),
  time: v.string(),
  type: calendarEventTypeValidator,
  status: calendarEventStatusValidator,
  attendeeUserIds: v.optional(v.array(v.string())),
  externalAttendees: v.optional(v.array(v.string())),
  location: v.optional(v.string()),
  meetingUrl: v.optional(v.string()),
  notes: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  customFields: v.optional(v.array(v.any())),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});
