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
export const savedViewSharingModeValidator = v.union(
  v.literal("personal"),
  v.literal("shared"),
  v.literal("protected"),
);
export const savedViewGrantInputValidator = v.object({
  principalType: v.union(v.literal("user"), v.literal("team")),
  principalId: v.string(),
  access: v.union(v.literal("read"), v.literal("configure")),
});
export const savedViewGrantValidator = v.object({
  principalType: v.union(v.literal("user"), v.literal("team")),
  principalId: v.string(),
  access: v.union(v.literal("read"), v.literal("configure")),
});

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
  sharingMode: savedViewSharingModeValidator,
  revision: v.number(),
  canConfigure: v.boolean(),
  canShare: v.boolean(),
  canDelete: v.boolean(),
  canSetDefault: v.boolean(),
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
  sharingMode: v.optional(savedViewSharingModeValidator),
});

export const updateUserTableViewInputValidator = v.object({
  viewId: v.id("savedViews"),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  config: v.optional(userTableViewConfigValidator),
  isDefault: v.optional(v.boolean()),
});
