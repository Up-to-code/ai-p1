import { v } from "convex/values";
import {
  savedViewConfigValidator,
  viewTypeValidator,
  workOsRecordResourceValidator,
} from "../schema/validators";

export const userTableViewScopeValidator = v.union(
  v.literal("project"),
  v.literal("space"),
  v.literal("workspace"),
  v.literal("global"),
);

export const userTableViewConfigValidator = savedViewConfigValidator;

export const userTableViewValidator = v.object({
  _id: v.id("savedViews"),
  _creationTime: v.number(),
  userId: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  resourceType: workOsRecordResourceValidator,
  viewType: viewTypeValidator,
  scope: userTableViewScopeValidator,
  scopeKey: v.optional(v.string()),
  organizationId: v.optional(v.string()),
  projectId: v.optional(v.string()),
  spaceId: v.optional(v.string()),
  config: userTableViewConfigValidator,
  isDefault: v.optional(v.boolean()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const createUserTableViewInputValidator = v.object({
  name: v.string(),
  description: v.optional(v.string()),
  resourceType: workOsRecordResourceValidator,
  viewType: viewTypeValidator,
  scope: userTableViewScopeValidator,
  scopeKey: v.optional(v.string()),
  organizationId: v.optional(v.string()),
  projectId: v.optional(v.string()),
  spaceId: v.optional(v.string()),
  config: userTableViewConfigValidator,
  isDefault: v.optional(v.boolean()),
});

export const updateUserTableViewInputValidator = v.object({
  viewId: v.id("savedViews"),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  config: v.optional(userTableViewConfigValidator),
  isDefault: v.optional(v.boolean()),
});
