import { api } from "@convex/_generated/api";
import { createCrudService } from "@/server/utils/service-factory";
import type { ClientPayload } from "../validation/client.schema";

const crud = createCrudService<ClientPayload>({
  api: {
    create: api.clients.write.createFromHono,
    update: api.clients.write.updateFromHono,
    delete: api.clients.write.deleteFromHono,
  },
  idParamName: "clientId",
});

export const createClient = crud.create;
export const updateClient = crud.update;
export const deleteClient = crud.remove;
