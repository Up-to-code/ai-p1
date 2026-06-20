import { createCrudHandlers } from "@/server/utils/handler-factory";
import { projectPayloadSchema } from "../validation/project.schema";
import { createProject, deleteProject, updateProject } from "../services/projects";

export const { handleCreate: handleCreateProject, handleUpdate: handleUpdateProject, handleDelete: handleDeleteProject } = createCrudHandlers({
  resourceName: "project",
  createSchema: projectPayloadSchema,
  updateSchema: projectPayloadSchema,
  resourceIdParam: "projectId",
  service: { create: createProject, update: updateProject, delete: deleteProject },
});
