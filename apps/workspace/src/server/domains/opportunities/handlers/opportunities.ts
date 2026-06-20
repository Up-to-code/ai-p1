import { createCrudHandlers } from "@/server/utils/handler-factory";
import { opportunityPayloadSchema } from "../validation/opportunity.schema";
import { createOpportunity, deleteOpportunity, updateOpportunity } from "../services/opportunities";

export const { handleCreate: handleCreateOpportunity, handleUpdate: handleUpdateOpportunity, handleDelete: handleDeleteOpportunity } = createCrudHandlers({
  resourceName: "opportunity",
  createSchema: opportunityPayloadSchema,
  updateSchema: opportunityPayloadSchema,
  resourceIdParam: "opportunityId",
  service: { create: createOpportunity, update: updateOpportunity, delete: deleteOpportunity },
});
