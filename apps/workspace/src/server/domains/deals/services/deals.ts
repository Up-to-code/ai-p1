import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchAuthMutation } from "@/server/auth/clerk-convex";
import type { DealPayload } from "../validation/deal.schema";

function toConvexInput(input: DealPayload) {
  const { clientId, projectId, ...rest } = input;
  return {
    ...rest,
    ...(clientId ? { clientId: clientId as Id<"clients"> } : {}),
    ...(projectId ? { projectId: projectId as Id<"projects"> } : {}),
  };
}

export async function createDeal(organizationId: string, input: DealPayload) {
  return fetchAuthMutation(api.deals.write.createFromHono, {
    organizationId,
    input: toConvexInput(input),
  });
}

export async function updateDeal(organizationId: string, dealId: string, input: DealPayload) {
  return fetchAuthMutation(api.deals.write.updateFromHono, {
    organizationId,
    dealId: dealId as Id<"deals">,
    input: toConvexInput(input),
  });
}

export async function deleteDeal(organizationId: string, dealId: string) {
  return fetchAuthMutation(api.deals.write.deleteFromHono, {
    organizationId,
    dealId: dealId as Id<"deals">,
  });
}
