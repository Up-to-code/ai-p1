import { v } from "convex/values";

export const clientTypeValidator = v.union(
  v.literal("Buyer"),
  v.literal("Tenant"),
  v.literal("Investor"),
  v.literal("Broker"),
);

export const clientStatusValidator = v.union(
  v.literal("active"),
  v.literal("inactive"),
);

export const clientPipelineStageValidator = v.union(
  v.literal("new"),
  v.literal("qualified"),
  v.literal("viewing"),
  v.literal("negotiation"),
  v.literal("closed"),
);

export const clientPriorityValidator = v.union(
  v.literal("normal"),
  v.literal("high"),
  v.literal("urgent"),
);

export const visibilityValidator = v.union(v.literal("private"), v.literal("public"));

export const clientInputValidator = v.object({
  name: v.string(),
  type: clientTypeValidator,
  contact: v.string(),
  phone: v.string(),
  age: v.number(),
  nationality: v.string(),
  generation: v.string(),
  budget: v.string(),
  propertyInterest: v.string(),
  status: clientStatusValidator,
  visibility: v.optional(visibilityValidator),
  pipelineStage: clientPipelineStageValidator,
  priority: clientPriorityValidator,
  nextAction: v.string(),
  issue: v.optional(v.string()),
});

export const clientValidator = v.object({
  _id: v.id("clients"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  name: v.string(),
  type: clientTypeValidator,
  contact: v.string(),
  phone: v.string(),
  age: v.number(),
  nationality: v.string(),
  generation: v.string(),
  budget: v.string(),
  propertyInterest: v.string(),
  status: clientStatusValidator,
  visibility: visibilityValidator,
  pipelineStage: clientPipelineStageValidator,
  priority: clientPriorityValidator,
  nextAction: v.string(),
  nextActionDate: v.string(),
  appointmentTime: v.string(),
  added: v.string(),
  lastContact: v.string(),
  syncState: v.union(v.literal("draft"), v.literal("eligible"), v.literal("synced"), v.literal("blocked"), v.literal("failed")),
  issue: v.optional(v.string()),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const clientUnitLinkStatusValidator = v.union(
  v.literal("interested"),
  v.literal("shortlisted"),
  v.literal("viewing"),
  v.literal("offer"),
  v.literal("rejected"),
);

export const clientUnitLinkInputValidator = v.object({
  clientId: v.id("clients"),
  propertyId: v.id("propertyUnits"),
  status: clientUnitLinkStatusValidator,
  notes: v.optional(v.string()),
});

export const clientUnitLinkValidator = v.object({
  _id: v.id("clientUnitLinks"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  clientId: v.id("clients"),
  propertyId: v.id("propertyUnits"),
  status: clientUnitLinkStatusValidator,
  notes: v.optional(v.string()),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});
