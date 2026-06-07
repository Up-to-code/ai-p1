import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchAuthMutation } from "@/server/auth/clerk-convex";
import type { ProjectPayload } from "../validation/project.schema";

function toConvexInput(input: ProjectPayload) {
  const { clientId, opportunityId, ...rest } = input;
  return {
    ...rest,
    ...(clientId ? { clientId: clientId as Id<"clients"> } : {}),
    ...(opportunityId ? { opportunityId: opportunityId as Id<"opportunities"> } : {}),
  };
}

export async function createProject(organizationId: string, input: ProjectPayload) {
  return fetchAuthMutation(api.projects.write.createFromHono, { organizationId, input: toConvexInput(input) });
}

export async function updateProject(organizationId: string, projectId: string, input: ProjectPayload) {
  return fetchAuthMutation(api.projects.write.updateFromHono, {
    organizationId,
    projectId: projectId as never,
    input: toConvexInput(input),
  });
}

export async function deleteProject(organizationId: string, projectId: string) {
  return fetchAuthMutation(api.projects.write.deleteFromHono, {
    organizationId,
    projectId: projectId as never,
  });
}
