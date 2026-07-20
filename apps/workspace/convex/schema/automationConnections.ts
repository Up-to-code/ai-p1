import { defineTable } from "convex/server";
import { v } from "convex/values";

export const automationConnectionProviderValidator = v.union(
  v.literal("google_sheets"),
  v.literal("whatsapp"),
);

export const automationConnectionTables = {
  automationConnections: defineTable({
    organizationId: v.string(),
    ownerUserId: v.string(),
    provider: automationConnectionProviderValidator,
    label: v.string(),
    accountLabel: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("revoked")),
    encryptedCredentials: v.string(),
    credentialIv: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastUsedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
  })
    .index("by_owner_organization_provider", [
      "ownerUserId",
      "organizationId",
      "provider",
    ])
    .index("by_organization_status", ["organizationId", "status"]),
};
