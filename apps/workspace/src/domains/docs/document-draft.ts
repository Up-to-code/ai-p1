import type { DocFormValues, DocRecord } from "./docs.types";

export function documentFormFromRecord(doc: DocRecord): DocFormValues {
  return {
    title: doc.title,
    content: doc.content ?? "",
    folderId: doc.folderId ?? "",
    projectId: doc.projectId ?? "",
    visibility: doc.visibility ?? "team",
    tags: (doc.tags ?? []).join(", "),
    customFields: doc.customFields ?? [],
  };
}

export function documentDraftKey(values: DocFormValues) {
  return JSON.stringify({
    title: values.title,
    content: values.content,
    folderId: values.folderId,
    projectId: values.projectId,
    visibility: values.visibility,
    tags: values.tags,
    customFields: values.customFields ?? [],
  });
}

export function shouldAdoptServerDocument({
  currentDraft,
  lastPersistedKey,
  serverDraft,
}: {
  currentDraft: DocFormValues;
  lastPersistedKey: string;
  serverDraft: DocFormValues;
}) {
  const currentKey = documentDraftKey(currentDraft);
  return currentKey === lastPersistedKey || currentKey === documentDraftKey(serverDraft);
}

export function restoreDocumentDraft(
  serverDraft: DocFormValues,
  storedValue: unknown,
): DocFormValues {
  if (!storedValue || typeof storedValue !== "object") return serverDraft;
  return { ...serverDraft, ...(storedValue as Partial<DocFormValues>) };
}
