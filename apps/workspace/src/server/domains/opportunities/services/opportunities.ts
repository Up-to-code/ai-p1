import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { createCrudService } from "@/server/utils/service-factory";
import type { OpportunityPayload } from "../validation/opportunity.schema";

function toConvexInput(input: OpportunityPayload) {
  const { clientId, projectId, ...rest } = input;
  return {
    ...rest,
    ...(clientId ? { clientId: clientId as Id<"clients"> } : {}),
    ...(projectId ? { projectId: projectId as Id<"projects"> } : {}),
  };
}

const crud = createCrudService<OpportunityPayload>({
  api: {
    create: api.opportunities.write.createFromHono,
    update: api.opportunities.write.updateFromHono,
    delete: api.opportunities.write.deleteFromHono,
  },
  idParamName: "opportunityId",
  toConvexInput,
});

export const createOpportunity = crud.create;
export const updateOpportunity = crud.update;
export const deleteOpportunity = crud.remove;
