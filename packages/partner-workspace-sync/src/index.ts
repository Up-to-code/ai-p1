import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const partnerSyncStatuses = ["draft", "pending_review", "active", "rejected", "suspended"] as const;
export const workspaceAuthorizationStatuses = ["active", "paused", "revoked"] as const;

export const publishedPartnerAppSchema = z.object({
  id: z.string().min(1),
  clientId: z.string().min(1),
  name: z.string().min(1),
  publisherName: z.string().min(1),
  description: z.string().min(1),
  homepageUrl: z.string().url().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  iconUrl: z.string().url().optional().nullable(),
  clientType: z.enum(["public", "confidential"]),
  redirectUris: z.array(z.string().url()).min(1),
  allowedScopes: z.array(z.string().min(1)).min(1),
  status: z.literal("active"),
  updatedAt: z.number(),
});

export const publishedPartnerAppsResponseSchema = z.object({
  apps: z.array(publishedPartnerAppSchema),
  nextCursor: z.string().optional(),
  isDone: z.boolean(),
});

export const partnerAuthorizationVerificationRequestSchema = z.object({
  partnersAppId: z.string().min(1),
  partnersClientId: z.string().min(1),
  redirectUri: z.string().url().optional(),
  scopes: z.array(z.string().min(1)).min(1),
});

export const partnerAuthorizationVerificationResponseSchema = z.object({
  allowed: z.boolean(),
  reason: z.string().optional(),
  app: publishedPartnerAppSchema.optional(),
});

export const partnerReviewRequestSchema = z.object({
  status: z.enum(["approved", "rejected", "suspended"]),
  reviewNotes: z.string().trim().optional(),
});

export const oauthRuntimeProjectionStatusSchema = z.enum(["approved", "rejected", "suspended"]);

export const oauthRuntimeProjectionInputSchema = z.object({
  partnersAppId: z.string().trim().min(1),
  partnersClientId: z.string().trim().min(1),
  name: z.string().trim().min(2),
  publisherName: z.string().trim().min(2),
  description: z.string().trim().min(1),
  homepageUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  redirectUris: z.array(z.string().url()).min(1),
  allowedScopes: z.array(z.string().trim().min(1)).min(1),
  clientType: z.enum(["public", "confidential"]),
  status: oauthRuntimeProjectionStatusSchema,
});

export const oauthRuntimeProjectionResponseSchema = z.object({
  runtime: z.object({
    partnersAppId: z.string().min(1),
    clientId: z.string().min(1),
    status: oauthRuntimeProjectionStatusSchema,
  }),
});

export const partnerPlatformWebhookEventSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "partner_app.published",
    "partner_app.suspended",
    "partner_app.unpublished",
    "partner_app.scopes_changed",
  ]),
  partnersAppId: z.string().min(1),
  occurredAt: z.number(),
  app: publishedPartnerAppSchema.optional(),
});

export type PublishedPartnerApp = z.infer<typeof publishedPartnerAppSchema>;
export type PublishedPartnerAppsResponse = z.infer<typeof publishedPartnerAppsResponseSchema>;
export type PartnerAuthorizationVerificationRequest = z.infer<typeof partnerAuthorizationVerificationRequestSchema>;
export type PartnerAuthorizationVerificationResponse = z.infer<typeof partnerAuthorizationVerificationResponseSchema>;
export type PartnerReviewRequest = z.infer<typeof partnerReviewRequestSchema>;
export type OAuthRuntimeProjectionStatus = z.infer<typeof oauthRuntimeProjectionStatusSchema>;
export type OAuthRuntimeProjectionInput = z.infer<typeof oauthRuntimeProjectionInputSchema>;
export type OAuthRuntimeProjectionResponse = z.infer<typeof oauthRuntimeProjectionResponseSchema>;
export type PartnerPlatformWebhookEvent = z.infer<typeof partnerPlatformWebhookEventSchema>;

const legacyWorkspaceScopeMap: Record<string, string | null> = {
  "clients:read_own": "client:read",
  "properties:read_own": "property:read",
  "organization:read_own": "organization:read",
  openid: null,
  profile: null,
  email: null,
  offline_access: null,
};

export function projectOAuthRuntimeStatus(status: string): OAuthRuntimeProjectionStatus {
  if (status === "active" || status === "approved") return "approved";
  if (status === "suspended") return "suspended";
  if (status === "rejected") return "rejected";
  return "approved";
}

export function normalizeOAuthRuntimeScopes(scopes: Iterable<string>) {
  return Array.from(
    new Set(
      Array.from(scopes)
        .map((scope) => scope.trim())
        .map((scope) => (Object.hasOwn(legacyWorkspaceScopeMap, scope) ? legacyWorkspaceScopeMap[scope] : scope))
        .filter((scope): scope is string => Boolean(scope)),
    ),
  );
}

export function buildOAuthRuntimeProjectionInput(app: {
  id: string;
  clientId: string;
  name: string;
  publisherName: string;
  description?: string | null;
  homepageUrl?: string | null;
  iconUrl?: string | null;
  logoUrl?: string | null;
  clientType: "public" | "confidential";
  redirectUris: string[];
  allowedScopes: string[];
  status: string;
}): OAuthRuntimeProjectionInput {
  return oauthRuntimeProjectionInputSchema.parse({
    partnersAppId: app.id,
    partnersClientId: app.clientId,
    name: app.name,
    publisherName: app.publisherName,
    description: app.description || `${app.publisherName} partner app.`,
    homepageUrl: app.homepageUrl ?? undefined,
    logoUrl: app.logoUrl ?? app.iconUrl ?? undefined,
    redirectUris: app.redirectUris,
    allowedScopes: normalizeOAuthRuntimeScopes(app.allowedScopes),
    clientType: app.clientType,
    status: projectOAuthRuntimeStatus(app.status),
  });
}

export class PartnerSyncError extends Error {
  constructor(
    public readonly code:
      | "PartnerCatalogUnavailable"
      | "PartnerAppNotPublished"
      | "PartnerScopeDenied"
      | "PartnerRedirectUriMismatch"
      | "PartnerSyncRateLimited"
      | "PartnerSyncSignatureInvalid",
    message: string,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = code;
  }
}

export function createIdempotencyKey(prefix = "partner_sync") {
  return `${prefix}:${randomUUID()}`;
}

export function rateLimitKey(...parts: Array<string | number | undefined | null>) {
  return parts.filter((part) => part !== undefined && part !== null && String(part).trim()).map((part) => String(part).trim()).join(":");
}

export function retryDelayMs(attempt: number, baseMs = 250, maxMs = 5000) {
  const capped = Math.min(Math.max(attempt, 0), 8);
  return Math.min(maxMs, baseMs * 2 ** capped);
}

export function signPayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyPayloadSignature(payload: string, signature: string, secret: string) {
  if (!signature || !secret) return false;
  const expected = signPayload(payload, secret);
  const suppliedBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  if (suppliedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(suppliedBuffer, expectedBuffer);
}

const sensitiveKeys = /authorization|token|secret|password|clientSecret|client_secret|cookie|signature/iu;

export function redactForPartnerSyncLog(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactForPartnerSyncLog);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        sensitiveKeys.test(key) ? "[redacted]" : redactForPartnerSyncLog(entry),
      ]),
    );
  }
  if (typeof value === "string") {
    return value.replace(/([?&](?:code|token|client_secret|state)=)[^&]+/giu, "$1[redacted]");
  }
  return value;
}

export function partnerSyncLog(event: string, payload: Record<string, unknown>) {
  return {
    event,
    ...redactForPartnerSyncLog(payload) as Record<string, unknown>,
  };
}
