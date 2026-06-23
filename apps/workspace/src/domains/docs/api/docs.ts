"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  organizationApiPath,
  requestOrganizationAction,
} from "@/domains/organization/api/organization-request";
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

  return { data: filtered, error: undefined as string | undefined, refetch: () => {} };
}

export function useDocQuery(organizationId: string | undefined, docId: string) {
  const doc = useQuery(
    api.clientDocs.read.get,
    organizationId && docId ? { organizationId, docId: docId as any } : "skip",
  );
  return { data: doc ?? null, error: undefined as string | undefined, refetch: () => {} };
}

export function useDocSearchQuery(organizationId: string | undefined, query: string, projectId?: string) {
  const results = useQuery(
    api.clientDocs.read.search,
    organizationId && query.trim()
      ? { organizationId, query, projectId }
      : "skip",
  );
  return { data: results, error: undefined as string | undefined };
}

export function useDocFoldersQuery(organizationId?: string, projectId?: string) {
  const folders = useQuery(
    api.clientDocs.read.folderTree,
    organizationId ? { organizationId, projectId } : "skip",
  );
  return { data: folders, error: undefined as string | undefined };
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
  return requestOrganizationAction<{ doc: DocRecord }>(
    organizationApiPath(organizationId, "docs"),
    "POST",
    docPayloadFromForm(values),
    "Doc request failed.",
  );
}

export async function updateDocRequest(organizationId: string, docId: string, values: DocFormValues) {
  return requestOrganizationAction<{ doc: DocRecord }>(
    organizationApiPath(organizationId, "docs", docId),
    "PATCH",
    docPayloadFromForm(values),
    "Doc request failed.",
  );
}

export async function deleteDocRequest(organizationId: string, docId: string) {
  return requestOrganizationAction(
    organizationApiPath(organizationId, "docs", docId),
    "DELETE",
    undefined,
    "Doc request failed.",
  );
}

export async function moveDocRequest(organizationId: string, docId: string, folderId?: string) {
  return requestOrganizationAction<{ doc: DocRecord }>(
    organizationApiPath(organizationId, "docs", docId, "move"),
    "POST",
    { folderId: folderId || null },
    "Failed to move doc.",
  );
}

export async function createDocFolderRequest(organizationId: string, values: DocFolderFormValues) {
  return requestOrganizationAction<{ folder: DocFolder }>(
    organizationApiPath(organizationId, "doc-folders"),
    "POST",
    docFolderPayloadFromForm(values),
    "Folder request failed.",
  );
}

export async function renameDocFolderRequest(organizationId: string, folderId: string, name: string) {
  return requestOrganizationAction<{ folder: DocFolder }>(
    organizationApiPath(organizationId, "doc-folders", folderId),
    "PATCH",
    { name },
    "Folder request failed.",
  );
}

export async function deleteDocFolderRequest(organizationId: string, folderId: string) {
  return requestOrganizationAction(
    organizationApiPath(organizationId, "doc-folders", folderId),
    "DELETE",
    undefined,
    "Folder request failed.",
  );
}
