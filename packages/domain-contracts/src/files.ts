import { z } from "zod";

export const allowedUploadedFileMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

/**
 * WHY:   The web layer needs one stable, storage-provider-neutral file reference shape.
 * WHAT:  Validates the uploaded file metadata persisted for images and documents.
 * HOW:   Keeps only the fields the UI and repositories need to render previews and round-trip writes.
 */
export const uploadedFileReferenceSchema = z.object({
  key: z.string().trim().min(1).max(512),
  url: z.string().url(),
  name: z.string().trim().min(1).max(180),
  size: z.number().int().nonnegative().max(32 * 1024 * 1024).optional(),
  mime: z.enum(allowedUploadedFileMimeTypes).optional(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/u).optional(),
});

export type UploadedFileReference = z.infer<typeof uploadedFileReferenceSchema>;
