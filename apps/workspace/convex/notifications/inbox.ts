import { ConvexError, v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { requireServerActor } from "../access/actor";
import { hasOrganizationMembership } from "../permissions";
import { notificationEventValidator } from "./validators";

const primaryFilterValidator = v.union(
  v.literal("all"),
  v.literal("mentions"),
  v.literal("assigned"),
);

const attentionViewValidator = v.union(
  v.literal("primary"),
  v.literal("other"),
  v.literal("later"),
  v.literal("cleared"),
);

const replyStatusValidator = v.union(v.literal("unread"), v.literal("read"));
const eventTransitionValidator = v.union(
  v.literal("later"),
  v.literal("clear"),
  v.literal("restore"),
);

type NotificationEvent = Doc<"notificationEvents">;

async function requireOrganizationMember(
  ctx: QueryCtx | MutationCtx,
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

async function listRecipientEventsByDisposition(
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
  recipientUserId: string,
  disposition: "active" | "later" | "cleared" | undefined,
) {
  return ctx.db
    .query("notificationEvents")
    .withIndex("by_recipient_disposition_created", (q) =>
      q
        .eq("organizationId", organizationId)
        .eq("recipientUserId", recipientUserId)
        .eq("disposition", disposition),
    )
    .order("desc")
    .take(200);
}

async function listRecipientAttentionCandidates(
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
  recipientUserId: string,
  view: "primary" | "other" | "later" | "cleared",
) {
  if (view === "later" || view === "cleared") {
    return listRecipientEventsByDisposition(
      ctx,
      organizationId,
      recipientUserId,
      view,
    );
  }
  const [active, legacy] = await Promise.all([
    listRecipientEventsByDisposition(
      ctx,
      organizationId,
      recipientUserId,
      "active",
    ),
    listRecipientEventsByDisposition(
      ctx,
      organizationId,
      recipientUserId,
      undefined,
    ),
  ]);
  return [...active, ...legacy].sort((a, b) => b.createdAt - a.createdAt);
}

function isActive(event: Pick<NotificationEvent, "disposition">) {
  return event.disposition === undefined || event.disposition === "active";
}

function isAttentionEvent(event: Pick<NotificationEvent, "kind">) {
  return event.kind !== "thread_reply";
}

export function eventMatchesAttentionView(
  event: Pick<NotificationEvent, "kind" | "lane" | "disposition">,
  view: "primary" | "other" | "later" | "cleared",
) {
  if (!isAttentionEvent(event)) return false;
  if (view === "later") return event.disposition === "later";
  if (view === "cleared") return event.disposition === "cleared";
  if (!isActive(event)) return false;
  if (view === "other") return event.lane === "other";
  return event.lane === undefined || event.lane === "primary";
}

/** Authorized attention projection. Channel messages remain owned by Inbox collaboration reads. */
export const listAttention = query({
  args: {
    organizationId: v.string(),
    view: attentionViewValidator,
    filter: v.optional(primaryFilterValidator),
  },
  returns: v.array(notificationEventValidator),
  handler: async (ctx, args) => {
    const actor = await requireOrganizationMember(ctx, args.organizationId);
    const events = (await listRecipientAttentionCandidates(
      ctx,
      args.organizationId,
      actor.userId,
      args.view,
    )).filter((event) => eventMatchesAttentionView(event, args.view));

    if (args.filter === "mentions") {
      return events.filter((event) => event.kind === "mentioned").slice(0, 100);
    }
    if (args.filter === "assigned") {
      return events.filter((event) => event.kind === "task_assigned").slice(0, 100);
    }
    return events.slice(0, 100);
  },
});

/** Thread-reply attention derived from actual channel thread messages. */
export const listReplies = query({
  args: {
    organizationId: v.string(),
    status: replyStatusValidator,
  },
  returns: v.array(notificationEventValidator),
  handler: async (ctx, args) => {
    const actor = await requireOrganizationMember(ctx, args.organizationId);
    const events = await ctx.db
      .query("notificationEvents")
      .withIndex("by_recipient_kind_created", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("recipientUserId", actor.userId)
          .eq("kind", "thread_reply"),
      )
      .order("desc")
      .take(200);
    return events
      .filter((event) =>
        args.status === "read" ? event.readAt !== undefined : event.readAt === undefined,
      )
      .slice(0, 100);
  },
});

export const transitionEvent = mutation({
  args: {
    organizationId: v.string(),
    eventId: v.id("notificationEvents"),
    transition: eventTransitionValidator,
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

    const now = Date.now();
    if (args.transition === "later") {
      await ctx.db.patch(event._id, {
        disposition: "later",
        deferredAt: now,
        clearedAt: undefined,
      });
    } else if (args.transition === "clear") {
      await ctx.db.patch(event._id, {
        disposition: "cleared",
        clearedAt: now,
        deferredAt: undefined,
        readAt: event.readAt ?? now,
      });
    } else {
      await ctx.db.patch(event._id, {
        disposition: "active",
        deferredAt: undefined,
        clearedAt: undefined,
      });
    }
    return { updated: true };
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
  args: {
    organizationId: v.string(),
    surface: v.optional(v.union(v.literal("attention"), v.literal("replies"))),
    view: v.optional(attentionViewValidator),
  },
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
    const matching = unread.filter((event) =>
      args.surface === "replies"
        ? event.kind === "thread_reply"
        : eventMatchesAttentionView(event, args.view ?? "primary"),
    );
    const now = Date.now();
    await Promise.all(matching.map((event) => ctx.db.patch(event._id, { readAt: now })));
    return { updated: matching.length };
  },
});
