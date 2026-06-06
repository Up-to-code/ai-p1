import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { clerkAuthComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { cancelQueuedJobsForSource, scheduleCalendarEventReminders } from "../notifications/helpers";
import { calendarEventInputValidator, calendarEventValidator } from "./validators";

function isoDate(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function isoTime(timestamp: number) {
  return new Date(timestamp).toISOString().slice(11, 16);
}

function presentEvent<TEvent extends { _id: Id<"calendarEvents">; propertyId?: Id<"propertyUnits">; startAt: number }>(event: TEvent) {
  return {
    ...event,
    id: event._id,
    date: isoDate(event.startAt),
    time: isoTime(event.startAt),
    unitId: event.propertyId,
  };
}

async function assertOptionalLinks(
  ctx: MutationCtx,
  organizationId: string,
  input: {
    clientId?: Id<"clients">;
    propertyId?: Id<"propertyUnits">;
    projectId?: Id<"projects">;
    taskId?: Id<"clientTasks">;
  },
) {
  if (input.clientId) {
    const client = await ctx.db.get(input.clientId);
    if (!client || client.organizationId !== organizationId || client.deletedAt) throw new Error("Client was not found.");
  }
  if (input.propertyId) {
    const property = await ctx.db.get(input.propertyId);
    if (!property || property.organizationId !== organizationId || property.deletedAt) throw new Error("Property unit was not found.");
  }
  if (input.projectId) {
    const project = await ctx.db.get(input.projectId);
    if (!project || project.organizationId !== organizationId || project.deletedAt) throw new Error("Project was not found.");
  }
  if (input.taskId) {
    const task = await ctx.db.get(input.taskId);
    if (!task || task.organizationId !== organizationId || task.deletedAt) throw new Error("Task was not found.");
  }
}

export const createFromHono = mutation({
  args: { organizationId: v.string(), input: calendarEventInputValidator },
  returns: calendarEventValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "calendar", "create");
    await assertOptionalLinks(ctx, args.organizationId, args.input);
    const now = Date.now();
    const id = await ctx.db.insert("calendarEvents", {
      organizationId: args.organizationId,
      ...args.input,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    if (args.input.taskId) {
      await ctx.db.patch(args.input.taskId, { calendarEventId: id, updatedAt: now });
    }

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "calendar.create",
      target: id,
      summary: `Scheduled ${args.input.title}.`,
      createdAt: now,
    });

    const event = await ctx.db.get(id);
    if (!event) throw new Error("Calendar event could not be created.");
    await scheduleCalendarEventReminders(ctx, event);
    return presentEvent(event);
  },
});

export const updateFromHono = mutation({
  args: { organizationId: v.string(), eventId: v.id("calendarEvents"), input: calendarEventInputValidator },
  returns: calendarEventValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "calendar", "update");
    const existing = await ctx.db.get(args.eventId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Calendar event was not found.");
    await assertOptionalLinks(ctx, args.organizationId, args.input);
    const now = Date.now();
    await ctx.db.patch(args.eventId, { ...args.input, updatedAt: now });

    if (args.input.taskId) {
      await ctx.db.patch(args.input.taskId, { calendarEventId: args.eventId, updatedAt: now });
    }

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "calendar.update",
      target: args.eventId,
      summary: `Updated ${args.input.title}.`,
      createdAt: now,
    });

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Calendar event was not found.");
    await scheduleCalendarEventReminders(ctx, event);
    return presentEvent(event);
  },
});

export const deleteFromHono = mutation({
  args: { organizationId: v.string(), eventId: v.id("calendarEvents") },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "calendar", "delete");
    const existing = await ctx.db.get(args.eventId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Calendar event was not found.");
    const now = Date.now();
    await ctx.db.patch(args.eventId, { deletedAt: now, updatedAt: now });
    await cancelQueuedJobsForSource(ctx, args.organizationId, "calendarEvent", args.eventId);
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "calendar.delete",
      target: args.eventId,
      summary: `Deleted ${existing.title}.`,
      createdAt: now,
    });
    return { removed: true };
  },
});
