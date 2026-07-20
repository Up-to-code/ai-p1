import { z } from "zod";
import {
  dealStageSchema,
  dealStatusSchema,
  dealPrioritySchema,
} from "@qentrah/domain-contracts";

export { dealStageSchema, dealStatusSchema, dealPrioritySchema };

export const dealSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  stage: dealStageSchema,
  status: dealStatusSchema,
  priority: dealPrioritySchema,
  value: z.coerce.number().optional(),
  currency: z.string().optional(),
  dealThinking: z.string().optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  source: z.string().optional(),
  closeDate: z.string().optional(),
  nextStep: z.string().optional(),
  ownerUserId: z.string().optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional().transform((val) =>
    typeof val === "string" ? val.split(",").map((s) => s.trim()).filter(Boolean) : val,
  ),
});

export type DealSchemaValues = z.infer<typeof dealSchema>;
