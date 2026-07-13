import { createDomainRouter } from "@/server/utils/create-domain-router";
import {
  clientTaskPayloadSchema,
  clientTaskUpdatePayloadSchema,
} from "../validation/client-task.schema";
import { api } from "@convex/_generated/api";

export const { handleCreate: handleCreateClientTask, handleUpdate: handleUpdateClientTask, handleDelete: handleDeleteClientTask } = createDomainRouter({
  resourceName: "task",
  createSchema: clientTaskPayloadSchema,
  updateSchema: clientTaskUpdatePayloadSchema,
  resourceIdParam: "taskId",
  convex: {
    create: api.clientTasks.write.createFromHono,
    update: api.clientTasks.write.updateFromHono,
    delete: api.clientTasks.write.deleteFromHono,
  },
});
