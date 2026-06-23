import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/clerk-convex";
import type { SpacePayload } from "../validation/space.schema";

function toConvexInput(input: SpacePayload) {
  return {
    ...input,
    defaultAssigneeIds: input.defaultAssigneeIds ?? undefined,
  };
}

export function createSpace(organizationId: string, input: SpacePayload, extra: { projectId: string }) {
  return fetchAuthMutation(api.projectSpaces.write.createFromHono, {
    organizationId,
    projectId: extra.projectId as any,
    input: toConvexInput(input),
  });
}

export function updateSpace(organizationId: string, spaceId: string, input: SpacePayload, extra: { projectId: string }) {
  return fetchAuthMutation(api.projectSpaces.write.updateFromHono, {
    organizationId,
    projectId: extra.projectId as any,
    spaceId: spaceId as any,
    input: toConvexInput(input),
  });
}

export function deleteSpace(organizationId: string, spaceId: string, extra: { projectId: string }) {
  return fetchAuthMutation(api.projectSpaces.write.deleteFromHono, {
    organizationId,
    projectId: extra.projectId as any,
    spaceId: spaceId as any,
  });
}
