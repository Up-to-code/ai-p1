import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchAuthMutation } from "@/server/auth/clerk-convex";
import type { DocFolderPayload, DocFolderRenamePayload } from "../validation/doc.schema";

export async function createDocFolder(organizationId: string, input: DocFolderPayload) {
  return fetchAuthMutation(api.clientDocs.write.createFolderFromHono, {
    organizationId,
    input: {
      name: input.name,
      parentId: input.parentId,
      projectId: input.projectId,
      icon: input.icon,
    },
  });
}

export async function renameDocFolder(organizationId: string, folderId: string, input: DocFolderRenamePayload) {
  return fetchAuthMutation(api.clientDocs.write.renameFolderFromHono, {
    organizationId,
    folderId: folderId as Id<"docFolders">,
    name: input.name,
  });
}

export async function deleteDocFolder(organizationId: string, folderId: string) {
  return fetchAuthMutation(api.clientDocs.write.deleteFolderFromHono, {
    organizationId,
    folderId: folderId as Id<"docFolders">,
  });
}
