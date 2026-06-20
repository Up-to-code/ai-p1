import { createCrudHandlers } from "@/server/utils/handler-factory";
import { clientTaskPayloadSchema } from "../validation/client-task.schema";
import { createClientTask, deleteClientTask, updateClientTask } from "../services/client-tasks";

export const { handleCreate: handleCreateClientTask, handleUpdate: handleUpdateClientTask, handleDelete: handleDeleteClientTask } = createCrudHandlers({
  resourceName: "task",
  createSchema: clientTaskPayloadSchema,
  updateSchema: clientTaskPayloadSchema,
  resourceIdParam: "taskId",
  service: { create: createClientTask, update: updateClientTask, delete: deleteClientTask },
});
