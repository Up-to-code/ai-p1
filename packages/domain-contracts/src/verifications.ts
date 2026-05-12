import { z } from "zod";
import { uploadedFileReferenceSchema } from "./files";

/**
 * WHY:   Verification submissions need a stable gateway-level payload contract.
 * WHAT:  Zod schema for submitting verification requests with attached documents.
 * HOW:   Reuses uploaded file references and validates optional checklist metadata.
 */
export const verificationRequestInputSchema = z.object({
  documents: z.array(uploadedFileReferenceSchema).min(1, "At least one document is required"),
  proofDocuments: z.array(uploadedFileReferenceSchema).optional(),
  requirements: z.array(z.string().min(1)).optional(),
  sourceUrls: z.array(z.string().url()).optional(),
  notes: z.string().trim().min(1).max(1000).optional(),
  organizationType: z.enum(["broker", "red"]).optional(),
});

/**
 * WHY:   Domain services and routes share one typed verification submission payload.
 * WHAT:  TypeScript inference for verification submissions.
 * HOW:   Derived directly from `verificationRequestInputSchema`.
 */
export type VerificationRequestInput = z.infer<typeof verificationRequestInputSchema>;

export const propertyVerificationRequestInputSchema = z.object({
  propertyId: z.string().min(1),
  adLicenseNumber: z.string().trim().min(3),
  documents: z.array(uploadedFileReferenceSchema).min(1, "At least one document is required"),
  notes: z.string().trim().min(1).max(1000).optional(),
});

export type PropertyVerificationRequestInput = z.infer<typeof propertyVerificationRequestInputSchema>;
