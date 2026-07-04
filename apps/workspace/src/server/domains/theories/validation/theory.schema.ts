import { z } from "zod";

export const theoryPayloadSchema = z.object({
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
  isPrivate: z.boolean(),
  source: z.enum(["ai_generated", "user_created"]),
  category: z.string().trim().optional().transform((v) => v || undefined),
  tags: z.array(z.string().trim()).optional(),
});

export type TheoryPayload = z.infer<typeof theoryPayloadSchema>;
