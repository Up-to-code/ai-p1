import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { query } from "../_generated/server";
import { findChannelByPublicId, resolveChannelAccess } from "../access/channel";
import {
  channelValidator,
  messageValidator,
  threadValidator,
} from "./validators";

const MAX_CHANNELS = 500;
const DEFAULT_MESSAGE_LIMIT = 50;
const MAX_MESSAGE_LIMIT = 200;
const MAX_THREAD_LOOKUP_ROWS = 5_000;
const MAX_THREAD_MESSAGES = 1_000;

const channelTypeArgValidator = v.union(
  v.literal("organization"),
  v.literal("project"),
  v.literal("space"),
  v.literal("client"),
  v.literal("dm"),
);

function boundedLimit(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value))
    return DEFAULT_MESSAGE_LIMIT;
  return Math.max(1, Math.min(Math.floor(value), MAX_MESSAGE_LIMIT));
}

function inboxError(
  code: string,
  message: string,
  details: Record<string, string> = {},
) {
  return new ConvexError({ code, message, ...details });
}

async function findThreadByPublicId(
  ctx: Parameters<typeof findChannelByPublicId>[0],
  threadId: string,
) {
  const threads = await ctx.db
    .query("threads")
    .take(MAX_THREAD_LOOKUP_ROWS + 1);
  if (threads.length > MAX_THREAD_LOOKUP_ROWS) {
    throw inboxError(
      "THREAD_LOOKUP_LIMIT_EXCEEDED",
      "The thread lookup exceeded its safety bound.",
      { threadId },
    );
  }
  const thread = threads.find((candidate) => candidate.id === threadId);
  if (!thread)
    throw inboxError("THREAD_NOT_FOUND", "Thread was not found.", { threadId });
  return thread;
}

export const listChannels = query({
  args: {
    organizationId: v.string(),
    type: v.optional(channelTypeArgValidator),
  },
  returns: v.array(channelValidator),
  handler: async (ctx, args) => {
    const access = await resolveChannelAccess(ctx, args.organizationId);
    const channels = args.type
      ? await ctx.db
          .query("channels")
          .withIndex("by_type", (q) =>
            q.eq("organizationId", args.organizationId).eq("type", args.type!),
          )
          .take(MAX_CHANNELS)
      : await ctx.db
          .query("channels")
          .withIndex("by_organization", (q) =>
            q.eq("organizationId", args.organizationId),
          )
          .take(MAX_CHANNELS);

    return access.filterReadable(channels);
  },
});

export const getChannel = query({
  args: { channelId: v.string() },
  returns: channelValidator,
  handler: async (ctx, args) => {
    const channel = await findChannelByPublicId(ctx, args.channelId);
    const access = await resolveChannelAccess(ctx, channel.organizationId);
    await access.assertCanRead(channel);
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
    const channel = await findChannelByPublicId(ctx, args.channelId);
    const access = await resolveChannelAccess(ctx, channel.organizationId);
    await access.assertCanRead(channel);

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel_state_created", (q) =>
        q.eq("channelId", channel.id).eq("recordState", "active"),
      )
      .order("desc")
      .take(boundedLimit(args.limit));
    return messages.reverse();
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
    const channel = await findChannelByPublicId(ctx, args.channelId);
    const access = await resolveChannelAccess(ctx, channel.organizationId);
    await access.assertCanRead(channel);

    return ctx.db
      .query("messages")
      .withIndex("by_channel_state_created", (q) =>
        q.eq("channelId", channel.id).eq("recordState", "active"),
      )
      .order("desc")
      .paginate({
        ...args.paginationOpts,
        numItems: Math.min(args.paginationOpts.numItems, MAX_MESSAGE_LIMIT),
      });
  },
});

export const getThread = query({
  args: { threadId: v.string() },
  returns: v.object({
    thread: threadValidator,
    messages: v.array(messageValidator),
  }),
  handler: async (ctx, args) => {
    const thread = await findThreadByPublicId(ctx, args.threadId);
    const channel = await findChannelByPublicId(ctx, thread.channelId);
    const access = await resolveChannelAccess(ctx, channel.organizationId);
    await access.assertCanRead(channel);

    if (thread.channelId !== channel.id) {
      throw inboxError(
        "THREAD_CHANNEL_MISMATCH",
        "Thread does not belong to this channel.",
        {
          threadId: args.threadId,
          channelId: channel.id,
        },
      );
    }
    const parentMessages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", channel.id))
      .take(MAX_THREAD_MESSAGES + 1);
    if (parentMessages.length > MAX_THREAD_MESSAGES) {
      throw inboxError(
        "THREAD_MESSAGE_LIMIT_EXCEEDED",
        "The channel is too large for a safe thread ownership check.",
        { threadId: args.threadId, channelId: channel.id },
      );
    }
    const parent = parentMessages.find(
      (message) =>
        message.id === thread.parentMessageId &&
        message.channelId === channel.id &&
        message.recordState === "active",
    );
    if (!parent) {
      throw inboxError(
        "THREAD_PARENT_MISMATCH",
        "Thread parent does not belong to this channel.",
        {
          threadId: args.threadId,
          channelId: channel.id,
        },
      );
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", thread.id))
      .order("asc")
      .take(MAX_THREAD_MESSAGES + 1);
    if (messages.length > MAX_THREAD_MESSAGES) {
      throw inboxError(
        "THREAD_MESSAGE_LIMIT_EXCEEDED",
        "The thread exceeded its read safety bound.",
        { threadId: args.threadId, channelId: channel.id },
      );
    }
    const visibleMessages = messages.filter(
      (message) =>
        message.channelId === channel.id && message.recordState === "active",
    );
    return {
      thread: {
        ...thread,
        messageCount: 1 + visibleMessages.length,
        participantIds: [
          ...new Set([
            parent.authorId,
            ...visibleMessages.map((message) => message.authorId),
          ]),
        ],
      },
      messages: visibleMessages,
    };
  },
});
