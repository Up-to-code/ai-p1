import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { createCrudService } from "@/server/utils/service-factory";
import type { DealPayload } from "../validation/deal.schema";

function toConvexInput(input: DealPayload) {
  const { clientId, projectId, ...rest } = input;
  return {
    ...rest,
    ...(clientId ? { clientId: clientId as Id<"clients"> } : {}),
    ...(projectId ? { projectId: projectId as Id<"projects"> } : {}),
  };
}

const crud = createCrudService<DealPayload>({
  api: {
    create: api.deals.write.createFromHono,
    update: api.deals.write.updateFromHono,
    delete: api.deals.write.deleteFromHono,
  },
  idParamName: "dealId",
  toConvexInput,
});

export const createDeal = crud.create;
export const updateDeal = crud.update;
export const deleteDeal = crud.remove;
