import {
  projectInputSchema,
  type ProjectInput,
} from "@qentrah/domain-contracts";

export const projectUpdatePatchSchema = projectInputSchema
  .pick({
    name: true,
    clientId: true,
    opportunityId: true,
    status: true,
    health: true,
    visibility: true,
    budget: true,
    currency: true,
    description: true,
  })
  .partial()
  .strict();

export function buildProjectUpdateInput(
  existing: unknown,
  patch: unknown,
): ProjectInput {
  return projectInputSchema.parse({
    ...projectInputSchema.parse(existing),
    ...projectUpdatePatchSchema.parse(patch),
  });
}
