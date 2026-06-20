import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { clerkAuthComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { cancelQueuedJobsForSource, scheduleCalendarEventReminders } from "../notifications/helpers";
import { isoDate, isoTime, presentWorkspaceRecord } from "../shared/present";
import { calendarEventInputValidator, calendarEventValidator } from "./validators";

function presentEvent(event: Doc<"calendarEvents">) {
  return {
    ...presentWorkspaceRecord(event),
    date: isoDate(event.startAt),
    time: isoTime(event.startAt),
  };
}

export const createFromHono = mutation({
  args: { organizationId: v.string(), input: calendarEventInputValidator },
  returns: calendarEventValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "calendar", "create");
    const now = Date.now();
    const id = await ctx.db.insert("calendarEvents", {
      organizationId: args.organizationId,
      ...args.input,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

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
    const now = Date.now();
    await ctx.db.patch(args.eventId, { ...args.input, updatedAt: now });

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
