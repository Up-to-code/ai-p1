import { v } from "convex/values";
import { recordStateValidator } from "../schema/validators";

export const opportunityPriorityValidator = v.union(
  v.literal("low"),
  v.literal("normal"),
  v.literal("high"),
  v.literal("urgent"),
);

export const opportunityStageValidator = v.union(
  v.literal("new"),
  v.literal("qualified"),
  v.literal("proposal"),
  v.literal("negotiation"),
  v.literal("won"),
  v.literal("lost"),
);

export const opportunityStatusValidator = v.union(
  v.literal("open"),
  v.literal("won"),
  v.literal("lost"),
  v.literal("paused"),
);

export const opportunityInputValidator = v.object({
  title: v.string(),
  clientId: v.optional(v.id("clients")),
  projectId: v.optional(v.id("projects")),
  stage: opportunityStageValidator,
  status: opportunityStatusValidator,
  value: v.optional(v.number()),
  currency: v.optional(v.string()),
  source: v.optional(v.string()),
  priority: opportunityPriorityValidator,
  closeDate: v.optional(v.string()),
  nextStep: v.optional(v.string()),
  ownerUserId: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
});

export const opportunityValidator = v.object({
  _id: v.id("opportunities"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  title: v.string(),
  clientId: v.optional(v.id("clients")),
  projectId: v.optional(v.id("projects")),
  stage: opportunityStageValidator,
  status: opportunityStatusValidator,
  value: v.optional(v.number()),
  currency: v.optional(v.string()),
  source: v.optional(v.string()),
  priority: opportunityPriorityValidator,
  closeDate: v.optional(v.string()),
  nextStep: v.optional(v.string()),
  ownerUserId: v.string(),
  tags: v.optional(v.array(v.string())),
  customFields: v.optional(v.array(v.any())),
  recordState: recordStateValidator,
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  closedAt: v.optional(v.number()),
});
