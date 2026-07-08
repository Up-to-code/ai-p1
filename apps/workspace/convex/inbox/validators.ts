import { v } from "convex/values";

export const channelTypeValidator = v.union(
  v.literal("organization"),
  v.literal("project"),
  v.literal("space"),
  v.literal("client"),
  v.literal("dm"),
);

export const channelVisibilityValidator = v.union(
  v.literal("public"),
  v.literal("private"),
  v.literal("dm"),
);

export const channelInputValidator = v.object({
  name: v.string(),
  type: channelTypeValidator,
  visibility: channelVisibilityValidator,
  description: v.optional(v.string()),
  projectId: v.optional(v.string()),
  projectIds: v.optional(v.array(v.string())),
  spaceId: v.optional(v.string()),
  clientId: v.optional(v.string()),
  parentChannelId: v.optional(v.string()),
  memberIds: v.optional(v.array(v.string())),
  dmUserId: v.optional(v.string()),
});

export const channelValidator = v.object({
  _id: v.id("channels"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  name: v.string(),
  type: channelTypeValidator,
  visibility: channelVisibilityValidator,
  description: v.optional(v.string()),
  projectId: v.optional(v.string()),
  projectIds: v.optional(v.array(v.string())),
  spaceId: v.optional(v.string()),
  clientId: v.optional(v.string()),
  parentChannelId: v.optional(v.string()),
  memberIds: v.array(v.string()),
  createdBy: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  unreadCount: v.optional(v.number()),
  lastMessageAt: v.optional(v.number()),
  pinnedMessageId: v.optional(v.string()),
  pinnedBy: v.optional(v.string()),
  pinnedAt: v.optional(v.number()),
});

export const messageAttachmentValidator = v.object({
  id: v.string(),
  name: v.string(),
  url: v.string(),
  type: v.string(),
  size: v.number(),
});

export const messageInputValidator = v.object({
  content: v.string(),
  clientMessageId: v.optional(v.string()),
  threadId: v.optional(v.string()),
  replyToId: v.optional(v.string()),
  mentions: v.optional(
    v.array(
      v.object({
        type: v.union(
          v.literal("user"),
          v.literal("task"),
          v.literal("client"),
          v.literal("deal"),
          v.literal("project"),
          v.literal("document"),
          v.literal("file"),
          v.literal("ai"),
        ),
        id: v.string(),
        name: v.string(),
      }),
    ),
  ),
  attachments: v.optional(v.array(messageAttachmentValidator)),
});

export const messageValidator = v.object({
  _id: v.id("messages"),
  _creationTime: v.number(),
  id: v.string(),
  clientMessageId: v.optional(v.string()),
  channelId: v.string(),
  content: v.string(),
  authorId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  threadId: v.optional(v.string()),
  replyToId: v.optional(v.string()),
  reactions: v.optional(
    v.array(
      v.object({
        emoji: v.string(),
        userIds: v.array(v.string()),
      }),
    ),
  ),
  mentions: v.optional(
    v.array(
      v.object({
        type: v.union(
          v.literal("user"),
          v.literal("task"),
          v.literal("client"),
          v.literal("deal"),
          v.literal("project"),
          v.literal("document"),
          v.literal("file"),
          v.literal("ai"),
        ),
        id: v.string(),
        name: v.string(),
      }),
    ),
  ),
  attachments: v.optional(v.array(messageAttachmentValidator)),
  recordState: v.union(
    v.literal("active"),
    v.literal("archived"),
    v.literal("deleted"),
  ),
  editedAt: v.optional(v.number()),
  pinnedAt: v.optional(v.number()),
  pinnedBy: v.optional(v.string()),
});

export const threadValidator = v.object({
  _id: v.id("threads"),
  _creationTime: v.number(),
  id: v.string(),
  channelId: v.string(),
  parentMessageId: v.string(),
  messageCount: v.number(),
  participantIds: v.array(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});
