import { v } from "convex/values";

export const organizationAuditCategoryValidator = v.union(
  v.literal("organization"),
  v.literal("people"),
  v.literal("roles"),
  v.literal("projects"),
  v.literal("properties"),
  v.literal("media"),
  v.literal("invites"),
);

export const organizationAuditEventValidator = v.object({
  id: v.string(),
  actorUserId: v.string(),
  action: v.string(),
  category: organizationAuditCategoryValidator,
  target: v.string(),
  summary: v.string(),
  createdAt: v.number(),
});

export const recordOrganizationAuditEventInputValidator = v.object({
  action: v.string(),
  target: v.string(),
  summary: v.string(),
});
