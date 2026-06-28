import { createDomainRouter } from "@/server/utils/create-domain-router";
import { dealPayloadSchema } from "../validation/deal.schema";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { DealPayload } from "../validation/deal.schema";

function toConvexInput(input: DealPayload) {
  const { clientId, projectId, ...rest } = input;
  return {
    ...rest,
    ...(clientId ? { clientId: clientId as Id<"clients"> } : {}),
    ...(projectId ? { projectId: projectId as Id<"projects"> } : {}),
  };
}

export const { handleCreate: handleCreateDeal, handleUpdate: handleUpdateDeal, handleDelete: handleDeleteDeal } = createDomainRouter({
  resourceName: "deal",
  createSchema: dealPayloadSchema,
  updateSchema: dealPayloadSchema,
  resourceIdParam: "dealId",
  convex: {
    create: api.deals.write.createFromHono,
    update: api.deals.write.updateFromHono,
    delete: api.deals.write.deleteFromHono,
  },
  toConvexInput: { create: toConvexInput, update: toConvexInput },
});
