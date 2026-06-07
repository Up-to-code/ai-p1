import { v } from "convex/values";
import { query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { activeChronologicalWorkspaceRows, boundedWorkspaceReadLimit } from "../workspace/readSurface";
import { calendarStats } from "../workspace/readStats";
import { calendarEventValidator } from "./validators";

const MAX_LIST_EVENTS = 500;
const MAX_RANGE_EVENTS = 1_000;

function isoDate(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function isoTime(timestamp: number) {
  return new Date(timestamp).toISOString().slice(11, 16);
}

async function presentEvent(event: Doc<"calendarEvents">) {
  return {
    ...event,
    id: event._id,
    date: isoDate(event.startAt),
    time: isoTime(event.startAt),
  };
}

export const list = query({
  args: {
    organizationId: v.string(),
  },
  returns: v.array(calendarEventValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "calendar", "read");
    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_LIST_EVENTS);

    return Promise.all(
      activeChronologicalWorkspaceRows(events).map(presentEvent),
    );
  },
});

export const listRange = query({
  args: {
    organizationId: v.string(),
    startAt: v.number(),
    endAt: v.number(),
  },
  returns: v.array(calendarEventValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "calendar", "read");
    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_start", (q) => q.eq("organizationId", args.organizationId).gte("startAt", args.startAt).lte("startAt", args.endAt))
      .take(MAX_RANGE_EVENTS);

    return Promise.all(
      activeChronologicalWorkspaceRows(events).map(presentEvent),
    );
  },
});

export const listUpcoming = query({
  args: {
    organizationId: v.string(),
    startAt: v.number(),
    limit: v.optional(v.number()),
  },
  returns: v.array(calendarEventValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "calendar", "read");
    const limit = boundedWorkspaceReadLimit(args.limit, 50, 100);
    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_start", (q) => q.eq("organizationId", args.organizationId).gte("startAt", args.startAt))
      .take(limit);

    return Promise.all(
      activeChronologicalWorkspaceRows(events).map(presentEvent),
    );
  },
});

export const statsInRange = query({
  args: {
    organizationId: v.string(),
    startAt: v.number(),
    endAt: v.number(),
  },
  returns: v.object({
    total: v.number(),
    confirmed: v.number(),
    pending: v.number(),
    draft: v.number(),
    owners: v.number(),
  }),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "calendar", "read");
    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_start", (q) => q.eq("organizationId", args.organizationId).gte("startAt", args.startAt).lte("startAt", args.endAt))
      .take(MAX_RANGE_EVENTS);
    return calendarStats(events);
  },
});
