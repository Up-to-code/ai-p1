import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// App tables are organization-scoped so user identity never owns business data directly.
export default defineSchema({
  organizations: defineTable({
    organizationId: v.string(),
    name: v.string(),
    legalName: v.string(),
    type: v.string(),
    email: v.string(),
    phone: v.string(),
    website: v.string(),
    address: v.string(),
    updatedAt: v.number(),
  }).index("by_organization_id", ["organizationId"]),
  organizationAuditEvents: defineTable({
    organizationId: v.string(),
    actorUserId: v.string(),
    action: v.string(),
    target: v.string(),
    summary: v.string(),
    createdAt: v.number(),
  }).index("by_organization_id", ["organizationId"]),
});
