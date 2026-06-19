import { v } from "convex/values";

export const followUpTypeValidator = v.union(
  v.literal("call"),
  v.literal("meeting"),
  v.literal("email"),
  v.literal("task"),
);

export const followUpStatusValidator = v.union(
  v.literal("completed"),
  v.literal("upcoming"),
  v.literal("past"),
  v.literal("canceled"),
);

export const followUpInputValidator = v.object({
  clientId: v.string(),
  type: followUpTypeValidator,
  title: v.string(),
  notes: v.optional(v.string()),
  followUpDate: v.number(),
  dueDate: v.optional(v.string()),
  status: followUpStatusValidator,
  opportunityId: v.optional(v.string()),
  projectId: v.optional(v.string()),
  calendarEventId: v.optional(v.string()),
  assigneeUserId: v.optional(v.string()),
  visibility: v.optional(v.union(v.literal("private"), v.literal("team"), v.literal("workspace"))),
});

export const followUpValidator = v.object({
  _id: v.id("clientFollowUps"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  clientId: v.string(),
  type: followUpTypeValidator,
  title: v.string(),
  notes: v.optional(v.string()),
  followUpDate: v.number(),
  dueDate: v.optional(v.string()),
  status: followUpStatusValidator,
  opportunityId: v.optional(v.string()),
  projectId: v.optional(v.string()),
  calendarEventId: v.optional(v.string()),
  assigneeUserId: v.optional(v.string()),
  visibility: v.optional(v.union(v.literal("private"), v.literal("team"), v.literal("workspace"))),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  completedAt: v.optional(v.number()),
});
