"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { workspaceMutation } from "@/domains/resources/workspace-resource-request";
import type { DocFormValues, DocFolderFormValues, DocRecord, DocFolder } from "../docs.types";

export function useDocsQuery(
  organizationId?: string,
  options?: { projectId?: string | null; folderId?: string | null; search?: string },
) {
  const allDocs = useQuery(
    api.clientDocs.read.list,
    organizationId ? { organizationId, projectId: options?.projectId ?? undefined } : "skip",
  );

  const folderDocs = useQuery(
    api.clientDocs.read.listByFolder,
    organizationId && options?.folderId
      ? { organizationId, folderId: options.folderId }
      : "skip",
  );

  const docs = options?.folderId ? folderDocs : allDocs;

  const filtered = docs?.filter((doc) => {
    if (doc.deletedAt) return false;
    if (options?.search?.trim()) {
      const needle = options.search.trim().toLowerCase();
      const haystack = [doc.title, doc.content, ...(doc.tags ?? [])];
      if (!haystack.some((v) => v?.toLowerCase().includes(needle))) return false;
    }
    return true;
  });

  return { data: filtered, isLoading: docs === undefined, isError: false, error: undefined as string | undefined, refetch: () => {} };
}

export function useDocQuery(organizationId: string | undefined, docId: string) {
  const doc = useQuery(
    api.clientDocs.read.get,
    organizationId && docId ? { organizationId, docId: docId as any } : "skip",
  );
  return { data: doc ?? null, isLoading: doc === undefined, isError: false, error: undefined as string | undefined, refetch: () => {} };
}

export function useDocSearchQuery(organizationId: string | undefined, query: string, projectId?: string) {
  const results = useQuery(
    api.clientDocs.read.search,
    organizationId && query.trim()
      ? { organizationId, query, projectId }
      : "skip",
  );
  return { data: results, isLoading: results === undefined, isError: false, error: undefined as string | undefined };
}

export function useDocFoldersQuery(organizationId?: string, projectId?: string) {
  const folders = useQuery(
    api.clientDocs.read.folderTree,
    organizationId ? { organizationId, projectId } : "skip",
  );
  return { data: folders, isLoading: folders === undefined, isError: false, error: undefined as string | undefined };
}

export function docPayloadFromForm(values: DocFormValues) {
  return {
    title: values.title,
    content: values.content || undefined,
    folderId: values.folderId || undefined,
    projectId: values.projectId || undefined,
    visibility: values.visibility,
    tags: values.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}

export function docFolderPayloadFromForm(values: DocFolderFormValues) {
  return {
    name: values.name,
    parentId: values.parentId || undefined,
    projectId: values.projectId || undefined,
  };
}

export async function createDocRequest(organizationId: string, values: DocFormValues) {
  return workspaceMutation<{ doc: DocRecord }>(organizationId, "docs", {
    method: "POST",
    body: docPayloadFromForm(values),
    fallbackMessage: "Doc request failed.",
  });
}

export async function updateDocRequest(organizationId: string, docId: string, values: DocFormValues) {
  return workspaceMutation<{ doc: DocRecord }>(organizationId, `docs/${docId}`, {
    method: "PATCH",
    body: docPayloadFromForm(values),
    fallbackMessage: "Doc request failed.",
  });
}

export async function deleteDocRequest(organizationId: string, docId: string) {
  return workspaceMutation(organizationId, `docs/${docId}`, {
    method: "DELETE",
    body: undefined,
    fallbackMessage: "Doc request failed.",
  });
}

export async function moveDocRequest(organizationId: string, docId: string, folderId?: string) {
  return workspaceMutation<{ doc: DocRecord }>(organizationId, `docs/${docId}/move`, {
    method: "POST",
    body: { folderId: folderId || null },
    fallbackMessage: "Failed to move doc.",
  });
}

export async function createDocFolderRequest(organizationId: string, values: DocFolderFormValues) {
  return workspaceMutation<{ folder: DocFolder }>(organizationId, "doc-folders", {
    method: "POST",
    body: docFolderPayloadFromForm(values),
    fallbackMessage: "Folder request failed.",
  });
}

export async function renameDocFolderRequest(organizationId: string, folderId: string, name: string) {
  return workspaceMutation<{ folder: DocFolder }>(organizationId, `doc-folders/${folderId}`, {
    method: "PATCH",
    body: { name },
    fallbackMessage: "Folder request failed.",
  });
}

export async function deleteDocFolderRequest(organizationId: string, folderId: string) {
  return workspaceMutation(organizationId, `doc-folders/${folderId}`, {
    method: "DELETE",
    body: undefined,
    fallbackMessage: "Folder request failed.",
  });
}
