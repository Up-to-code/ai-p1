import { v } from "convex/values";
import { recordStateValidator } from "../schema/validators";

export const leadStatusValidator = v.union(v.literal("new"), v.literal("qualified"), v.literal("disqualified"), v.literal("converted"));
export const leadValidator = v.object({
  _id: v.id("crmLeads"), _creationTime: v.number(), organizationId: v.string(), name: v.string(), email: v.optional(v.string()), encryptedEmail: v.optional(v.string()), emailFingerprint: v.optional(v.string()),
  phone: v.optional(v.string()), encryptedPhone: v.optional(v.string()), companyName: v.optional(v.string()), companyNameKey: v.optional(v.string()), source: v.string(), notes: v.optional(v.string()),
  estimatedValueMinor: v.optional(v.number()), currency: v.optional(v.string()), status: leadStatusValidator, ownerUserId: v.string(), convertedClientId: v.optional(v.id("clients")), convertedDealId: v.optional(v.id("deals")), convertedAt: v.optional(v.number()),
  recordState: recordStateValidator, createdByUserId: v.string(), createdAt: v.number(), updatedAt: v.number(), deletedAt: v.optional(v.number()),
});
export const companyValidator = v.object({
  _id: v.id("crmCompanies"), _creationTime: v.number(), organizationId: v.string(), clientId: v.optional(v.id("clients")), name: v.string(), nameKey: v.string(), website: v.optional(v.string()), industry: v.optional(v.string()),
  ownerUserId: v.string(), recordState: recordStateValidator, createdByUserId: v.string(), createdAt: v.number(), updatedAt: v.number(), deletedAt: v.optional(v.number()),
});
export const contactValidator = v.object({
  _id: v.id("crmContacts"), _creationTime: v.number(), organizationId: v.string(), clientId: v.optional(v.id("clients")), companyId: v.optional(v.id("crmCompanies")), name: v.string(), title: v.optional(v.string()),
  email: v.optional(v.string()), encryptedEmail: v.optional(v.string()), emailFingerprint: v.optional(v.string()), phone: v.optional(v.string()), encryptedPhone: v.optional(v.string()),
  ownerUserId: v.string(), recordState: recordStateValidator, createdByUserId: v.string(), createdAt: v.number(), updatedAt: v.number(), deletedAt: v.optional(v.number()),
});
