import { createCrudHandlers } from "@/server/utils/handler-factory";
import { clientPayloadSchema } from "../validation/client.schema";
import { createClient, deleteClient, updateClient } from "../services/clients";

export const { handleCreate: handleCreateClient, handleUpdate: handleUpdateClient, handleDelete: handleDeleteClient } = createCrudHandlers({
  resourceName: "client",
  createSchema: clientPayloadSchema,
  updateSchema: clientPayloadSchema,
  resourceIdParam: "clientId",
  service: { create: createClient, update: updateClient, delete: deleteClient },
});
