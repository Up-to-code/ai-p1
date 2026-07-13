import { dealInputSchema, type DealInput } from "@qentrah/domain-contracts";

export const dealUpdatePatchSchema = dealInputSchema
  .pick({
    title: true,
    clientId: true,
    projectId: true,
    stage: true,
    status: true,
    value: true,
    currency: true,
    dealThinking: true,
    source: true,
    priority: true,
    closeDate: true,
    nextStep: true,
    tags: true,
  })
  .partial()
  .strict();

export function buildDealUpdateInput(
  existing: unknown,
  patch: unknown,
): DealInput {
  return dealInputSchema.parse({
    ...dealInputSchema.parse(existing),
    ...dealUpdatePatchSchema.parse(patch),
  });
}
