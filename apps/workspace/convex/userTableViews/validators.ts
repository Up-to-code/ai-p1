import { v } from "convex/values";

export const userTableViewScopeValidator = v.union(
  v.literal("project"),
  v.literal("space"),
  v.literal("workspace"),
  v.literal("global"),
);

export const userTableViewConfigValidator = v.object({
  groupBy: v.optional(v.string()),
  sortBy: v.optional(v.string()),
  search: v.optional(v.string()),
  density: v.optional(v.union(v.literal("compact"), v.literal("normal"))),
  showFields: v.optional(v.boolean()),
  filters: v.optional(
    v.array(
      v.object({
        id: v.string(),
        field: v.string(),
        operator: v.string(),
        value: v.optional(v.any()),
      }),
    ),
  ),
  columnWidths: v.optional(v.record(v.string(), v.number())),
  columnVisibility: v.optional(v.record(v.string(), v.boolean())),
  columnOrder: v.optional(v.array(v.string())),
});

export const userTableViewValidator = v.object({
  _id: v.string(),
  _creationTime: v.number(),
  userId: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  resourceType: v.string(),
  viewType: v.string(),
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
  resourceType: v.string(),
  viewType: v.string(),
  scope: userTableViewScopeValidator,
  scopeKey: v.optional(v.string()),
  organizationId: v.optional(v.string()),
  projectId: v.optional(v.string()),
  spaceId: v.optional(v.string()),
  config: userTableViewConfigValidator,
  isDefault: v.optional(v.boolean()),
});

export const updateUserTableViewInputValidator = v.object({
  viewId: v.id("userTableViews"),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  config: v.optional(userTableViewConfigValidator),
  isDefault: v.optional(v.boolean()),
});
