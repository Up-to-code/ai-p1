import { v } from "convex/values";

export const projectStatusValidator = v.union(
  v.literal("planned"),
  v.literal("active"),
  v.literal("paused"),
  v.literal("completed"),
  v.literal("archived"),
);

export const projectHealthValidator = v.union(v.literal("onTrack"), v.literal("atRisk"), v.literal("blocked"));
export const visibilityValidator = v.union(v.literal("private"), v.literal("team"), v.literal("workspace"));

export const projectInputValidator = v.object({
  name: v.string(),
  clientId: v.optional(v.id("clients")),
  opportunityId: v.optional(v.id("opportunities")),
  status: projectStatusValidator,
  health: projectHealthValidator,
  visibility: v.optional(visibilityValidator),
  teamMemberIds: v.optional(v.array(v.string())),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  budget: v.optional(v.number()),
  currency: v.optional(v.string()),
  description: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
});

export const projectValidator = v.object({
  _id: v.id("projects"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  name: v.string(),
  clientId: v.optional(v.id("clients")),
  opportunityId: v.optional(v.id("opportunities")),
  ownerUserId: v.string(),
  teamMemberIds: v.optional(v.array(v.string())),
  status: projectStatusValidator,
  health: projectHealthValidator,
  visibility: visibilityValidator,
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  budget: v.optional(v.number()),
  currency: v.optional(v.string()),
  description: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  customFields: v.optional(v.array(v.any())),
  coverImageUrl: v.optional(v.string()),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});
