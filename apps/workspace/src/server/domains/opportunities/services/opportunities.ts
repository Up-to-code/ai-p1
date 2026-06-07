import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchAuthMutation } from "@/server/auth/clerk-convex";
import type { OpportunityPayload } from "../validation/opportunity.schema";

function toConvexInput(input: OpportunityPayload) {
  const { clientId, projectId, ...rest } = input;
  return {
    ...rest,
    ...(clientId ? { clientId: clientId as Id<"clients"> } : {}),
    ...(projectId ? { projectId: projectId as Id<"projects"> } : {}),
  };
}

export async function createOpportunity(organizationId: string, input: OpportunityPayload) {
  return fetchAuthMutation(api.opportunities.write.createFromHono, {
    organizationId,
    input: toConvexInput(input),
  });
}

export async function updateOpportunity(organizationId: string, opportunityId: string, input: OpportunityPayload) {
  return fetchAuthMutation(api.opportunities.write.updateFromHono, {
    organizationId,
    opportunityId: opportunityId as Id<"opportunities">,
    input: toConvexInput(input),
  });
}

export async function deleteOpportunity(organizationId: string, opportunityId: string) {
  return fetchAuthMutation(api.opportunities.write.deleteFromHono, {
    organizationId,
    opportunityId: opportunityId as Id<"opportunities">,
  });
}

