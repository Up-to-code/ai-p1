import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/clerk-convex";
import type { SpacePayload } from "../validation/space.schema";

function toConvexInput(input: SpacePayload) {
  return input;
}

// Create a new space (organization-level)
export function createSpace(organizationId: string, input: SpacePayload) {
  return fetchAuthMutation(api.spaces.write.create, {
    organizationId,
    input: toConvexInput(input),
  });
}

// Update a space (organization-level)
export function updateSpace(organizationId: string, spaceId: string, input: SpacePayload) {
  return fetchAuthMutation(api.spaces.write.update, {
    organizationId,
    spaceId: spaceId as any,
    input: toConvexInput(input),
  });
}

// Delete a space (organization-level)
export function deleteSpace(organizationId: string, spaceId: string) {
  return fetchAuthMutation(api.spaces.write.remove, {
    organizationId,
    spaceId: spaceId as any,
  });
}

// Link a space to a project (junction table)
export function linkSpaceToProject(organizationId: string, projectId: string, spaceId: string, isPrimary?: boolean) {
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
