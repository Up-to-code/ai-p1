import { defineTable } from "convex/server";
import { v } from "convex/values";
import { workOsCustomFieldValueValidator } from "./shared";

export const clientTables = {
  clients: defineTable({
    organizationId: v.string(),
    name: v.string(),
    type: v.union(v.literal("person"), v.literal("organization")),
    ownerUserId: v.string(),
    status: v.union(v.literal("new"), v.literal("active"), v.literal("nurture"), v.literal("inactive"), v.literal("archived")),
    pipelineStage: v.optional(v.string()),
    pipelineOrder: v.optional(v.number()),
    source: v.string(),
    company: v.optional(v.string()),
    contactName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    customFields: v.optional(v.array(workOsCustomFieldValueValidator)),
    encryptedEmail: v.optional(v.string()),
    encryptedPhone: v.optional(v.string()),
    piiEncryptedAt: v.optional(v.number()),
    visibility: v.optional(v.union(v.literal("private"), v.literal("team"), v.literal("workspace"))),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_type", ["organizationId", "type"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_organization_owner", ["organizationId", "ownerUserId"])
    .index("by_organization_deleted_updated", ["organizationId", "isDeleted", "updatedAt"])
    .index("by_organization_deleted_type_updated", ["organizationId", "isDeleted", "type", "updatedAt"])
    .index("by_organization_updated", ["organizationId", "updatedAt"])
    .index("by_updated", ["updatedAt"]),
};
