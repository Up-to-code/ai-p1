import { z } from "zod";
import { partnerAppScopes } from "@/packages/partner-apps/scopes";

const partnerScopeSchema = z.enum(partnerAppScopes as [string, ...string[]]);

export const partnerAppRegistrationSchema = z.object({
  partnersAppId: z.string().trim().min(1),
  partnersClientId: z.string().trim().min(1),
  name: z.string().trim().min(2),
  publisherName: z.string().trim().min(2),
  description: z.string().trim().min(1),
  homepageUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  redirectUris: z.array(z.string().url()).min(1),
  allowedScopes: z.array(partnerScopeSchema).min(1),
  clientType: z.enum(["public", "confidential"]),
  callbackUrl: z.string().url().optional(),
});

export const adminReviewPartnerAppSchema = z.object({
  status: z.enum(["approved", "rejected", "suspended"]),
  reviewNotes: z.string().trim().optional().transform((value) => value || undefined),
});

export type PartnerAppRegistrationPayload = z.infer<typeof partnerAppRegistrationSchema>;
export type AdminReviewPartnerAppPayload = z.infer<typeof adminReviewPartnerAppSchema>;
