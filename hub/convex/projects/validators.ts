import { v } from "convex/values";

export const projectStatusValidator = v.union(
  v.literal("draft"),
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
);

export const projectInputValidator = v.object({
  name: v.string(),
  developer: v.string(),
  city: v.string(),
  area: v.string(),
  type: v.string(),
  status: projectStatusValidator,
  units: v.number(),
  priceRange: v.string(),
  description: v.string(),
});

export const projectValidator = v.object({
  _id: v.id("projects"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  name: v.string(),
  reference: v.string(),
  developer: v.string(),
  city: v.string(),
  area: v.string(),
  type: v.string(),
  status: projectStatusValidator,
  syncState: v.union(v.literal("draft"), v.literal("blocked"), v.literal("synced")),
  units: v.number(),
  priceRange: v.string(),
  description: v.string(),
  coverImageUrl: v.optional(v.string()),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});
