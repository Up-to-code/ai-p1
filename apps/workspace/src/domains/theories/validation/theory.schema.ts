import { z } from "zod";

export const theoryFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Content is required"),
  isPrivate: z.boolean(),
  source: z.enum(["ai_generated", "user_created"]),
  category: z.string().optional(),
  tags: z.string().optional(),
});
