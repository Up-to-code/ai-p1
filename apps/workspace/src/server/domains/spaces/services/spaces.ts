import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/clerk-convex";
import type { SpacePayload } from "../validation/space.schema";

// Create a new space (organization-level)
export function createSpace(organizationId: string, input: SpacePayload) {
  return fetchAuthMutation(api.spaces.write.create, {
    organizationId,
    input,
  });
}

// Update a space (organization-level)
export function updateSpace(organizationId: string, spaceId: string, input: SpacePayload) {
  return fetchAuthMutation(api.spaces.write.update, {
    organizationId,
    spaceId: spaceId as any,
    input,
  });
}

// Delete a space (organization-level)
export function deleteSpace(organizationId: string, spaceId: string) {
  return fetchAuthMutation(api.spaces.write.remove, {
    organizationId,
    spaceId: spaceId as any,
  });
}
