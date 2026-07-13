import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getAuthUser } from "../auth";

const permissionValidator = v.record(v.string(), v.array(v.string()));

const roleValidator = v.object({
  id: v.string(),
  organizationId: v.string(),
  role: v.string(),
  permission: permissionValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

function presentRole(role: {
  _id: string;
  organizationId: string;
  role: string;
  permission: Record<string, string[]>;
  createdAt: number;
  updatedAt: number;
}) {
  return {
    id: role._id,
    organizationId: role.organizationId,
    role: role.role,
    permission: role.permission,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}

export const list = query({
  args: {
    organizationId: v.string(),
  },
  returns: v.array(roleValidator),
  handler: async (ctx, args) => {
    await getAuthUser(ctx);
    const roles = await ctx.db
      .query("organizationWorkRoles")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    return roles
      .sort((a, b) => a.role.localeCompare(b.role))
      .map(presentRole);
  },
});

export const createFromHono = mutation({
  args: {
    organizationId: v.string(),
    role: v.string(),
    permission: permissionValidator,
  },
  returns: roleValidator,
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const existing = await ctx.db
      .query("organizationWorkRoles")
      .withIndex("by_organization_role", (q) =>
        q.eq("organizationId", args.organizationId).eq("role", args.role),
      )
      .unique();

    if (existing) {
      throw new Error("A custom work role with this name already exists.");
    }

    const now = Date.now();
    const id = await ctx.db.insert("organizationWorkRoles", {
      organizationId: args.organizationId,
      role: args.role,
      permission: args.permission,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    const role = await ctx.db.get(id);
    if (!role) {
      throw new Error("Custom work role could not be created.");
    }

    return presentRole(role);
  },
});

export const updateFromHono = mutation({
  args: {
    organizationId: v.string(),
    roleId: v.id("organizationWorkRoles"),
    roleName: v.optional(v.string()),
    permission: v.optional(permissionValidator),
  },
  returns: roleValidator,
  handler: async (ctx, args) => {
    await getAuthUser(ctx);
    const existing = await ctx.db.get(args.roleId);
    if (!existing || existing.organizationId !== args.organizationId) {
      throw new Error("Custom work role was not found.");
    }

    if (args.roleName && args.roleName !== existing.role) {
      const duplicate = await ctx.db
        .query("organizationWorkRoles")
        .withIndex("by_organization_role", (q) =>
          q.eq("organizationId", args.organizationId).eq("role", args.roleName as string),
        )
        .unique();
      if (duplicate && duplicate._id !== args.roleId) {
        throw new Error("A custom work role with this name already exists.");
      }
    }

    await ctx.db.patch(args.roleId, {
      role: args.roleName ?? existing.role,
      permission: args.permission ?? existing.permission,
      updatedAt: Date.now(),
    });

    const updated = await ctx.db.get(args.roleId);
    if (!updated) {
      throw new Error("Custom work role could not be updated.");
    }

    return presentRole(updated);
  },
});

export const deleteFromHono = mutation({
  args: {
    organizationId: v.string(),
    roleId: v.id("organizationWorkRoles"),
  },
  returns: roleValidator,
  handler: async (ctx, args) => {
    await getAuthUser(ctx);
    const existing = await ctx.db.get(args.roleId);
    if (!existing || existing.organizationId !== args.organizationId) {
      throw new Error("Custom work role was not found.");
    }

    await ctx.db.delete(args.roleId);
    return presentRole(existing);
  },
});
