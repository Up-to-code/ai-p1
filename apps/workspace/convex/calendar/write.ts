import { v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { authUser } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { cancelQueuedJobsForSource, scheduleCalendarEventReminders } from "../notifications/helpers";
import { isoDate, isoTime, presentWorkspaceRecord } from "../shared/present";
import { calendarEventInputValidator, calendarEventValidator } from "./validators";

type CalendarEventInput = {
  title: string;
  ownerUserId?: string;
  clientId?: string;
  projectId?: string;
  taskId?: string;
  startAt: number;
  endAt: number;
  type: "meeting" | "deadline" | "reminder" | "milestone" | "focusBlock";
  status: "confirmed" | "pending" | "draft";
  attendeeUserIds?: string[];
  externalAttendees?: string[];
  location?: string;
  meetingUrl?: string;
  notes?: string;
  tags?: string[];
};

function presentEvent(event: Doc<"calendarEvents">) {
  return {
    ...presentWorkspaceRecord(event),
    date: isoDate(event.startAt),
    time: isoTime(event.startAt),
  };
}

async function createEventCore(ctx: MutationCtx, args: { organizationId: string; input: CalendarEventInput; actorUserId: string }) {
  const now = Date.now();
  const id = await ctx.db.insert("calendarEvents", {
    organizationId: args.organizationId,
    ...args.input,
    recordState: "active",
    createdByUserId: args.actorUserId,
    createdAt: now,
    updatedAt: now,
  });

  const event = await ctx.db.get(id);
  if (!event) throw new Error("Calendar event could not be created.");
  await scheduleCalendarEventReminders(ctx, event);
  return { presented: presentEvent(event), now };
}

async function updateEventCore(ctx: MutationCtx, args: { organizationId: string; eventId: Id<"calendarEvents">; input: CalendarEventInput; actorUserId: string }) {
  const existing = await ctx.db.get(args.eventId);
  if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Calendar event was not found.");
  const now = Date.now();
  await ctx.db.patch(args.eventId, { ...args.input, updatedAt: now });

  const event = await ctx.db.get(args.eventId);
  if (!event) throw new Error("Calendar event was not found.");
  await scheduleCalendarEventReminders(ctx, event);
  return { presented: presentEvent(event), now };
}

async function deleteEventCore(ctx: MutationCtx, args: { organizationId: string; eventId: Id<"calendarEvents">; actorUserId: string }) {
  const existing = await ctx.db.get(args.eventId);
  if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Calendar event was not found.");
  const now = Date.now();
  await ctx.db.patch(args.eventId, { deletedAt: now, recordState: "deleted", updatedAt: now });
  await cancelQueuedJobsForSource(ctx, args.organizationId, "calendarEvent", args.eventId);
  return { removed: true as const, now, title: existing.title };
}

export const createFromHono = mutation({
  args: { organizationId: v.string(), input: calendarEventInputValidator },
  returns: calendarEventValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "calendar", "create");
    const { presented, now } = await createEventCore(ctx, {
      organizationId: args.organizationId,
      input: args.input,
      actorUserId: user._id,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "calendar.create",
      target: presented.id,
      summary: `Scheduled ${args.input.title}.`,
      createdAt: now,
    });
    return presented;
  },
});

export const updateFromHono = mutation({
  args: { organizationId: v.string(), eventId: v.id("calendarEvents"), input: calendarEventInputValidator },
  returns: calendarEventValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "calendar", "update");
    const { presented, now } = await updateEventCore(ctx, {
      organizationId: args.organizationId,
      eventId: args.eventId,
      input: args.input,
      actorUserId: user._id,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "calendar.update",
      target: args.eventId,
      summary: `Updated ${args.input.title}.`,
      createdAt: now,
    });
    return presented;
  },
});

export const deleteFromHono = mutation({
  args: { organizationId: v.string(), eventId: v.id("calendarEvents") },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "calendar", "delete");
    const { now, title } = await deleteEventCore(ctx, {
      organizationId: args.organizationId,
      eventId: args.eventId,
      actorUserId: user._id,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "calendar.delete",
      target: args.eventId,
      summary: `Deleted ${title}.`,
      createdAt: now,
    });
    return { removed: true };
  },
});

export const createInternal = internalMutation({
  args: { organizationId: v.string(), input: calendarEventInputValidator, actorUserId: v.string() },
  returns: calendarEventValidator,
  handler: async (ctx, args) => {
    const { presented } = await createEventCore(ctx, {
      organizationId: args.organizationId,
      input: args.input,
      actorUserId: args.actorUserId,
    });
    return presented;
  },
});

export const updateInternal = internalMutation({
  args: { organizationId: v.string(), eventId: v.id("calendarEvents"), input: calendarEventInputValidator, actorUserId: v.string() },
  returns: calendarEventValidator,
  handler: async (ctx, args) => {
    const { presented } = await updateEventCore(ctx, {
      organizationId: args.organizationId,
      eventId: args.eventId,
      input: args.input,
      actorUserId: args.actorUserId,
    });
    return presented;
  },
});

export const deleteInternal = internalMutation({
  args: { organizationId: v.string(), eventId: v.id("calendarEvents"), actorUserId: v.string() },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    await deleteEventCore(ctx, {
      organizationId: args.organizationId,
      eventId: args.eventId,
      actorUserId: args.actorUserId,
    });
    return { removed: true };
  },
});
