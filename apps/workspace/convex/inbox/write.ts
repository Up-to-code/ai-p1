import { ConvexError, v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { mutation, type MutationCtx } from "../_generated/server";
import { findChannelByPublicId, resolveChannelAccess } from "../access/channel";
import {
  channelInputValidator,
  channelValidator,
  messageInputValidator,
  messageValidator,
  threadValidator,
} from "./validators";

const MAX_CHANNEL_MESSAGES = 5_000;
const MAX_CHANNEL_THREADS = 2_000;
const MAX_THREAD_LOOKUP_ROWS = 5_000;

type ChannelInput = {
  name: string;
  type: "organization" | "project" | "space" | "client" | "dm";
  visibility: "public" | "private" | "dm";
  description?: string;
  projectId?: string;
  projectIds?: string[];
  spaceId?: string;
  clientId?: string;
  parentChannelId?: string;
  memberIds?: string[];
  dmUserId?: string;
};

type MessageInput = {
  content: string;
  clientMessageId?: string;
  threadId?: string;
  replyToId?: string;
  mentions?: Doc<"messages">["mentions"];
  attachments?: Doc<"messages">["attachments"];
};

function inboxError(
  code: string,
  message: string,
  details: Record<string, string> = {},
) {
  return new ConvexError({ code, message, ...details });
}

function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function persistedChannelInput(input: ChannelInput) {
  return {
    name: input.name,
    type: input.type,
    visibility: input.type === "dm" ? ("dm" as const) : input.visibility,
    description: input.description,
    projectId: input.projectId,
    projectIds: input.projectIds,
    spaceId: input.spaceId,
    clientId: input.clientId,
  };
}

function normalizedMemberIds(input: ChannelInput, actorUserId: string) {
  return [
    ...new Set([
      actorUserId,
      ...(input.memberIds ?? []),
      ...(input.dmUserId ? [input.dmUserId] : []),
    ]),
  ];
}

async function findMessageInChannel(
  ctx: MutationCtx,
  channelId: string,
  messageId: string,
  requireActive = true,
) {
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_channel", (q) => q.eq("channelId", channelId))
    .take(MAX_CHANNEL_MESSAGES + 1);
  if (messages.length > MAX_CHANNEL_MESSAGES) {
    throw inboxError(
      "CHANNEL_MESSAGE_LIMIT_EXCEEDED",
      "The channel is too large for a safe message ownership check.",
      { channelId, messageId },
    );
  }
  const message = messages.find(
    (candidate) =>
      candidate.id === messageId &&
      candidate.channelId === channelId &&
      (!requireActive || candidate.recordState === "active"),
  );
  if (!message) {
    throw inboxError(
      "MESSAGE_NOT_FOUND",
      "Message was not found in this channel.",
      {
        channelId,
        messageId,
      },
    );
  }
  return message;
}

async function findThreadInChannel(
  ctx: MutationCtx,
  channelId: string,
  threadId: string,
) {
  const threads = await ctx.db
    .query("threads")
    .take(MAX_THREAD_LOOKUP_ROWS + 1);
  if (threads.length > MAX_THREAD_LOOKUP_ROWS) {
    throw inboxError(
      "THREAD_LOOKUP_LIMIT_EXCEEDED",
      "The thread lookup exceeded its safety bound.",
      { channelId, threadId },
    );
  }
  const thread = threads.find(
    (candidate) =>
      candidate.id === threadId && candidate.channelId === channelId,
  );
  if (!thread) {
    throw inboxError(
      "THREAD_NOT_FOUND",
      "Thread was not found in this channel.",
      {
        channelId,
        threadId,
      },
    );
  }
  await findMessageInChannel(ctx, channelId, thread.parentMessageId);
  return thread;
}

async function validateMessageRelations(
  ctx: MutationCtx,
  channelId: string,
  input: MessageInput,
) {
  const thread = input.threadId
    ? await findThreadInChannel(ctx, channelId, input.threadId)
    : null;
  const reply = input.replyToId
    ? await findMessageInChannel(ctx, channelId, input.replyToId)
    : null;
  if (
    thread &&
    reply &&
    reply.id !== thread.parentMessageId &&
    reply.threadId !== thread.id
  ) {
    throw inboxError(
      "REPLY_THREAD_MISMATCH",
      "The reply target does not belong to the requested thread.",
      { channelId, threadId: thread.id, messageId: reply.id },
    );
  }
  return thread;
}

async function enqueueChannelWebhook(
  ctx: MutationCtx,
  organizationId: string,
  eventType: string,
  target: string,
  payload: unknown,
  timestamp: number,
) {
  await ctx.scheduler.runAfter(
    0,
    internal.partnerApps.webhooks.enqueueOutbound,
    {
      organizationId,
      eventId: `${eventType}:${target}:${timestamp}`,
      eventType,
      payload,
    },
  );
}

async function createMessage(
  ctx: MutationCtx,
  channel: Doc<"channels">,
  input: MessageInput,
  authorId: string,
) {
  const thread = await validateMessageRelations(ctx, channel.id, input);
  const now = Date.now();
  const id = generateId();
  const dbId = await ctx.db.insert("messages", {
    id,
    channelId: channel.id,
    ...input,
    authorId,
    createdAt: now,
    updatedAt: now,
    recordState: "active",
  });
  await ctx.db.patch(channel._id, { lastMessageAt: now, updatedAt: now });

  if (thread) {
    await ctx.db.patch(thread._id, {
      messageCount: thread.messageCount + 1,
      participantIds: [...new Set([...thread.participantIds, authorId])],
      updatedAt: now,
    });
  }
  const message = await ctx.db.get(dbId);
  if (!message)
    throw inboxError("MESSAGE_CREATE_FAILED", "Message could not be created.");
  return message;
}

async function requireChannelAccess(
  ctx: MutationCtx,
  organizationId: string,
  channelId: string,
  action: "read" | "post" | "update" | "delete",
) {
  const channel = await findChannelByPublicId(ctx, channelId, organizationId);
  const access = await resolveChannelAccess(ctx, organizationId);
  if (action === "read") await access.assertCanRead(channel);
  if (action === "post") await access.assertCanPost(channel);
  if (action === "update") await access.assertCanUpdate(channel);
  if (action === "delete") await access.assertCanDelete(channel);
  return { channel, access };
}

export const createChannel = mutation({
  args: { organizationId: v.string(), input: channelInputValidator },
  returns: channelValidator,
  handler: async (ctx, args) => {
    const access = await resolveChannelAccess(ctx, args.organizationId);
    await access.assertCanCreate(args.input);
    const now = Date.now();
    const id = generateId();
    const dbId = await ctx.db.insert("channels", {
      id,
      organizationId: args.organizationId,
      ...persistedChannelInput(args.input),
      memberIds: normalizedMemberIds(args.input, access.actor.userId),
      createdBy: access.actor.userId,
      createdAt: now,
      updatedAt: now,
      unreadCount: 0,
    });
    const channel = await ctx.db.get(dbId);
    if (!channel)
      throw inboxError(
        "CHANNEL_CREATE_FAILED",
        "Channel could not be created.",
      );
    await enqueueChannelWebhook(
      ctx,
      args.organizationId,
      "channel.created",
      id,
      channel,
      now,
    );
    return channel;
  },
});

export const updateChannel = mutation({
  args: {
    organizationId: v.string(),
    channelId: v.string(),
    input: channelInputValidator,
  },
  returns: channelValidator,
  handler: async (ctx, args) => {
    const { channel, access } = await requireChannelAccess(
      ctx,
      args.organizationId,
      args.channelId,
      "update",
    );
    const memberIds = normalizedMemberIds(
      {
        ...args.input,
        memberIds: args.input.memberIds ?? channel.memberIds,
      },
      access.actor.userId,
    );
    await access.assertCanUseScope({ ...args.input, memberIds });
    const now = Date.now();
    await ctx.db.patch(channel._id, {
      ...persistedChannelInput(args.input),
      memberIds,
      updatedAt: now,
    });
    const updated = await ctx.db.get(channel._id);
    if (!updated)
      throw inboxError(
        "CHANNEL_UPDATE_FAILED",
        "Channel could not be updated.",
      );
    await enqueueChannelWebhook(
      ctx,
      args.organizationId,
      "channel.updated",
      channel.id,
      updated,
      now,
    );
    return updated;
  },
});

export const deleteChannel = mutation({
  args: { organizationId: v.string(), channelId: v.string() },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const { channel } = await requireChannelAccess(
      ctx,
      args.organizationId,
      args.channelId,
      "delete",
    );
    const [messages, threads] = await Promise.all([
      ctx.db
        .query("messages")
        .withIndex("by_channel", (q) => q.eq("channelId", channel.id))
        .take(MAX_CHANNEL_MESSAGES + 1),
      ctx.db
        .query("threads")
        .withIndex("by_channel", (q) => q.eq("channelId", channel.id))
        .take(MAX_CHANNEL_THREADS + 1),
    ]);
    if (
      messages.length > MAX_CHANNEL_MESSAGES ||
      threads.length > MAX_CHANNEL_THREADS
    ) {
      throw inboxError(
        "CHANNEL_DELETE_LIMIT_EXCEEDED",
        "The channel is too large to delete atomically within the safety bound.",
        { channelId: channel.id },
      );
    }
    for (const message of messages) await ctx.db.delete(message._id);
    for (const thread of threads) await ctx.db.delete(thread._id);
    await ctx.db.delete(channel._id);
    const now = Date.now();
    await enqueueChannelWebhook(
      ctx,
      args.organizationId,
      "channel.deleted",
      channel.id,
      { id: channel.id },
      now,
    );
    return { removed: true };
  },
});

export const sendMessage = mutation({
  args: {
    organizationId: v.string(),
    channelId: v.string(),
    input: messageInputValidator,
  },
  returns: messageValidator,
  handler: async (ctx, args) => {
    const { channel, access } = await requireChannelAccess(
      ctx,
      args.organizationId,
      args.channelId,
      "post",
    );
    return createMessage(ctx, channel, args.input, access.actor.userId);
  },
});

export const updateMessage = mutation({
  args: {
    organizationId: v.string(),
    channelId: v.string(),
    messageId: v.string(),
    content: v.string(),
  },
  returns: messageValidator,
  handler: async (ctx, args) => {
    const { channel, access } = await requireChannelAccess(
      ctx,
      args.organizationId,
      args.channelId,
      "post",
    );
    const message = await findMessageInChannel(ctx, channel.id, args.messageId);
    if (message.authorId !== access.actor.userId) {
      throw inboxError(
        "MESSAGE_AUTHOR_REQUIRED",
        "Only the author can edit this message.",
        {
          channelId: channel.id,
          messageId: message.id,
        },
      );
    }
    const now = Date.now();
    await ctx.db.patch(message._id, {
      content: args.content,
      editedAt: now,
      updatedAt: now,
    });
    const updated = await ctx.db.get(message._id);
    if (!updated)
      throw inboxError(
        "MESSAGE_UPDATE_FAILED",
        "Message could not be updated.",
      );
    return updated;
  },
});

export const deleteMessage = mutation({
  args: {
    organizationId: v.string(),
    channelId: v.string(),
    messageId: v.string(),
  },
  returns: v.object({ deleted: v.boolean() }),
  handler: async (ctx, args) => {
    const { channel, access } = await requireChannelAccess(
      ctx,
      args.organizationId,
      args.channelId,
      "post",
    );
    const message = await findMessageInChannel(ctx, channel.id, args.messageId);
    if (message.authorId !== access.actor.userId) {
      throw inboxError(
        "MESSAGE_AUTHOR_REQUIRED",
        "Only the author can delete this message.",
        {
          channelId: channel.id,
          messageId: message.id,
        },
      );
    }
    const now = Date.now();
    await ctx.db.patch(message._id, { recordState: "deleted", updatedAt: now });
    if (channel.pinnedMessageId === message.id) {
      await ctx.db.patch(channel._id, {
        pinnedMessageId: undefined,
        pinnedBy: undefined,
        pinnedAt: undefined,
        updatedAt: now,
      });
    }
    return { deleted: true };
  },
});

async function updateReaction(
  ctx: MutationCtx,
  args: {
    organizationId: string;
    channelId: string;
    messageId: string;
    emoji: string;
  },
  remove: boolean,
) {
  const { channel, access } = await requireChannelAccess(
    ctx,
    args.organizationId,
    args.channelId,
    "post",
  );
  const message = await findMessageInChannel(ctx, channel.id, args.messageId);
  const reactions = message.reactions ?? [];
  const existing = reactions.find((reaction) => reaction.emoji === args.emoji);
  const next = remove
    ? reactions
        .map((reaction) =>
          reaction.emoji === args.emoji
            ? {
                ...reaction,
                userIds: reaction.userIds.filter(
                  (userId) => userId !== access.actor.userId,
                ),
              }
            : reaction,
        )
        .filter((reaction) => reaction.userIds.length > 0)
    : existing
      ? reactions.map((reaction) =>
          reaction.emoji === args.emoji
            ? {
                ...reaction,
                userIds: [
                  ...new Set([...reaction.userIds, access.actor.userId]),
                ],
              }
            : reaction,
        )
      : [...reactions, { emoji: args.emoji, userIds: [access.actor.userId] }];
  await ctx.db.patch(message._id, { reactions: next, updatedAt: Date.now() });
  return ctx.db.get(message._id);
}

const reactionArgs = {
  organizationId: v.string(),
  channelId: v.string(),
  messageId: v.string(),
  emoji: v.string(),
};

export const addReaction = mutation({
  args: reactionArgs,
  returns: v.union(messageValidator, v.null()),
  handler: (ctx, args) => updateReaction(ctx, args, false),
});

export const removeReaction = mutation({
  args: reactionArgs,
  returns: v.union(messageValidator, v.null()),
  handler: (ctx, args) => updateReaction(ctx, args, true),
});

export const pinMessage = mutation({
  args: {
    organizationId: v.string(),
    channelId: v.string(),
    messageId: v.string(),
  },
  returns: channelValidator,
  handler: async (ctx, args) => {
    const { channel, access } = await requireChannelAccess(
      ctx,
      args.organizationId,
      args.channelId,
      "update",
    );
    const message = await findMessageInChannel(ctx, channel.id, args.messageId);
    const now = Date.now();
    await ctx.db.patch(channel._id, {
      pinnedMessageId: message.id,
      pinnedBy: access.actor.userId,
      pinnedAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(message._id, {
      pinnedBy: access.actor.userId,
      pinnedAt: now,
      updatedAt: now,
    });
    const updated = await ctx.db.get(channel._id);
    if (!updated)
      throw inboxError(
        "CHANNEL_UPDATE_FAILED",
        "Channel could not be updated.",
      );
    return updated;
  },
});

export const unpinMessage = mutation({
  args: { organizationId: v.string(), channelId: v.string() },
  returns: channelValidator,
  handler: async (ctx, args) => {
    const { channel } = await requireChannelAccess(
      ctx,
      args.organizationId,
      args.channelId,
      "update",
    );
    const pinned = channel.pinnedMessageId
      ? await findMessageInChannel(
          ctx,
          channel.id,
          channel.pinnedMessageId,
          false,
        )
      : null;
    const now = Date.now();
    await ctx.db.patch(channel._id, {
      pinnedMessageId: undefined,
      pinnedBy: undefined,
      pinnedAt: undefined,
      updatedAt: now,
    });
    if (pinned) {
      await ctx.db.patch(pinned._id, {
        pinnedBy: undefined,
        pinnedAt: undefined,
        updatedAt: now,
      });
    }
    const updated = await ctx.db.get(channel._id);
    if (!updated)
      throw inboxError(
        "CHANNEL_UPDATE_FAILED",
        "Channel could not be updated.",
      );
    return updated;
  },
});

export const createThread = mutation({
  args: {
    organizationId: v.string(),
    channelId: v.string(),
    parentMessageId: v.string(),
  },
  returns: threadValidator,
  handler: async (ctx, args) => {
    const { channel, access } = await requireChannelAccess(
      ctx,
      args.organizationId,
      args.channelId,
      "post",
    );
    const parent = await findMessageInChannel(
      ctx,
      channel.id,
      args.parentMessageId,
    );
    const existing = await ctx.db
      .query("threads")
      .withIndex("by_parent", (q) => q.eq("parentMessageId", parent.id))
      .take(2);
    if (existing.some((thread) => thread.channelId === channel.id)) {
      throw inboxError(
        "THREAD_ALREADY_EXISTS",
        "A thread already exists for this message.",
        {
          channelId: channel.id,
          messageId: parent.id,
        },
      );
    }
    const now = Date.now();
    const id = generateId();
    const threadId = await ctx.db.insert("threads", {
      id,
      channelId: channel.id,
      parentMessageId: parent.id,
      messageCount: 1,
      participantIds: [access.actor.userId],
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(parent._id, { threadId: id, updatedAt: now });
    const thread = await ctx.db.get(threadId);
    if (!thread)
      throw inboxError("THREAD_CREATE_FAILED", "Thread could not be created.");
    return thread;
  },
});
