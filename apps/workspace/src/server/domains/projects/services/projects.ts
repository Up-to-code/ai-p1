import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/convex-workos/server";
import type { ProjectPayload } from "../validation/project.schema";

export async function createProject(organizationId: string, input: ProjectPayload) {
  return fetchAuthMutation(api.projects.write.createFromHono, { organizationId, input });
}

export async function updateProject(organizationId: string, projectId: string, input: ProjectPayload) {
  return fetchAuthMutation(api.projects.write.updateFromHono, {
    organizationId,
    projectId: projectId as never,
    input,
  });
}

export async function deleteProject(organizationId: string, projectId: string) {
  return fetchAuthMutation(api.projects.write.deleteFromHono, {
    organizationId,
    projectId: projectId as never,
  });
}
