import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/clerk-convex";
import type { FollowUpPayload } from "../validation/follow-up.schema";

function toConvexInput(input: FollowUpPayload) {
  return input;
}

export async function createFollowUp(organizationId: string, input: FollowUpPayload) {
  return fetchAuthMutation(api.clientFollowUps.write.createFromHono, {
    organizationId,
    input: toConvexInput(input),
  });
}

export async function updateFollowUp(organizationId: string, followUpId: string, input: FollowUpPayload) {
  return fetchAuthMutation(api.clientFollowUps.write.updateFromHono, {
    organizationId,
    followUpId: followUpId as never,
    input: toConvexInput(input),
  });
}

export async function deleteFollowUp(organizationId: string, followUpId: string) {
  return fetchAuthMutation(api.clientFollowUps.write.deleteFromHono, {
    organizationId,
    followUpId: followUpId as never,
  });
}

export async function markFollowUpComplete(organizationId: string, followUpId: string) {
  return fetchAuthMutation(api.clientFollowUps.write.markComplete, {
    organizationId,
    followUpId: followUpId as never,
  });
}
