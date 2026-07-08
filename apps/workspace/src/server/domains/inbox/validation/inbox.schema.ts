import { z } from "zod";

const optionalTrimmedText = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);
const optionalTrimmedList = z.array(z.string().trim().min(1)).optional();

export const channelPayloadSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(["organization", "project", "space", "client", "dm"]),
  visibility: z.enum(["public", "private", "dm"]),
  description: optionalTrimmedText,
  projectId: optionalTrimmedText,
  projectIds: optionalTrimmedList,
  spaceId: optionalTrimmedText,
  clientId: optionalTrimmedText,
  parentChannelId: optionalTrimmedText,
  memberIds: optionalTrimmedList,
  dmUserId: optionalTrimmedText,
});

export const messagePayloadSchema = z.object({
  content: z.string().trim().min(1),
  clientMessageId: optionalTrimmedText,
  threadId: optionalTrimmedText,
  replyToId: optionalTrimmedText,
  mentions: z
    .array(
      z.object({
        type: z.enum([
          "user",
          "task",
          "client",
          "deal",
          "project",
          "document",
          "file",
          "ai",
        ]),
        id: z.string().trim().min(1),
        name: z.string().trim().min(1),
      }),
    )
    .optional(),
  attachments: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        name: z.string().trim().min(1),
        url: z.string().trim().min(1),
        type: z.string().trim().min(1),
        size: z.number().nonnegative(),
      }),
    )
    .optional(),
});

export const messageContentPayloadSchema = z.object({
  content: z.string().trim().min(1),
});

export const reactionPayloadSchema = z.object({
  emoji: z.string().trim().min(1),
});

export const threadPayloadSchema = z.object({
  parentMessageId: z.string().trim().min(1),
});

export type ChannelPayload = z.infer<typeof channelPayloadSchema>;
export type MessagePayload = z.infer<typeof messagePayloadSchema>;
export type MessageContentPayload = z.infer<typeof messageContentPayloadSchema>;
export type ReactionPayload = z.infer<typeof reactionPayloadSchema>;
export type ThreadPayload = z.infer<typeof threadPayloadSchema>;
