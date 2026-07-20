/**
 * Canonical resource vocabulary for the entire Qentrah platform.
 *
 * Every authorization, permission, and capability system imports from here.
 * The arrays are the runtime source of truth; types are derived from them.
 *
 * When adding a new resource:
 * 1. Add it to `resources` below
 * 2. If it supports non-CRUD actions, add to `extraActions`
 * 3. Run `npx convex codegen` to propagate to Convex validators
 */

export const resources = [
  "organization",
  "team",
  "member",
  "role",
  "space",
  "project",
  "task",
  "client",
  "deal",
  "calendar",
  "document",
  "media",
  "asset",
  "channel",
  "visibility",
  "integration",
  "apiKey",
  "oauthApp",
  "finance",
  "report",
] as const;

export const actions = ["create", "read", "update", "delete"] as const;

/** Actions beyond standard CRUD. */
export const extraActions = ["authorize"] as const;

export type Resource = (typeof resources)[number];
export type Action = (typeof actions)[number];
export type ExtraAction = (typeof extraActions)[number];
export type AllAction = Action | ExtraAction;

/**
 * MCP-scoped subset: resources that MCP/Eve tools operate on.
 * Consumers that only need tool-level resources should import this.
 */
export const mcpResources = [
  "organization",
  "member",
  "role",
  "space",
  "client",
  "project",
  "deal",
  "calendar",
  "task",
  "media",
  "finance",
  "report",
] as const;

export type McpResource = (typeof mcpResources)[number];

/**
 * The authorization resource map: every Resource maps to its available Actions.
 * Used by capability evaluation, permission statements, and role definitions.
 */
export const resourceActionMap = {
  organization: ["read", "update", "delete"] as const,
  team: ["create", "read", "update", "delete"] as const,
  member: ["create", "read", "update", "delete"] as const,
  role: ["create", "read", "update", "delete"] as const,
  space: ["create", "read", "update", "delete"] as const,
  project: ["create", "read", "update", "delete"] as const,
  task: ["create", "read", "update", "delete"] as const,
  client: ["create", "read", "update", "delete"] as const,
  deal: ["create", "read", "update", "delete"] as const,
  calendar: ["create", "read", "update", "delete"] as const,
  document: ["create", "read", "update", "delete"] as const,
  media: ["create", "read", "update", "delete"] as const,
  asset: ["create", "read", "update", "delete"] as const,
  channel: ["create", "read", "update", "delete"] as const,
  visibility: ["read", "update"] as const,
  integration: ["create", "read", "update", "delete"] as const,
  apiKey: ["create", "read", "update", "delete"] as const,
  oauthApp: ["create", "read", "update", "delete", "authorize"] as const,
  finance: ["create", "read", "update", "delete"] as const,
  report: ["create", "read", "update", "delete"] as const,
} as const satisfies Record<Resource, readonly AllAction[]>;

export type ResourceActions<R extends Resource> = (typeof resourceActionMap)[R][number];

/**
 * Permission statement: a mapping from resource to allowed actions.
 * Used by role definitions in @qentrah/auth.
 */
export type PermissionStatement = {
  [R in Resource]?: readonly AllAction[];
};
