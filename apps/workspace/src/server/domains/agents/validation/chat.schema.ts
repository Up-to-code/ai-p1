import { z } from "zod";

export const agentChatSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  threadId: z.string().trim().optional(),
});

export type AgentChatPayload = z.infer<typeof agentChatSchema>;
