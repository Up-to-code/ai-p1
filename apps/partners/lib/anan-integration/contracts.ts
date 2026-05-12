import { z } from "zod/v4";

export const ananIntegrationContractNames = [
  "partner.app_registration_sync.v1",
  "workspace.capability_discovery.v1",
  "workspace.authorization_status.v1",
  "partner.event_delivery.v1",
] as const;

export type AnanIntegrationContractName = (typeof ananIntegrationContractNames)[number];

export const partnerAppRegistrationSyncSchema = z.object({
  contract: z.literal("partner.app_registration_sync.v1"),
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

export const workspaceCapabilityDiscoverySchema = z.object({
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

export const partnerEventDeliverySchema = z.object({
  contract: z.literal("partner.event_delivery.v1"),
  idempotencyKey: z.string().min(8),
  workspaceId: z.string().min(1),
  clientId: z.string().min(1),
  eventType: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
  occurredAt: z.number().int().positive(),
});

export const ananIntegrationPayloadSchema = z.discriminatedUnion("contract", [
  partnerAppRegistrationSyncSchema,
  workspaceCapabilityDiscoverySchema,
  workspaceAuthorizationStatusSchema,
  partnerEventDeliverySchema,
]);

export type PartnerAppRegistrationSync = z.output<typeof partnerAppRegistrationSyncSchema>;
export type WorkspaceCapabilityDiscovery = z.output<typeof workspaceCapabilityDiscoverySchema>;
export type WorkspaceAuthorizationStatus = z.output<typeof workspaceAuthorizationStatusSchema>;
export type PartnerEventDelivery = z.output<typeof partnerEventDeliverySchema>;
export type AnanIntegrationPayload = z.output<typeof ananIntegrationPayloadSchema>;

export function parseAnanIntegrationPayload(input: unknown): AnanIntegrationPayload {
  return ananIntegrationPayloadSchema.parse(input);
}

export function buildIntegrationHeaders(input: {
  serviceToken: string;
  idempotencyKey?: string;
  source?: "partners";
}) {
  return {
    authorization: `Bearer ${input.serviceToken}`,
    "content-type": "application/json",
    "x-anan-source": input.source ?? "partners",
    ...(input.idempotencyKey ? { "idempotency-key": input.idempotencyKey } : {}),
  };
}
