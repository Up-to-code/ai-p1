import { v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";
import { getAuthUser } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
} from "./lifecycle";
import {
  calendarEventInputValidator,
  calendarEventPatchValidator,
  calendarEventValidator,
} from "./validators";

export const createFromHono = mutation({
  args: { organizationId: v.string(), input: calendarEventInputValidator },
  returns: calendarEventValidator,
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "calendar", "create");
    return createCalendarEvent(ctx, { ...args, actorUserId: user._id });
  },
});

export const updateFromHono = mutation({
  args: {
    organizationId: v.string(),
    eventId: v.id("calendarEvents"),
    input: calendarEventPatchValidator,
  },
  returns: calendarEventValidator,
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "calendar", "update");
    return updateCalendarEvent(ctx, { ...args, actorUserId: user._id });
  },
});

export const deleteFromHono = mutation({
  args: { organizationId: v.string(), eventId: v.id("calendarEvents") },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "calendar", "delete");
    return deleteCalendarEvent(ctx, { ...args, actorUserId: user._id });
  },
});

export const createInternal = internalMutation({
  args: {
    organizationId: v.string(),
    input: calendarEventInputValidator,
    actorUserId: v.string(),
  },
  returns: calendarEventValidator,
  handler: createCalendarEvent,
});

export const updateInternal = internalMutation({
  args: {
    organizationId: v.string(),
    eventId: v.id("calendarEvents"),
    input: calendarEventPatchValidator,
    actorUserId: v.string(),
  },
  returns: calendarEventValidator,
  handler: updateCalendarEvent,
});

export const deleteInternal = internalMutation({
  args: {
    organizationId: v.string(),
    eventId: v.id("calendarEvents"),
    actorUserId: v.string(),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: deleteCalendarEvent,
});
