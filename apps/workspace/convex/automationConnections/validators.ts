import { v } from "convex/values";
import { automationConnectionProviderValidator } from "../schema/automationConnections";

export const automationConnectionSummaryValidator = v.object({
  id: v.id("automationConnections"),
  organizationId: v.string(),
  provider: automationConnectionProviderValidator,
  label: v.string(),
  accountLabel: v.optional(v.string()),
  status: v.union(v.literal("active"), v.literal("revoked")),
  createdAt: v.number(),
  updatedAt: v.number(),
  lastUsedAt: v.optional(v.number()),
});

export const googleSheetsCredentialsValidator = v.object({
  accessToken: v.optional(v.string()),
  refreshToken: v.optional(v.string()),
  clientId: v.optional(v.string()),
  clientSecret: v.optional(v.string()),
});

export const whatsappCredentialsValidator = v.object({
  accessToken: v.string(),
  phoneNumberId: v.string(),
});

export const connectionSecretValidator = v.union(
  v.object({
    provider: v.literal("google_sheets"),
    credentials: googleSheetsCredentialsValidator,
  }),
  v.object({
    provider: v.literal("whatsapp"),
    credentials: whatsappCredentialsValidator,
  }),
);
