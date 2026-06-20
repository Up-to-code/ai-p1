import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { createCrudService } from "@/server/utils/service-factory";
import type { ProjectPayload } from "../validation/project.schema";

function toConvexInput(input: ProjectPayload) {
  const { clientId, opportunityId, ...rest } = input;
  return {
    ...rest,
    ...(clientId ? { clientId: clientId as Id<"clients"> } : {}),
    ...(opportunityId ? { opportunityId: opportunityId as Id<"opportunities"> } : {}),
  };
}

const crud = createCrudService<ProjectPayload>({
  api: {
    create: api.projects.write.createFromHono,
    update: api.projects.write.updateFromHono,
    delete: api.projects.write.deleteFromHono,
  },
  idParamName: "projectId",
  toConvexInput,
});

export const createProject = crud.create;
export const updateProject = crud.update;
export const deleteProject = crud.remove;
