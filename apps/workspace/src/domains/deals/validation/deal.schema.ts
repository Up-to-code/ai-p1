import { z } from "zod";

export const dealSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  stage: z.enum(["lead", "qualified", "proposal_sent", "contract_sent", "won", "lost"]),
  status: z.enum(["open", "won", "lost", "paused"]),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  value: z.string().optional(),
  currency: z.string().optional(),
  dealThinking: z.string().optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  source: z.string().optional(),
  closeDate: z.string().optional(),
  nextStep: z.string().optional(),
  tags: z.string().optional(),
});

export type DealSchemaValues = z.infer<typeof dealSchema>;
