import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchAuthMutation } from "@/server/auth/auth-request";
import type { TheoryPayload } from "../validation/theory.schema";

function toConvexInput(input: TheoryPayload) {
  return {
    title: input.title,
    content: input.content,
    isPrivate: input.isPrivate,
    source: input.source,
    category: input.category,
    tags: input.tags,
  };
}

export async function createTheory(organizationId: string, input: TheoryPayload) {
  return fetchAuthMutation(api.theories.write.createFromHono, {
    organizationId,
    input: toConvexInput(input),
  });
}

export async function updateTheory(organizationId: string, theoryId: string, input: TheoryPayload) {
  return fetchAuthMutation(api.theories.write.updateFromHono, {
    organizationId,
    theoryId: theoryId as Id<"theories">,
    input: toConvexInput(input),
  });
}

export async function deleteTheory(organizationId: string, theoryId: string) {
  return fetchAuthMutation(api.theories.write.deleteFromHono, {
    organizationId,
    theoryId: theoryId as Id<"theories">,
  });
}
