import { v } from "convex/values";

export const mcpResourceValidator = v.union(
  v.literal("organization"),
  v.literal("member"),
  v.literal("client"),
  v.literal("property"),
  v.literal("project"),
  v.literal("calendar"),
  v.literal("task"),
  v.literal("integration"),
  v.literal("media"),
);

export const mcpActionValidator = v.union(
  v.literal("read"),
  v.literal("create"),
  v.literal("update"),
  v.literal("delete"),
);

export const mcpPermissionValidator = v.object({
  resource: mcpResourceValidator,
  actions: v.array(mcpActionValidator),
});

export const createMcpConnectionInputValidator = v.object({
  name: v.string(),
  instructions: v.optional(v.string()),
  permissions: v.array(mcpPermissionValidator),
  expiresAt: v.optional(v.number()),
});

export const updateMcpConnectionInputValidator = v.object({
  name: v.optional(v.string()),
  instructions: v.optional(v.string()),
  permissions: v.optional(v.array(mcpPermissionValidator)),
  status: v.optional(v.union(v.literal("active"), v.literal("paused"), v.literal("draft"))),
  expiresAt: v.optional(v.union(v.number(), v.null())),
});

export const mcpConnectionValidator = v.object({
  _id: v.id("organizationMcpConnections"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  publicId: v.string(),
  keyId: v.string(),
  keyLast4: v.string(),
  name: v.string(),
  instructions: v.optional(v.string()),
  permissions: v.array(mcpPermissionValidator),
  status: v.union(v.literal("active"), v.literal("paused"), v.literal("draft"), v.literal("revoked")),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  lastUsedAt: v.optional(v.number()),
  expiresAt: v.optional(v.number()),
  usageCount: v.number(),
  revokedAt: v.optional(v.number()),
});

export type McpResource =
  | "organization"
  | "member"
  | "client"
  | "property"
  | "project"
  | "calendar"
  | "task"
  | "integration"
  | "media";

export type McpAction = "read" | "create" | "update" | "delete";

export type McpPermission = {
  resource: McpResource;
  actions: McpAction[];
};
