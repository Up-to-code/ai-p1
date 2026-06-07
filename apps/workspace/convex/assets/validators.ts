import { v } from "convex/values";

export const assetStatusValidator = v.union(
  v.literal("available"),
  v.literal("pending"),
  v.literal("reserved"),
  v.literal("sold"),
  v.literal("draft"),
  v.literal("active"),
  v.literal("review"),
  v.literal("approved"),
  v.literal("archived"),
);

export const visibilityValidator = v.union(v.literal("private"), v.literal("team"), v.literal("workspace"));

export const assetInputValidator = v.object({
  name: v.string(),
  projectId: v.optional(v.id("projects")),
  project: v.string(),
  type: v.string(),
  status: assetStatusValidator,
  visibility: v.optional(visibilityValidator),
  fileId: v.optional(v.string()),
  url: v.optional(v.string()),
  description: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  metadata: v.optional(v.any()),
});

export const assetValidator = v.object({
  _id: v.id("assets"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  name: v.string(),
  title: v.string(),
  reference: v.string(),
  projectId: v.optional(v.id("projects")),
  project: v.string(),
  city: v.string(),
  type: v.string(),
  status: assetStatusValidator,
  ownerUserId: v.string(),
  visibility: visibilityValidator,
  fileId: v.optional(v.string()),
  url: v.optional(v.string()),
  description: v.optional(v.string()),
  metadata: v.optional(v.any()),
  tags: v.optional(v.array(v.string())),
  customFields: v.optional(v.array(v.any())),
  coverImageUrl: v.optional(v.string()),
  image: v.optional(v.string()),
  price: v.string(),
  area: v.string(),
  bedrooms: v.union(v.number(), v.string()),
  bathrooms: v.number(),
  purpose: v.union(v.literal("sale"), v.literal("rent")),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});
