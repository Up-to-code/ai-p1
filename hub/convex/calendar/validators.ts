import { v } from "convex/values";

export const calendarEventTypeValidator = v.union(
  v.literal("client-visit"),
  v.literal("site-viewing"),
  v.literal("appointment"),
  v.literal("signing"),
  v.literal("follow-up"),
  v.literal("handover"),
  v.literal("audit"),
  v.literal("custom"),
);

export const calendarEventStatusValidator = v.union(
  v.literal("confirmed"),
  v.literal("pending"),
  v.literal("draft"),
);

export const calendarEventInputValidator = v.object({
  title: v.string(),
  owner: v.string(),
  startAt: v.number(),
  endAt: v.optional(v.number()),
  type: calendarEventTypeValidator,
  status: calendarEventStatusValidator,
  clientId: v.optional(v.id("clients")),
  propertyId: v.optional(v.id("propertyUnits")),
  projectId: v.optional(v.id("projects")),
  taskId: v.optional(v.id("clientTasks")),
  location: v.optional(v.string()),
  notes: v.optional(v.string()),
});

export const calendarEventValidator = v.object({
  _id: v.id("calendarEvents"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  title: v.string(),
  owner: v.string(),
  startAt: v.number(),
  endAt: v.optional(v.number()),
  date: v.string(),
  time: v.string(),
  type: calendarEventTypeValidator,
  status: calendarEventStatusValidator,
  clientId: v.optional(v.id("clients")),
  unitId: v.optional(v.id("propertyUnits")),
  propertyId: v.optional(v.id("propertyUnits")),
  projectId: v.optional(v.id("projects")),
  taskId: v.optional(v.id("clientTasks")),
  clientName: v.optional(v.string()),
  unitTitle: v.optional(v.string()),
  location: v.optional(v.string()),
  notes: v.optional(v.string()),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});
