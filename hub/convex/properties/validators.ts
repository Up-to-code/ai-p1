import { v } from "convex/values";

export const propertyStatusValidator = v.union(
  v.literal("available"),
  v.literal("sold"),
  v.literal("reserved"),
  v.literal("pending"),
  v.literal("draft"),
);

export const propertyInputValidator = v.object({
  title: v.string(),
  projectId: v.optional(v.id("projects")),
  project: v.string(),
  city: v.string(),
  type: v.string(),
  status: propertyStatusValidator,
  purpose: v.union(v.literal("sale"), v.literal("rent")),
  price: v.string(),
  area: v.string(),
  bedrooms: v.number(),
  bathrooms: v.number(),
  description: v.string(),
});

export const propertyUnitValidator = v.object({
  _id: v.id("propertyUnits"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  title: v.string(),
  reference: v.string(),
  projectId: v.optional(v.id("projects")),
  project: v.string(),
  city: v.string(),
  type: v.string(),
  status: propertyStatusValidator,
  purpose: v.union(v.literal("sale"), v.literal("rent")),
  price: v.string(),
  area: v.string(),
  bedrooms: v.number(),
  bathrooms: v.number(),
  description: v.string(),
  coverImageUrl: v.optional(v.string()),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});
