import { z } from "zod";
import { partnerAppScopes } from "@/packages/partner-apps/scopes";

const partnerScopeSchema = z.enum(partnerAppScopes as [string, ...string[]]);

export const createPartnerAppSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  homepageUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  redirectUris: z.array(z.string().url()).min(1),
  scopes: z.array(partnerScopeSchema).min(1),
});

export const reviewPartnerAppSchema = z.object({
  status: z.enum(["approved", "rejected", "suspended"]),
  reviewNotes: z.string().trim().optional().transform((value) => value || undefined),
});

export const authorizePartnerConnectionSchema = z.object({
  oauthClientId: z.string().trim().min(1),
  scopes: z.array(partnerScopeSchema).min(1),
});

export const updatePartnerConnectionSchema = z.object({
  status: z.enum(["active", "paused"]),
});

export const createPartnerWebhookEndpointSchema = z.object({
  partnerAppId: z.string().trim().min(1),
  url: z.string().url(),
  events: z.array(z.string().trim().min(1)).min(1),
});

export const inboundWebhookSchema = z.object({
  eventId: z.string().trim().min(1),
  eventType: z.string().trim().min(1),
  occurredAt: z.coerce.number(),
  data: z.unknown(),
});

export type CreatePartnerAppPayload = z.infer<typeof createPartnerAppSchema>;
export type ReviewPartnerAppPayload = z.infer<typeof reviewPartnerAppSchema>;
export type AuthorizePartnerConnectionPayload = z.infer<typeof authorizePartnerConnectionSchema>;
export type UpdatePartnerConnectionPayload = z.infer<typeof updatePartnerConnectionSchema>;
export type CreatePartnerWebhookEndpointPayload = z.infer<typeof createPartnerWebhookEndpointSchema>;
export type InboundWebhookPayload = z.infer<typeof inboundWebhookSchema>;
