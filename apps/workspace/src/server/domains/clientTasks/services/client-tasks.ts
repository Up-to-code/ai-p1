import { api } from "@convex/_generated/api";
import { createCrudService } from "@/server/utils/service-factory";
import type { ClientTaskPayload } from "../validation/client-task.schema";

const crud = createCrudService<ClientTaskPayload>({
  api: {
    create: api.clientTasks.write.createFromHono,
    update: api.clientTasks.write.updateFromHono,
    delete: api.clientTasks.write.deleteFromHono,
  },
  idParamName: "taskId",
});

export const createClientTask = crud.create;
export const updateClientTask = crud.update;
export const deleteClientTask = crud.remove;
