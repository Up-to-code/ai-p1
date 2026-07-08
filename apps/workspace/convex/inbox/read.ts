import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query } from "../_generated/server";
import {
  channelValidator,
  messageValidator,
  threadValidator,
} from "./validators";
import { authUser } from "../auth";
import { assertPermission, checkPermission, permissions } from "../permissions";

const channelTypeArgValidator = v.union(
  v.literal("organization"),
  v.literal("project"),
  v.literal("space"),
  v.literal("client"),
  v.literal("dm"),
);

export const listChannels = query({
  args: {
    organizationId: v.string(),
    type: v.optional(channelTypeArgValidator),
  },
  returns: v.array(channelValidator),
  handler: async (ctx, args) => {
    const { organizationId, type } = args;
    const user = await authUser.safeGetAuthUser(ctx);
    if (!user) return [];

    let channels;
    if (type) {
      channels = await ctx.db
        .query("channels")
        .withIndex("by_type", (q) =>
          q.eq("organizationId", organizationId).eq("type", type),
        )
        .collect();
    } else {
      channels = await ctx.db
        .query("channels")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", organizationId),
        )
        .collect();
    }

    const visibleChannels = [];
    for (const channel of channels) {
      const permission = await checkPermission(ctx, {
        organizationId,
        userId: user._id,
        resource: permissions.resources.channel,
        action: permissions.actions.read,
        record: channel,
      });
      if (!permission.allowed) continue;
      visibleChannels.push({
        ...channel,
        unreadCount: channel.unreadCount ?? 0,
        lastMessageAt: channel.lastMessageAt ?? 0,
      });
    }

    return visibleChannels;
  },
});

export const getChannel = query({
  args: {
    channelId: v.string(),
  },
  returns: channelValidator,
  handler: async (ctx, args) => {
    const channels = await ctx.db.query("channels").collect();

    const channel = channels.find((c) => c.id === args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    const user = await authUser.getAuthUser(ctx);
    await assertPermission(ctx, {
      organizationId: channel.organizationId,
      userId: user._id,
      resource: permissions.resources.channel,
      action: permissions.actions.read,
      record: channel,
    });
    return channel;
  },
});

export const listMessages = query({
  args: {
    channelId: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(messageValidator),
  handler: async (ctx, args) => {
    const { channelId, limit = 50 } = args;

    const channels = await ctx.db.query("channels").collect();
    const channel = channels.find((candidate) => candidate.id === channelId);
    if (!channel) throw new Error("Channel not found");
    const user = await authUser.getAuthUser(ctx);
    await assertPermission(ctx, {
      organizationId: channel.organizationId,
      userId: user._id,
      resource: permissions.resources.channel,
      action: permissions.actions.read,
      record: channel,
    });

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel_created", (q) => q.eq("channelId", channelId))
      .order("desc")
      .take(limit);

    return messages.filter((msg) => msg.recordState === "active").reverse();
  },
});

export const listMessagesPage = query({
  args: {
    channelId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(messageValidator),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
    splitCursor: v.optional(v.union(v.string(), v.null())),
    pageStatus: v.optional(v.any()),
  }),
  handler: async (ctx, args) => {
    const channels = await ctx.db.query("channels").collect();
    const channel = channels.find(
      (candidate) => candidate.id === args.channelId,
    );
    if (!channel) throw new Error("Channel not found");

    const user = await authUser.getAuthUser(ctx);
    await assertPermission(ctx, {
      organizationId: channel.organizationId,
      userId: user._id,
      resource: permissions.resources.channel,
      action: permissions.actions.read,
      record: channel,
    });

    return ctx.db
      .query("messages")
      .withIndex("by_channel_state_created", (q) =>
        q.eq("channelId", args.channelId).eq("recordState", "active"),
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getThread = query({
  args: {
    threadId: v.string(),
  },
  returns: v.object({
    thread: threadValidator,
    messages: v.array(messageValidator),
  }),
  handler: async (ctx, args) => {
    const threads = await ctx.db.query("threads").collect();

    const thread = threads.find((t) => t.id === args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }

    const channels = await ctx.db.query("channels").collect();
    const channel = channels.find(
      (candidate) => candidate.id === thread.channelId,
    );
    if (!channel) throw new Error("Channel not found");
    const user = await authUser.getAuthUser(ctx);
    await assertPermission(ctx, {
      organizationId: channel.organizationId,
      userId: user._id,
      resource: permissions.resources.channel,
      action: permissions.actions.read,
      record: channel,
    });

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();

    return {
      thread,
      messages: messages.filter((msg) => msg.recordState === "active"),
    };
  },
});
