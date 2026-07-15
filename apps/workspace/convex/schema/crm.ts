import { defineTable } from "convex/server";
import { v } from "convex/values";
import { leadStatusValidator } from "../crm/validators";
import { recordStateValidator } from "./validators";

const owned = { ownerUserId: v.string(), recordState: recordStateValidator, createdByUserId: v.string(), createdAt: v.number(), updatedAt: v.number(), deletedAt: v.optional(v.number()) };

export const crmTables = {
  crmLeads: defineTable({
    organizationId: v.string(), name: v.string(), email: v.optional(v.string()), encryptedEmail: v.optional(v.string()), emailFingerprint: v.optional(v.string()),
    phone: v.optional(v.string()), encryptedPhone: v.optional(v.string()), companyName: v.optional(v.string()), companyNameKey: v.optional(v.string()), source: v.string(), notes: v.optional(v.string()),
    estimatedValueMinor: v.optional(v.number()), currency: v.optional(v.string()), status: leadStatusValidator, convertedClientId: v.optional(v.id("clients")), convertedDealId: v.optional(v.id("deals")), convertedAt: v.optional(v.number()), ...owned,
  }).index("by_org_status_updated", ["organizationId", "status", "recordState", "updatedAt"])
    .index("by_org_email", ["organizationId", "emailFingerprint"])
    .index("by_org_company", ["organizationId", "companyNameKey"]),
  crmCompanies: defineTable({
    organizationId: v.string(), clientId: v.optional(v.id("clients")), name: v.string(), nameKey: v.string(), website: v.optional(v.string()), industry: v.optional(v.string()), ...owned,
  }).index("by_org_name", ["organizationId", "nameKey"])
    .index("by_org_state_updated", ["organizationId", "recordState", "updatedAt"])
    .index("by_client", ["organizationId", "clientId"]),
  crmContacts: defineTable({
    organizationId: v.string(), clientId: v.optional(v.id("clients")), companyId: v.optional(v.id("crmCompanies")), name: v.string(), title: v.optional(v.string()),
    email: v.optional(v.string()), encryptedEmail: v.optional(v.string()), emailFingerprint: v.optional(v.string()), phone: v.optional(v.string()), encryptedPhone: v.optional(v.string()), ...owned,
  }).index("by_org_email", ["organizationId", "emailFingerprint"])
    .index("by_org_state_updated", ["organizationId", "recordState", "updatedAt"])
    .index("by_company", ["organizationId", "companyId", "recordState"])
    .index("by_client", ["organizationId", "clientId"]),
};
