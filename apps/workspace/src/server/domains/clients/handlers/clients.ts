import { createDomainRouter } from "@/server/utils/create-domain-router";
import { clientPayloadSchema, clientUpdatePayloadSchema } from "../validation/client.schema";
import { api } from "@convex/_generated/api";

export const { handleCreate: handleCreateClient, handleUpdate: handleUpdateClient, handleDelete: handleDeleteClient } = createDomainRouter({
  resourceName: "client",
  createSchema: clientPayloadSchema,
  updateSchema: clientUpdatePayloadSchema,
  resourceIdParam: "clientId",
  convex: {
    create: api.clients.write.createFromHono,
    update: api.clients.write.updateFromHono,
    delete: api.clients.write.deleteFromHono,
  },
});
