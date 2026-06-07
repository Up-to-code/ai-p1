import { z } from "zod";

const optionalTrimmedText = z.string().trim().optional().transform((value) => value || undefined);

export const assetPayloadSchema = z.object({
  name: z.string().trim().min(1),
  projectId: z.string().trim().min(1).optional(),
  project: z.string().trim().optional().default("Standalone asset"),
  type: z.string().trim().min(1),
  status: z.enum(["available", "pending", "reserved", "sold", "draft", "active", "review", "approved", "archived"]),
  visibility: z.enum(["private", "team", "workspace"]).optional(),
  fileId: optionalTrimmedText,
  url: optionalTrimmedText,
  description: optionalTrimmedText,
  tags: z.array(z.string().trim()).optional(),
  metadata: z.unknown().optional(),
});

export type AssetPayload = z.infer<typeof assetPayloadSchema>;
