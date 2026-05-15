import { v } from "convex/values";

export const projectStatusValidator = v.union(
  v.literal("draft"),
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
);

export const visibilityValidator = v.union(v.literal("private"), v.literal("public"));

export const projectPriceItemValidator = v.object({
  id: v.string(),
  label: v.string(),
  price: v.string(),
});

export const projectInputValidator = v.object({
  name: v.string(),
  developer: v.string(),
  city: v.string(),
  area: v.string(),
  type: v.string(),
  unitTypes: v.optional(v.array(v.string())),
  status: projectStatusValidator,
  visibility: v.optional(visibilityValidator),
  units: v.number(),
  priceRange: v.string(),
  averagePrice: v.optional(v.string()),
  projectPrices: v.optional(v.array(projectPriceItemValidator)),
  regaAuthorizationNo: v.optional(v.string()),
  regaExpiresAt: v.optional(v.string()),
  planNumber: v.optional(v.string()),
  plotNumber: v.optional(v.string()),
  postalIdentity: v.optional(v.string()),
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
  unitTypes: v.optional(v.array(v.string())),
  status: projectStatusValidator,
  visibility: visibilityValidator,
  syncState: v.union(v.literal("draft"), v.literal("blocked"), v.literal("synced")),
  units: v.number(),
  priceRange: v.string(),
  averagePrice: v.optional(v.string()),
  projectPrices: v.optional(v.array(projectPriceItemValidator)),
  regaAuthorizationNo: v.optional(v.string()),
  regaExpiresAt: v.optional(v.string()),
  planNumber: v.optional(v.string()),
  plotNumber: v.optional(v.string()),
  postalIdentity: v.optional(v.string()),
  description: v.string(),
  coverImageUrl: v.optional(v.string()),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});
