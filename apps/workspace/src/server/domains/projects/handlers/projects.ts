import { createDomainRouter } from "@/server/utils/create-domain-router";
import { projectPayloadSchema } from "../validation/project.schema";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { ProjectPayload } from "../validation/project.schema";

function toConvexInput(input: ProjectPayload) {
  const { clientId, opportunityId, ...rest } = input;
  return {
    ...rest,
    ...(clientId ? { clientId: clientId as Id<"clients"> } : {}),
    ...(opportunityId ? { opportunityId: opportunityId as Id<"opportunities"> } : {}),
  };
}

export const { handleCreate: handleCreateProject, handleUpdate: handleUpdateProject, handleDelete: handleDeleteProject } = createDomainRouter({
  resourceName: "project",
  createSchema: projectPayloadSchema,
  updateSchema: projectPayloadSchema,
  resourceIdParam: "projectId",
  convex: {
    create: api.projects.write.createFromHono,
    update: api.projects.write.updateFromHono,
    delete: api.projects.write.deleteFromHono,
  },
  toConvexInput: { create: toConvexInput, update: toConvexInput },
});
