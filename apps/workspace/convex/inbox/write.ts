import { v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { clerkAuthComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { channelInputValidator, channelValidator, messageInputValidator, messageValidator, threadValidator } from "./validators";

// Type definitions based on validators
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
  threadId?: string;
  replyToId?: string;
  mentions?: { type: string; id: string; name: string }[];
};

// Helper function to get or create ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function assertChannel(ctx: MutationCtx, organizationId: string, channelId: string) {
  const channels = await ctx.db
    .query("channels")
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
    .collect();
  const channel = channels.find((c) => c.id === channelId);
  if (!channel) {
    throw new Error("Channel not found");
  }
  return channel;
}

async function assertChannelMembership(ctx: MutationCtx, channelId: string, userId: string) {
  const channels = await ctx.db
    .query("channels")
    .collect();
  const channel = channels.find((c) => c.id === channelId);
  if (!channel) {
    throw new Error("Channel not found");
  }
  
  // Check if user is a member or has access
  const isMember = channel.memberIds.includes(userId);
  const isPublic = channel.visibility === "public";
  const isOwner = channel.createdBy === userId;
  
  if (!isMember && !isPublic && !isOwner) {
    throw new Error("Access denied to channel");
  }
  
  return channel;
}

async function enqueueChannelWebhook(
  ctx: MutationCtx,
  organizationId: string,
  eventType: string,
  target: string,
  payload: unknown,
  timestamp: number,
) {
  await ctx.scheduler.runAfter(0, internal.partnerApps.webhooks.enqueueOutbound, {
    organizationId,
    eventId: `${eventType}:${target}:${timestamp}`,
    eventType,
    payload,
  });
}

async function createChannelCore(ctx: MutationCtx, args: { organizationId: string; input: ChannelInput; actorUserId: string }) {
  const now = Date.now();
  const id = generateId();
  const dbId = await ctx.db.insert("channels", {
    id,
    organizationId: args.organizationId,
    ...args.input,
    memberIds: [args.actorUserId, ...(args.input.memberIds || [])],
    createdBy: args.actorUserId,
    createdAt: now,
    updatedAt: now,
    unreadCount: 0,
  });

  const channel = await ctx.db.get(dbId);
  if (!channel) throw new Error("Channel could not be created.");

  await enqueueChannelWebhook(ctx, args.organizationId, "channel.created", id, channel, now);
  return { id, channel, now };
}

async function updateChannelCore(ctx: MutationCtx, args: { organizationId: string; channelId: string; input: ChannelInput; actorUserId: string }) {
  const existing = await assertChannel(ctx, args.organizationId, args.channelId);
  const now = Date.now();
  
  await ctx.db.patch(existing._id, {
    ...args.input,
    updatedAt: now,
  });

  const channel = await ctx.db.get(existing._id);
  if (!channel) throw new Error("Channel could not be updated.");
  
  await enqueueChannelWebhook(ctx, args.organizationId, "channel.updated", args.channelId, channel, now);
  return { channel, now };
}

async function deleteChannelCore(ctx: MutationCtx, args: { organizationId: string; channelId: string; actorUserId: string }) {
  const existing = await assertChannel(ctx, args.organizationId, args.channelId);
  const now = Date.now();
  
  // Delete all messages in the channel
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
    .collect();
  
  for (const message of messages) {
    await ctx.db.delete(message._id);
  }
  
  await ctx.db.delete(existing._id);
  await enqueueChannelWebhook(ctx, args.organizationId, "channel.deleted", args.channelId, { id: args.channelId }, now);
  return { removed: true as const, now };
}

async function createMessageCore(ctx: MutationCtx, args: { channelId: string; input: MessageInput; authorId: string }) {
  const now = Date.now();
  const id = generateId();
  const dbId = await ctx.db.insert("messages", {
    id,
    channelId: args.channelId,
    ...args.input,
    authorId: args.authorId,
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
  });

  const message = await ctx.db.get(dbId);
  if (!message) throw new Error("Message could not be created.");
  
  // Update channel's lastMessageAt - need to find channel by its id field
  const channels = await ctx.db
    .query("channels")
    .collect();
  
  const channel = channels.find((c) => c.id === args.channelId);
  
  if (channel) {
    await ctx.db.patch(channel._id, {
      lastMessageAt: now,
      updatedAt: now,
    });
  }
  
  return { id, message, now };
}

async function updateMessageCore(ctx: MutationCtx, args: { channelId: string; messageId: string; content: string; authorId: string }) {
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
    .collect();
  const message = messages.find((m) => m.id === args.messageId);
  if (!message) {
    throw new Error("Message not found");
  }
  
  if (message.authorId !== args.authorId) {
    throw new Error("Can only edit your own messages");
  }
  
  const now = Date.now();
  await ctx.db.patch(message._id, {
    content: args.content,
    editedAt: now,
    updatedAt: now,
  });

  const updated = await ctx.db.get(message._id);
  if (!updated) throw new Error("Message could not be updated.");
  
  return { message: updated, now };
}

async function deleteMessageCore(ctx: MutationCtx, args: { channelId: string; messageId: string; authorId: string }) {
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
    .collect();
  const message = messages.find((m) => m.id === args.messageId);
  if (!message) {
    throw new Error("Message not found");
  }
  
  if (message.authorId !== args.authorId) {
    throw new Error("Can only delete your own messages");
  }
  
  const now = Date.now();
  await ctx.db.patch(message._id, {
    isDeleted: true,
    updatedAt: now,
  });
  
  return { deleted: true as const, now };
}

async function addReactionCore(ctx: MutationCtx, args: { messageId: string; emoji: string; userId: string }) {
  const messages = await ctx.db
    .query("messages")
    .collect();
  const message = messages.find((m) => m.id === args.messageId);
  if (!message) {
    throw new Error("Message not found");
  }
  
  const reactions = message.reactions || [];
  const existingReaction = reactions.find((r: { emoji: string; userIds: string[] }) => r.emoji === args.emoji);
  
  let updatedReactions;
  if (existingReaction) {
    if (!existingReaction.userIds.includes(args.userId)) {
      updatedReactions = reactions.map((r: { emoji: string; userIds: string[] }) =>
        r.emoji === args.emoji
          ? { ...r, userIds: [...r.userIds, args.userId] }
          : r
      );
    } else {
      updatedReactions = reactions; // Already reacted
    }
  } else {
    updatedReactions = [...reactions, { emoji: args.emoji, userIds: [args.userId] }];
  }
  
  await ctx.db.patch(message._id, {
    reactions: updatedReactions,
  });
  
  const updated = await ctx.db.get(message._id);
  return { message: updated };
}

async function removeReactionCore(ctx: MutationCtx, args: { messageId: string; emoji: string; userId: string }) {
  const messages = await ctx.db
    .query("messages")
    .collect();
  const message = messages.find((m) => m.id === args.messageId);
  if (!message) {
    throw new Error("Message not found");
  }
  
  const reactions = message.reactions || [];
  const updatedReactions = reactions
    .map((r: { emoji: string; userIds: string[] }) =>
      r.emoji === args.emoji
        ? { ...r, userIds: r.userIds.filter((id: string) => id !== args.userId) }
        : r
    )
    .filter((r: { userIds: string[] }) => r.userIds.length > 0);
  
  await ctx.db.patch(message._id, {
    reactions: updatedReactions,
  });
  
  const updated = await ctx.db.get(message._id);
  return { message: updated };
}

async function createThreadCore(ctx: MutationCtx, args: { channelId: string; parentMessageId: string; participantIds: string[] }) {
  const now = Date.now();
  const id = generateId();
  const dbId = await ctx.db.insert("threads", {
    id,
    channelId: args.channelId,
    parentMessageId: args.parentMessageId,
    messageCount: 1,
    participantIds: args.participantIds,
    createdAt: now,
    updatedAt: now,
  });

  const thread = await ctx.db.get(dbId);
  if (!thread) throw new Error("Thread could not be created.");
  
  // Update the parent message to have the threadId
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
    .collect();
  
  const message = messages.find((m) => m.id === args.parentMessageId);
  
  if (message) {
    await ctx.db.patch(message._id, {
      threadId: id,
    });
  }
  
  return { id, thread, now };
}

// Public mutations (from Hono)
export const createChannel = mutation({
  args: {
    organizationId: v.string(),
    input: channelInputValidator,
  },
  returns: channelValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "channel", "create");
    const { channel } = await createChannelCore(ctx, {
      organizationId: args.organizationId,
      input: args.input,
      actorUserId: user._id,
    });
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
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "channel", "update");
    const { channel } = await updateChannelCore(ctx, {
      organizationId: args.organizationId,
      channelId: args.channelId,
      input: args.input,
      actorUserId: user._id,
    });
    return channel;
  },
});

export const deleteChannel = mutation({
  args: {
    organizationId: v.string(),
    channelId: v.string(),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "channel", "delete");
    await deleteChannelCore(ctx, {
      organizationId: args.organizationId,
      channelId: args.channelId,
      actorUserId: user._id,
    });
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
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertChannelMembership(ctx, args.channelId, user._id);
    const { message } = await createMessageCore(ctx, {
      channelId: args.channelId,
      input: args.input,
      authorId: user._id,
    });
    return message;
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
    const user = await clerkAuthComponent.getAuthUser(ctx);
    const { message } = await updateMessageCore(ctx, {
      channelId: args.channelId,
      messageId: args.messageId,
      content: args.content,
      authorId: user._id,
    });
    return message;
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
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await deleteMessageCore(ctx, {
      channelId: args.channelId,
      messageId: args.messageId,
      authorId: user._id,
    });
    return { deleted: true };
  },
});

export const addReaction = mutation({
  args: {
    organizationId: v.string(),
    channelId: v.string(),
    messageId: v.string(),
    emoji: v.string(),
  },
  returns: v.union(messageValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertChannelMembership(ctx, args.channelId, user._id);
    const { message } = await addReactionCore(ctx, {
      messageId: args.messageId,
      emoji: args.emoji,
      userId: user._id,
    });
    return message;
  },
});

export const removeReaction = mutation({
  args: {
    organizationId: v.string(),
    channelId: v.string(),
    messageId: v.string(),
    emoji: v.string(),
  },
  returns: v.union(messageValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertChannelMembership(ctx, args.channelId, user._id);
    const { message } = await removeReactionCore(ctx, {
      messageId: args.messageId,
      emoji: args.emoji,
      userId: user._id,
    });
    return message;
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
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertChannelMembership(ctx, args.channelId, user._id);
    const { thread } = await createThreadCore(ctx, {
      channelId: args.channelId,
      parentMessageId: args.parentMessageId,
      participantIds: [user._id],
    });
    return thread;
  },
});

// Internal mutations
export const createChannelInternal = internalMutation({
  args: {
    organizationId: v.string(),
    input: channelInputValidator,
    actorUserId: v.string(),
  },
  returns: channelValidator,
  handler: async (ctx, args) => {
    const { channel } = await createChannelCore(ctx, args);
    return channel;
  },
});

export const updateChannelInternal = internalMutation({
  args: {
    organizationId: v.string(),
    channelId: v.id("channels"),
    input: channelInputValidator,
    actorUserId: v.string(),
  },
  returns: channelValidator,
  handler: async (ctx, args) => {
    const { channel } = await updateChannelCore(ctx, args);
    return channel;
  },
});

export const deleteChannelInternal = internalMutation({
  args: {
    organizationId: v.string(),
    channelId: v.id("channels"),
    actorUserId: v.string(),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    await deleteChannelCore(ctx, args);
    return { removed: true };
  },
});

export const sendMessageInternal = internalMutation({
  args: {
    channelId: v.id("channels"),
    input: messageInputValidator,
    authorId: v.string(),
  },
  returns: messageValidator,
  handler: async (ctx, args) => {
    const { message } = await createMessageCore(ctx, args);
    return message;
  },
});
