import { createDomainRouter } from "@/server/utils/create-domain-router";
import { opportunityPayloadSchema } from "../validation/opportunity.schema";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { OpportunityPayload } from "../validation/opportunity.schema";

function toConvexInput(input: OpportunityPayload) {
  const { clientId, projectId, ...rest } = input;
  return {
    ...rest,
    ...(clientId ? { clientId: clientId as Id<"clients"> } : {}),
    ...(projectId ? { projectId: projectId as Id<"projects"> } : {}),
  };
}

export const { handleCreate: handleCreateOpportunity, handleUpdate: handleUpdateOpportunity, handleDelete: handleDeleteOpportunity } = createDomainRouter({
  resourceName: "opportunity",
  createSchema: opportunityPayloadSchema,
  updateSchema: opportunityPayloadSchema,
  resourceIdParam: "opportunityId",
  convex: {
    create: api.opportunities.write.createFromHono,
    update: api.opportunities.write.updateFromHono,
    delete: api.opportunities.write.deleteFromHono,
  },
  toConvexInput: { create: toConvexInput, update: toConvexInput },
});
