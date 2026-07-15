import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { getAuthUser } from "../auth";
import { canActorUseMcpPermission, resolveScopePolicy } from "./scopePolicy";
import { mcpPermissionValidator, mcpScopeValidator, type McpPermission } from "./validators";
import { assertOrganizationEntitlement } from "../billing/access";

const MAX_PROFILES = 100;

const profileValidator = v.object({
  id: v.id("mcpConnectionProfiles"),
  publicId: v.string(),
  organizationId: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  permissions: v.array(mcpPermissionValidator),
  scope: mcpScopeValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

function present(profile: Doc<"mcpConnectionProfiles">) {
  return {
    id: profile._id,
    publicId: profile.publicId,
    organizationId: profile.organizationId,
    name: profile.name,
    description: profile.description,
    permissions: profile.permissions,
    scope: profile.scope,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

function profileError(code: string, message: string): never {
  throw new ConvexError({ code, message });
}

async function permittedProfile(
  ctx: Parameters<typeof resolveScopePolicy>[0],
  organizationId: string,
  userId: string,
  scope: Doc<"mcpConnectionProfiles">["scope"],
  requested: McpPermission[],
) {
  const policy = await resolveScopePolicy(ctx, { organizationId, actorUserId: userId, scope });
  const permissions: McpPermission[] = [];
  for (const permission of requested) {
    const actions = [] as McpPermission["actions"];
    for (const action of permission.actions) {
      if (await canActorUseMcpPermission(ctx, policy, permission.resource, action)) actions.push(action);
    }
    if (actions.length) permissions.push({ resource: permission.resource, actions });
  }
  if (!permissions.length) profileError("MCP_PROFILE_PERMISSION_REQUIRED", "Select at least one permission you can grant.");
  return permissions;
}

export const listMine = query({
  args: { organizationId: v.string() },
  returns: v.array(profileValidator),
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await resolveScopePolicy(ctx, {
      organizationId: args.organizationId,
      actorUserId: user._id,
      scope: { type: "organization" },
    });
    const profiles = await ctx.db
      .query("mcpConnectionProfiles")
      .withIndex("by_user_organization", (q) =>
        q.eq("createdByUserId", user._id).eq("organizationId", args.organizationId),
      )
      .order("desc")
      .take(MAX_PROFILES);
    return profiles.map(present);
  },
});

export const create = mutation({
  args: {
    organizationId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    permissions: v.array(mcpPermissionValidator),
    scope: mcpScopeValidator,
  },
  returns: profileValidator,
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const name = args.name.trim().slice(0, 120);
    if (!name) profileError("MCP_PROFILE_NAME_REQUIRED", "Agent name is required.");
    const existing = await ctx.db
      .query("mcpConnectionProfiles")
      .withIndex("by_user_organization", (q) =>
        q.eq("createdByUserId", user._id).eq("organizationId", args.organizationId),
      )
      .take(MAX_PROFILES);
    if (existing.length >= MAX_PROFILES) profileError("MCP_PROFILE_LIMIT", "You have reached the MCP profile limit.");
    await assertOrganizationEntitlement(ctx, {
      organizationId: args.organizationId,
      key: "agent_link",
      used: existing.length,
      requestedUnits: 1,
    });
    const permissions = await permittedProfile(ctx, args.organizationId, user._id, args.scope, args.permissions);
    const now = Date.now();
    const id = await ctx.db.insert("mcpConnectionProfiles", {
      organizationId: args.organizationId,
      publicId: crypto.randomUUID(),
      name,
      description: args.description?.trim().slice(0, 500) || undefined,
      permissions,
      scope: args.scope,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });
    const profile = await ctx.db.get(id);
    if (!profile) profileError("MCP_PROFILE_CREATE_FAILED", "The MCP profile could not be created.");
    return present(profile);
  },
});

export const update = mutation({
  args: {
    profileId: v.id("mcpConnectionProfiles"),
    name: v.string(),
    description: v.optional(v.string()),
    permissions: v.array(mcpPermissionValidator),
    scope: mcpScopeValidator,
  },
  returns: profileValidator,
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const profile = await ctx.db.get(args.profileId);
    if (!profile || profile.createdByUserId !== user._id) {
      profileError("MCP_PROFILE_NOT_FOUND", "MCP profile not found.");
    }
    const name = args.name.trim().slice(0, 120);
    if (!name) profileError("MCP_PROFILE_NAME_REQUIRED", "Agent name is required.");
    const permissions = await permittedProfile(ctx, profile.organizationId, user._id, args.scope, args.permissions);
    await ctx.db.patch(profile._id, {
      name,
      description: args.description?.trim().slice(0, 500) || undefined,
      permissions,
      scope: args.scope,
      updatedAt: Date.now(),
    });
    const updated = await ctx.db.get(profile._id);
    if (!updated) profileError("MCP_PROFILE_UPDATE_FAILED", "The MCP profile could not be updated.");
    return present(updated);
  },
});

export const remove = mutation({
  args: { profileId: v.id("mcpConnectionProfiles") },
  returns: v.object({ ok: v.literal(true) }),
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const profile = await ctx.db.get(args.profileId);
    if (!profile || profile.createdByUserId !== user._id) {
      profileError("MCP_PROFILE_NOT_FOUND", "MCP profile not found.");
    }
    await ctx.db.delete(profile._id);
    return { ok: true as const };
  },
});
