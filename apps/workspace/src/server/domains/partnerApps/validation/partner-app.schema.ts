import { z } from "zod";
import { partnerAppScopes } from "@qentrah/partner-auth-core";

const partnerScopeSchema = z.enum(partnerAppScopes as [string, ...string[]]);

function isPrivateIpv4(hostname: string) {
  const parts = hostname.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b] = parts;
  return a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168);
}

function isPrivateHostname(hostname: string) {
  const normalized = hostname.toLowerCase();
  return normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized === "metadata.google.internal" ||
    isPrivateIpv4(normalized) ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:");
}

const webhookUrlSchema = z.string().url().superRefine((value, ctx) => {
  const url = new URL(value);
  if (url.protocol !== "https:") {
    ctx.addIssue({ code: "custom", message: "Webhook URLs must use HTTPS." });
  }
  if (url.username || url.password) {
    ctx.addIssue({ code: "custom", message: "Webhook URLs cannot include credentials." });
  }
  if (isPrivateHostname(url.hostname)) {
    ctx.addIssue({ code: "custom", message: "Webhook URLs cannot target local or private network hosts." });
  }
});

export const authorizePartnerConnectionSchema = z.object({
  partnersAppId: z.string().trim().min(1),
  partnersClientId: z.string().trim().min(1),
  redirectUri: z.string().url().optional(),
  scopes: z.array(partnerScopeSchema).min(1),
});

export const updatePartnerConnectionSchema = z.object({
  status: z.enum(["active", "paused"]),
});

export const createPartnerWebhookEndpointSchema = z.object({
  partnerAppId: z.string().trim().min(1),
  url: webhookUrlSchema,
  events: z.array(z.string().trim().min(1)).min(1),
});

export const inboundWebhookSchema = z.object({
  eventId: z.string().trim().min(1),
  eventType: z.string().trim().min(1),
  occurredAt: z.coerce.number(),
  data: z.unknown(),
});

export type AuthorizePartnerConnectionPayload = z.infer<typeof authorizePartnerConnectionSchema>;
export type UpdatePartnerConnectionPayload = z.infer<typeof updatePartnerConnectionSchema>;
export type CreatePartnerWebhookEndpointPayload = z.infer<typeof createPartnerWebhookEndpointSchema>;
