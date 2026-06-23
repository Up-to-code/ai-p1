import { z } from "zod";

const optionalTrimmedText = z.string().trim().optional().transform((value) => value || undefined);

export const docPayloadSchema = z.object({
  title: z.string().trim().min(1),
  content: optionalTrimmedText,
  folderId: optionalTrimmedText,
  projectId: optionalTrimmedText,
  visibility: z.enum(["private", "team", "workspace"]).optional(),
  tags: z.array(z.string().trim()).optional(),
});

export type DocPayload = z.infer<typeof docPayloadSchema>;

export const docMoveSchema = z.object({
  folderId: z.string().trim().nullable().optional(),
});

export type DocMovePayload = z.infer<typeof docMoveSchema>;

export const docFolderPayloadSchema = z.object({
  name: z.string().trim().min(1),
  parentId: optionalTrimmedText,
  projectId: optionalTrimmedText,
  icon: optionalTrimmedText,
});

export type DocFolderPayload = z.infer<typeof docFolderPayloadSchema>;

export const docFolderRenameSchema = z.object({
  name: z.string().trim().min(1),
});

export type DocFolderRenamePayload = z.infer<typeof docFolderRenameSchema>;
