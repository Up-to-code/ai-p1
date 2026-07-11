import type { DocFormValues } from "../docs.types";

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
    customFields: values.customFields,
  };
}
