import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchAuthMutation } from "@/server/auth/auth-request";
import type { DocPayload, DocMovePayload } from "../validation/doc.schema";

function toConvexInput(input: DocPayload) {
  return {
    title: input.title,
    content: input.content,
    folderId: input.folderId,
    projectId: input.projectId,
    visibility: input.visibility,
    tags: input.tags,
  };
}

export async function createDoc(organizationId: string, input: DocPayload) {
  return fetchAuthMutation(api.clientDocs.write.createFromHono, {
    organizationId,
    input: toConvexInput(input),
  });
}

export async function updateDoc(organizationId: string, docId: string, input: DocPayload) {
  return fetchAuthMutation(api.clientDocs.write.updateFromHono, {
    organizationId,
    docId: docId as Id<"docs">,
    input: toConvexInput(input),
  });
}

export async function deleteDoc(organizationId: string, docId: string) {
  return fetchAuthMutation(api.clientDocs.write.deleteFromHono, {
    organizationId,
    docId: docId as Id<"docs">,
  });
}

export async function moveDoc(organizationId: string, docId: string, input: DocMovePayload) {
  return fetchAuthMutation(api.clientDocs.write.moveToFolder, {
    organizationId,
    docId: docId as Id<"docs">,
    folderId: input.folderId ?? undefined,
  });
}
