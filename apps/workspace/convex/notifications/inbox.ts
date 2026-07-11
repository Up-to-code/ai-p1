import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireServerActor } from "../access/actor";
import { hasOrganizationMembership } from "../permissions";
import { notificationEventValidator } from "./validators";

const primaryFilterValidator = v.union(
  v.literal("all"),
  v.literal("mentions"),
  v.literal("assigned"),
);

async function requireOrganizationMember(
  ctx: Parameters<typeof hasOrganizationMembership>[0],
  organizationId: string,
) {
  const actor = await requireServerActor(ctx);
  if (!(await hasOrganizationMembership(ctx, organizationId, actor.userId))) {
    throw new ConvexError({
      code: "ORGANIZATION_MEMBERSHIP_REQUIRED",
      message: "Organization membership is required.",
    });
  }
  return actor;
}

export const listPrimary = query({
  args: {
    organizationId: v.string(),
    filter: v.optional(primaryFilterValidator),
  },
  returns: v.array(notificationEventValidator),
  handler: async (ctx, args) => {
    const actor = await requireOrganizationMember(ctx, args.organizationId);
    const events = await ctx.db
      .query("notificationEvents")
      .withIndex("by_recipient_created", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("recipientUserId", actor.userId),
      )
      .order("desc")
      .take(100);

    if (args.filter === "mentions") {
      return events.filter((event) => event.kind === "mentioned");
    }
    if (args.filter === "assigned") {
      return events.filter((event) => event.kind === "task_assigned");
    }
    return events;
  },
});

export const markRead = mutation({
  args: {
    organizationId: v.string(),
    eventId: v.id("notificationEvents"),
  },
  returns: v.object({ updated: v.boolean() }),
  handler: async (ctx, args) => {
    const actor = await requireOrganizationMember(ctx, args.organizationId);
    const event = await ctx.db.get(args.eventId);
    if (
      !event ||
      event.organizationId !== args.organizationId ||
      event.recipientUserId !== actor.userId
    ) {
      throw new ConvexError({
        code: "NOTIFICATION_EVENT_NOT_FOUND",
        message: "Notification event was not found.",
      });
    }
    if (event.readAt) return { updated: false };
    await ctx.db.patch(event._id, { readAt: Date.now() });
    return { updated: true };
  },
});

export const markAllRead = mutation({
  args: { organizationId: v.string() },
  returns: v.object({ updated: v.number() }),
  handler: async (ctx, args) => {
    const actor = await requireOrganizationMember(ctx, args.organizationId);
    const unread = await ctx.db
      .query("notificationEvents")
      .withIndex("by_recipient_read", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("recipientUserId", actor.userId)
          .eq("readAt", undefined),
      )
      .take(200);
    const now = Date.now();
    await Promise.all(unread.map((event) => ctx.db.patch(event._id, { readAt: now })));
    return { updated: unread.length };
  },
});
