import { v } from "convex/values";
import { recordStateValidator } from "../schema/validators";

export const dealStageValidator = v.union(
  v.literal("lead"),
  v.literal("qualified"),
  v.literal("proposal_sent"),
  v.literal("contract_sent"),
  v.literal("won"),
  v.literal("lost"),
);

export const dealStatusValidator = v.union(
  v.literal("open"),
  v.literal("won"),
  v.literal("lost"),
  v.literal("paused"),
);

export const dealPriorityValidator = v.union(
  v.literal("low"),
  v.literal("normal"),
  v.literal("high"),
  v.literal("urgent"),
);

export const dealInputValidator = v.object({
  title: v.string(),
  clientId: v.optional(v.id("clients")),
  projectId: v.optional(v.id("projects")),
  stage: dealStageValidator,
  status: dealStatusValidator,
  value: v.optional(v.number()),
  currency: v.optional(v.string()),
  dealThinking: v.optional(v.string()),
  source: v.optional(v.string()),
  priority: dealPriorityValidator,
  closeDate: v.optional(v.string()),
  nextStep: v.optional(v.string()),
  ownerUserId: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
});

export const dealValidator = v.object({
  _id: v.id("deals"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  title: v.string(),
  clientId: v.optional(v.id("clients")),
  projectId: v.optional(v.id("projects")),
  stage: dealStageValidator,
  status: dealStatusValidator,
  value: v.optional(v.number()),
  currency: v.optional(v.string()),
  dealThinking: v.optional(v.string()),
  source: v.optional(v.string()),
  priority: dealPriorityValidator,
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
