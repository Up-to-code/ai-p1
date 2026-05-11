import { v } from "convex/values";
import { clientPriorityValidator } from "../clients/validators";

export const clientTaskStatusValidator = v.union(
  v.literal("open"),
  v.literal("done"),
  v.literal("canceled"),
);

export const clientTaskInputValidator = v.object({
  clientId: v.id("clients"),
  title: v.string(),
  status: clientTaskStatusValidator,
  priority: clientPriorityValidator,
  dueAt: v.optional(v.number()),
  propertyId: v.optional(v.id("propertyUnits")),
  projectId: v.optional(v.id("projects")),
  calendarEventId: v.optional(v.id("calendarEvents")),
  notes: v.optional(v.string()),
});

export const clientTaskValidator = v.object({
  _id: v.id("clientTasks"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  clientId: v.id("clients"),
  title: v.string(),
  status: clientTaskStatusValidator,
  priority: clientPriorityValidator,
  dueAt: v.optional(v.number()),
  propertyId: v.optional(v.id("propertyUnits")),
  projectId: v.optional(v.id("projects")),
  calendarEventId: v.optional(v.id("calendarEvents")),
  notes: v.optional(v.string()),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  completedAt: v.optional(v.number()),
});
