import { z } from "zod";

export const docFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  content: z.string().optional(),
  folderId: z.string().optional(),
  projectId: z.string().optional(),
  visibility: z.enum(["private", "team", "workspace"]),
  tags: z.string().optional(),
});

export const docFolderFormSchema = z.object({
  name: z.string().min(1, "Folder name is required").max(200),
  parentId: z.string().optional(),
  projectId: z.string().optional(),
});
