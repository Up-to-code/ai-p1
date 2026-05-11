import { z } from "zod";

export const mediaKindSchema = z.enum(["image", "video", "document"]);
export const mediaResourceTypeSchema = z.enum(["project", "property", "client", "calendarEvent", "task"]);

export function inferMediaKind(mimeType: string) {
  if (mimeType.startsWith("image/")) return "image" as const;
  if (mimeType.startsWith("video/")) return "video" as const;
  return "document" as const;
}

export function validateMediaKind(mimeType: string, kind: z.infer<typeof mediaKindSchema>) {
  const inferred = inferMediaKind(mimeType);
  if (inferred !== kind) {
    throw new Error(`File kind ${kind} does not match ${mimeType}.`);
  }
}

export const attachMediaPayloadSchema = z.object({
  key: z.string().trim().min(1),
  url: z.string().trim().url(),
  name: z.string().trim().min(1),
  mimeType: z.string().trim().min(1),
  size: z.number().int().min(1),
  kind: mediaKindSchema,
  resourceType: mediaResourceTypeSchema,
  resourceId: z.string().trim().min(1),
  isCover: z.boolean().optional(),
});

export const updateMediaPayloadSchema = z.object({
  sortOrder: z.number().int().min(0).optional(),
  isCover: z.boolean().optional(),
});

export type AttachMediaPayload = z.infer<typeof attachMediaPayloadSchema>;
export type UpdateMediaPayload = z.infer<typeof updateMediaPayloadSchema>;
