import { z } from "zod/v4";

const qentrahIntegrationContractNames = [
  "partner.oauth_runtime_sync.v1",
  "workspace.capability_discovery.v1",
  "workspace.authorization_status.v1",
  "partner.event_delivery.v1",
] as const;

type QentrahIntegrationContractName = (typeof qentrahIntegrationContractNames)[number];

export const partnerOAuthRuntimeSyncSchema = z.object({
  contract: z.literal("partner.oauth_runtime_sync.v1"),
  idempotencyKey: z.string().min(8),
  partnerAppId: z.string().min(1),
  clientId: z.string().min(1),
  clientSecretHash: z.string().min(1).optional(),
  name: z.string().min(2),
  publisherName: z.string().min(2),
  homepageUrl: z.string().url().optional(),
  iconUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  clientType: z.enum(["public", "confidential"]),
  redirectUris: z.array(z.string().url()).min(1),
  allowedScopes: z.array(z.string().min(1)).min(1),
  trusted: z.boolean(),
  isActive: z.boolean(),
  occurredAt: z.number().int().positive(),
}).strict();

const workspaceCapabilityDiscoverySchema = z.object({
  contract: z.literal("workspace.capability_discovery.v1"),
  workspaceId: z.string().min(1),
  clientId: z.string().min(1),
  requestedScopes: z.array(z.string().min(1)).min(1),
});

export const workspaceAuthorizationStatusSchema = z.object({
  contract: z.literal("workspace.authorization_status.v1"),
  workspaceId: z.string().min(1),
  clientId: z.string().min(1),
  status: z.enum(["missing", "pending", "active", "denied", "revoked", "expired"]),
  grantedScopes: z.array(z.string().min(1)),
  expiresAt: z.number().int().positive().optional(),
});

const partnerEventDeliverySchema = z.object({
  contract: z.literal("partner.event_delivery.v1"),
  idempotencyKey: z.string().min(8),
  workspaceId: z.string().min(1),
  clientId: z.string().min(1),
  eventType: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
  occurredAt: z.number().int().positive(),
});

const qentrahIntegrationPayloadSchema = z.discriminatedUnion("contract", [
  partnerOAuthRuntimeSyncSchema,
  workspaceCapabilityDiscoverySchema,
  workspaceAuthorizationStatusSchema,
  partnerEventDeliverySchema,
]);

type PartnerOAuthRuntimeSync = z.output<typeof partnerOAuthRuntimeSyncSchema>;
type WorkspaceCapabilityDiscovery = z.output<typeof workspaceCapabilityDiscoverySchema>;
type WorkspaceAuthorizationStatus = z.output<typeof workspaceAuthorizationStatusSchema>;
type PartnerEventDelivery = z.output<typeof partnerEventDeliverySchema>;
export type QentrahIntegrationPayload = z.output<typeof qentrahIntegrationPayloadSchema>;

export function parseQentrahIntegrationPayload(input: unknown): QentrahIntegrationPayload {
  return qentrahIntegrationPayloadSchema.parse(input);
}

export function buildIntegrationHeaders(input: {
  serviceToken: string;
  idempotencyKey?: string;
  source?: "partners";
}) {
  return {
    authorization: `Bearer ${input.serviceToken}`,
    "content-type": "application/json",
    "x-qentrah-source": input.source ?? "partners",
    ...(input.idempotencyKey ? { "idempotency-key": input.idempotencyKey } : {}),
  };
}
