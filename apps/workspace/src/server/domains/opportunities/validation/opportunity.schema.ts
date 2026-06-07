import { z } from "zod";

const optionalTrimmedText = z.string().trim().optional().transform((value) => value || undefined);
const optionalNumber = z.union([z.number(), z.string().trim(), z.null()]).optional().transform((value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : undefined;
});

export const opportunityPayloadSchema = z.object({
  title: z.string().trim().min(1),
  clientId: optionalTrimmedText,
  projectId: optionalTrimmedText,
  stage: z.enum(["new", "qualified", "proposal", "negotiation", "won", "lost"]).default("new"),
  status: z.enum(["open", "won", "lost", "paused"]).default("open"),
  value: optionalNumber,
  currency: optionalTrimmedText.default("USD"),
  source: optionalTrimmedText,
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  closeDate: optionalTrimmedText,
  nextStep: optionalTrimmedText,
  ownerUserId: optionalTrimmedText,
  tags: z.array(z.string().trim()).optional(),
});

export type OpportunityPayload = z.infer<typeof opportunityPayloadSchema>;

