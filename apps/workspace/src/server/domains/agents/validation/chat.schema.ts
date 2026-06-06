import { z } from "zod";

const agentAttachmentKindSchema = z.enum(["image", "video", "document"]);

const agentChatAttachmentSchema = z.object({
  key: z.string().trim().min(1),
  url: z.string().trim().url(),
  name: z.string().trim().min(1).max(240),
  mimeType: z.string().trim().min(1).max(160),
  size: z.number().int().min(1),
  kind: agentAttachmentKindSchema,
});

export const agentChatSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  threadId: z.string().trim().optional(),
  attachments: z.array(agentChatAttachmentSchema).max(24).optional(),
});
