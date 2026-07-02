import { v } from "convex/values";
import { query } from "../_generated/server";
import { channelValidator, messageValidator, threadValidator } from "./validators";

export const listChannels = query({
  args: {
    organizationId: v.string(),
    type: v.optional(v.union(v.literal("organization"), v.literal("project"), v.literal("client"), v.literal("dm"))),
  },
  returns: v.array(channelValidator),
  handler: async (ctx, args) => {
    const { organizationId, type } = args;
    
    let channels;
    if (type) {
      channels = await ctx.db
        .query("channels")
        .withIndex("by_type", (q) => q.eq("organizationId", organizationId).eq("type", type))
        .collect();
    } else {
      channels = await ctx.db
        .query("channels")
        .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
        .collect();
    }
    
    return channels.map((channel) => ({
      ...channel,
      unreadCount: channel.unreadCount ?? 0,
      lastMessageAt: channel.lastMessageAt ?? 0,
    }));
  },
});

export const getChannel = query({
  args: {
    channelId: v.string(),
  },
  returns: channelValidator,
  handler: async (ctx, args) => {
    const channels = await ctx.db
      .query("channels")
      .withIndex("by_organization", (q) => q.eq("organizationId", ""))
      .collect();
    
    const channel = channels.find((c) => c.id === args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
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
    
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel_created", (q) => q.eq("channelId", channelId))
      .order("desc")
      .take(limit);
    
    return messages.filter((msg) => !msg.isDeleted);
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
    const threads = await ctx.db
      .query("threads")
      .collect();
    
    const thread = threads.find((t) => t.id === args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }
    
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();
    
    return {
      thread,
      messages: messages.filter((msg) => !msg.isDeleted),
    };
  },
});
