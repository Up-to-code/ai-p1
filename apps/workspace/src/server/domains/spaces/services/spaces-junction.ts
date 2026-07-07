import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/convex-auth";

// Link a space to a project (junction table)
export function linkSpaceToProject(
  organizationId: string,
  projectId: string,
  spaceId: string,
  isPrimary?: boolean,
) {
  return fetchAuthMutation(api.projectSpaces.write.createFromHono, {
    organizationId,
    projectId: projectId as any,
    input: { spaceId: spaceId as any, isPrimary },
  });
}

// Unlink a space from a project (junction table)
export function unlinkSpaceFromProject(organizationId: string, projectSpaceId: string) {
  return fetchAuthMutation(api.projectSpaces.write.deleteFromHono, {
    organizationId,
    projectSpaceId: projectSpaceId as any,
  });
}
