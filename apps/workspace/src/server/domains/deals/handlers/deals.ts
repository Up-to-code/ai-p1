import { createCrudHandlers } from "@/server/utils/handler-factory";
import { dealPayloadSchema } from "../validation/deal.schema";
import { createDeal, deleteDeal, updateDeal } from "../services/deals";

export const { handleCreate: handleCreateDeal, handleUpdate: handleUpdateDeal, handleDelete: handleDeleteDeal } = createCrudHandlers({
  resourceName: "deal",
  createSchema: dealPayloadSchema,
  updateSchema: dealPayloadSchema,
  resourceIdParam: "dealId",
  service: { create: createDeal, update: updateDeal, delete: deleteDeal },
});
