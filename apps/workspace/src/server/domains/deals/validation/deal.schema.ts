import { z } from "zod";
import { dealStageSchema, dealStatusSchema, dealPrioritySchema } from "@qentrah/domain-contracts";

const optionalTrimmedText = z.string().trim().optional().transform((value) => value || undefined);
const optionalNumber = z.union([z.number(), z.string().trim(), z.null()]).optional().transform((value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : undefined;
});

export const dealPayloadSchema = z.object({
  title: z.string().trim().min(1),
  clientId: optionalTrimmedText,
  projectId: optionalTrimmedText,
  stage: dealStageSchema.default("lead"),
  status: dealStatusSchema.default("open"),
  value: optionalNumber,
  currency: optionalTrimmedText.default("USD"),
  dealThinking: optionalTrimmedText,
  source: optionalTrimmedText,
  priority: dealPrioritySchema.default("normal"),
  closeDate: optionalTrimmedText,
  nextStep: optionalTrimmedText,
  ownerUserId: optionalTrimmedText,
  tags: z.array(z.string().trim()).optional(),
});

export type DealPayload = z.infer<typeof dealPayloadSchema>;
