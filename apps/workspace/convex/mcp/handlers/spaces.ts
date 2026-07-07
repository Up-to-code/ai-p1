import type { Id } from "../../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../../_generated/server";
import { authUser } from "../../auth";
import {
  assertCanAccessSpace,
  assertCanPerformSpaceAction,
} from "../../permissions";
import { activeWorkspaceRows } from "../../workspace/readSurface";
import { presentWorkspaceRecord, stripDeletedFields } from "../../shared/present";
import { spaceInputValidator, spaceValidator } from "../../spaces/validators";
import type { ReadHandler, WriteHandler, ReadToolArgs, WriteToolArgs } from "./shared";

const MAX_ORG_SPACES = 500;

function presentSpace(space: any) {
  const clean = stripDeletedFields(space);
  return { ...clean, id: clean._id };
}

/**
 * MCP Handlers for Spaces
 * These handlers respect space/project scoping through the permission system
 */

export const spaces_list: ReadHandler = async (ctx, args) => {
  const { organizationId, permissions } = args;
  const user = await authUser.getAuthUser(ctx);
  const spaces = await ctx.db
    .query("spaces")
    .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
    .take(MAX_ORG_SPACES);

  return activeWorkspaceRows(spaces).map((space) => ({
    ...space,
    id: space._id,
  }));
};

export const spaces_get: ReadHandler = async (ctx, args) => {
  const { organizationId, input } = args;
  const spaceId = input.spaceId as Id<"spaces">;
  const user = await authUser.getAuthUser(ctx);
  await assertCanAccessSpace(ctx, organizationId, spaceId, user._id);
  const space = await ctx.db.get(spaceId);
  if (!space || space.organizationId !== organizationId || space.deletedAt) {
    return null;
  }
  return { ...space, id: space._id };
};

export const spaces_create: WriteHandler = async (ctx, args) => {
  const { organizationId, input, actorId, now } = args;
  const user = await authUser.getAuthUser(ctx);
  // Check if user can create spaces in the organization
  // For now, we'll allow creation - in production, check org role

  const existing = await ctx.db
    .query("spaces")
    .withIndex("by_organization_slug", (q) =>
      q.eq("organizationId", organizationId).eq("slug", input.slug as string),
    )
    .first();
  if (existing) {
    throw new Error("A space with this slug already exists in this organization.");
  }

  const id = await ctx.db.insert("spaces", {
    organizationId,
    name: input.name as string,
    slug: input.slug as string,
    description: input.description as string | undefined,
    icon: input.icon as string | undefined,
    color: input.color as string | undefined,
    visibility: input.visibility as "private" | "public" | "request_only",
    defaultProjectVisibility: input.defaultProjectVisibility as "private" | "space_members" | "organization" | undefined,
    allowMemberProjectCreation: input.allowMemberProjectCreation as boolean | undefined,
    createdByUserId: actorId,
    createdAt: now,
    updatedAt: now,
  });

  // Add creator as space admin
  await ctx.db.insert("spaceMembers", {
    organizationId,
    spaceId: id,
    userId: actorId,
    role: "admin",
    addedByUserId: actorId,
    addedAt: now,
  });

  await ctx.db.insert("organizationAuditEvents", {
    organizationId,
    actorUserId: actorId,
    action: "space.create",
    target: id,
    summary: `Created space ${input.name}.`,
    createdAt: now,
  });

  const space = await ctx.db.get(id);
  if (!space) throw new Error("Space could not be created.");
  return presentSpace(space);
};

export const spaces_update: WriteHandler = async (ctx, args) => {
  const { organizationId, input, actorId, now } = args;
  const spaceId = input.spaceId as Id<"spaces">;
  const user = await authUser.getAuthUser(ctx);
  await assertCanPerformSpaceAction(ctx, organizationId, spaceId, actorId, "update");

  const existing = await ctx.db.get(spaceId);
  if (!existing || existing.organizationId !== organizationId || existing.deletedAt) {
    throw new Error("Space was not found.");
  }

  if (input.slug !== existing.slug) {
    const slugConflict = await ctx.db
      .query("spaces")
      .withIndex("by_organization_slug", (q) =>
        q.eq("organizationId", organizationId).eq("slug", input.slug as string),
      )
      .first();
    if (slugConflict && slugConflict._id !== spaceId) {
      throw new Error("A space with this slug already exists in this organization.");
    }
  }

  await ctx.db.patch(spaceId, {
    ...input,
    updatedAt: now,
  });

  await ctx.db.insert("organizationAuditEvents", {
    organizationId,
    actorUserId: actorId,
    action: "space.update",
    target: spaceId,
    summary: `Updated space ${input.name}.`,
    createdAt: now,
  });

  const space = await ctx.db.get(spaceId);
  if (!space) throw new Error("Space was not found.");
  return presentSpace(space);
};

export const spaces_delete: WriteHandler = async (ctx, args) => {
  const { organizationId, input, actorId, now } = args;
  const spaceId = input.spaceId as Id<"spaces">;
  const user = await authUser.getAuthUser(ctx);
  await assertCanPerformSpaceAction(ctx, organizationId, spaceId, actorId, "delete");

  const existing = await ctx.db.get(spaceId);
  if (!existing || existing.organizationId !== organizationId || existing.deletedAt) {
    throw new Error("Space was not found.");
  }

  // Soft delete the space
  await ctx.db.patch(spaceId, { deletedAt: now, updatedAt: now });

  // Dissociate projects from this space
  const projectSpaces = await ctx.db
    .query("projectSpaces")
    .withIndex("by_space_id", (q) =>
      q.eq("organizationId", organizationId).eq("spaceId", spaceId),
    )
    .take(500);
  for (const projectSpace of projectSpaces) {
    await ctx.db.patch(projectSpace._id, { deletedAt: now });
  }

  // Soft delete space memberships
  const spaceMembers = await ctx.db
    .query("spaceMembers")
    .withIndex("by_space_id", (q) =>
      q.eq("organizationId", organizationId).eq("spaceId", spaceId),
    )
    .take(500);
  for (const member of spaceMembers) {
    await ctx.db.patch(member._id, { deletedAt: now });
  }

  await ctx.db.insert("organizationAuditEvents", {
    organizationId,
    actorUserId: actorId,
    action: "space.delete",
    target: spaceId,
    summary: `Deleted space ${existing.name}.`,
    createdAt: now,
  });

  return { removed: true };
};

export const space_members_list: ReadHandler = async (ctx, args) => {
  const { organizationId, input } = args;
  const spaceId = input.spaceId as Id<"spaces">;
  const user = await authUser.getAuthUser(ctx);
  await assertCanPerformSpaceAction(ctx, organizationId, spaceId, user._id, "read");
  const members = await ctx.db
    .query("spaceMembers")
    .withIndex("by_space_id", (q) =>
      q.eq("organizationId", organizationId).eq("spaceId", spaceId),
    )
    .take(500);

  return activeWorkspaceRows(members).map((member) => ({
    ...member,
    id: member._id,
  }));
};

export const space_members_add: WriteHandler = async (ctx, args) => {
  const { organizationId, input, actorId, now } = args;
  const spaceId = input.spaceId as Id<"spaces">;
  const user = await authUser.getAuthUser(ctx);
  await assertCanPerformSpaceAction(ctx, organizationId, spaceId, actorId, "update");

  const space = await ctx.db.get(spaceId);
  if (!space || space.organizationId !== organizationId || space.deletedAt) {
    throw new Error("Space was not found.");
  }

  // Check if user is already a member
  const existing = await ctx.db
    .query("spaceMembers")
    .withIndex("by_space_user", (q) =>
      q.eq("organizationId", organizationId)
       .eq("spaceId", spaceId)
       .eq("userId", input.userId as string),
    )
    .first();
  if (existing && !existing.deletedAt) {
    throw new Error("User is already a member of this space.");
  }

  const id = await ctx.db.insert("spaceMembers", {
    organizationId,
    spaceId,
    userId: input.userId as string,
    role: input.role as "admin" | "member" | "viewer",
    addedByUserId: actorId,
    addedAt: now,
  });

  await ctx.db.insert("organizationAuditEvents", {
    organizationId,
    actorUserId: actorId,
    action: "spaceMember.add",
    target: id,
    summary: `Added user ${input.userId} to space ${space.name} as ${input.role}.`,
    createdAt: now,
  });

  const member = await ctx.db.get(id);
  if (!member) throw new Error("Space member could not be added.");
  return { ...member, id: member._id };
};

export const space_members_remove: WriteHandler = async (ctx, args) => {
  const { organizationId, input, actorId, now } = args;
  const spaceId = input.spaceId as Id<"spaces">;
  const user = await authUser.getAuthUser(ctx);
  await assertCanPerformSpaceAction(ctx, organizationId, spaceId, actorId, "update");

  const space = await ctx.db.get(spaceId);
  if (!space || space.organizationId !== organizationId || space.deletedAt) {
    throw new Error("Space was not found.");
  }

  const existing = await ctx.db
    .query("spaceMembers")
    .withIndex("by_space_user", (q) =>
      q.eq("organizationId", organizationId)
       .eq("spaceId", spaceId)
       .eq("userId", input.userId as string),
    )
    .first();
  if (!existing || existing.deletedAt) {
    throw new Error("User is not a member of this space.");
  }

  // Check if this is the last admin
  if (existing.role === "admin") {
    const otherAdmins = await ctx.db
      .query("spaceMembers")
      .withIndex("by_space_id", (q) =>
        q.eq("organizationId", organizationId).eq("spaceId", spaceId),
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("role"), "admin"),
          q.neq(q.field("_id"), existing._id),
          q.eq(q.field("deletedAt"), undefined),
        ),
      )
      .take(10);
    
    if (otherAdmins.length === 0) {
      throw new Error("Cannot remove the last admin from a space.");
    }
  }

  await ctx.db.patch(existing._id, { deletedAt: now });

  await ctx.db.insert("organizationAuditEvents", {
    organizationId,
    actorUserId: actorId,
    action: "spaceMember.remove",
    target: existing._id,
    summary: `Removed user ${input.userId} from space ${space.name}.`,
    createdAt: now,
  });

  return { removed: true };
};

export const space_members_update_role: WriteHandler = async (ctx, args) => {
  const { organizationId, input, actorId, now } = args;
  const spaceId = input.spaceId as Id<"spaces">;
  const user = await authUser.getAuthUser(ctx);
  await assertCanPerformSpaceAction(ctx, organizationId, spaceId, actorId, "update");

  const space = await ctx.db.get(spaceId);
  if (!space || space.organizationId !== organizationId || space.deletedAt) {
    throw new Error("Space was not found.");
  }

  const existing = await ctx.db
    .query("spaceMembers")
    .withIndex("by_space_user", (q) =>
      q.eq("organizationId", organizationId)
       .eq("spaceId", spaceId)
       .eq("userId", input.userId as string),
    )
    .first();
  if (!existing || existing.deletedAt) {
    throw new Error("User is not a member of this space.");
  }

  await ctx.db.patch(existing._id, { role: input.role as "admin" | "member" | "viewer" });

  await ctx.db.insert("organizationAuditEvents", {
    organizationId,
    actorUserId: actorId,
    action: "spaceMember.updateRole",
    target: existing._id,
    summary: `Updated user ${input.userId} role to ${input.role} in space ${space.name}.`,
    createdAt: now,
  });

  const member = await ctx.db.get(existing._id);
  if (!member) throw new Error("Space member could not be updated.");
  return { ...member, id: member._id };
};
