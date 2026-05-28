import { v } from "convex/values";
import { query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
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

async function presentEvent(ctx: QueryCtx, event: Doc<"calendarEvents">) {
  const client = event.clientId ? await ctx.db.get(event.clientId) : null;
  const unit = event.propertyId ? await ctx.db.get(event.propertyId) : null;
  return {
    ...event,
    id: event._id,
    date: isoDate(event.startAt),
    time: isoTime(event.startAt),
    unitId: event.propertyId,
    clientName: client && !client.deletedAt ? client.name : undefined,
    unitTitle: unit && !unit.deletedAt ? unit.title : undefined,
  };
}

export const list = query({
  args: {
    organizationId: v.string(),
    clientId: v.optional(v.id("clients")),
  },
  returns: v.array(calendarEventValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "calendar", "read");
    const events = args.clientId
      ? await ctx.db
          .query("calendarEvents")
          .withIndex("by_client", (q) => q.eq("organizationId", args.organizationId).eq("clientId", args.clientId!))
          .take(MAX_LIST_EVENTS)
      : await ctx.db
          .query("calendarEvents")
          .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
          .take(MAX_LIST_EVENTS);

    return Promise.all(
      activeChronologicalWorkspaceRows(events).map((event) => presentEvent(ctx, event)),
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
      activeChronologicalWorkspaceRows(events).map((event) => presentEvent(ctx, event)),
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
      activeChronologicalWorkspaceRows(events).map((event) => presentEvent(ctx, event)),
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
