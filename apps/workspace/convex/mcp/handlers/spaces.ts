import type { Id } from "../../_generated/dataModel";
import {
  assertCanPerformSpaceAction,
} from "../../permissions";
import { activeWorkspaceRows } from "../../workspace/readSurface";
import { stripDeletedFields } from "../../shared/present";
import { requiredString, optionalString } from "../toolInputs";
import type { ReadHandler, WriteHandler } from "./shared";
import { isScopedSpace, scopeActorUserId, scopePolicyFromInput } from "../scopePolicy";

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
  const { organizationId } = args;
  const scope = scopePolicyFromInput(args.input);
  const spaces = await ctx.db
    .query("spaces")
    .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
    .take(MAX_ORG_SPACES);

  return activeWorkspaceRows(spaces).filter((space) => space.recordState !== "deleted" && isScopedSpace(scope, space._id)).map((space) => ({
    ...space,
    id: space._id,
  }));
};

export const spaces_get: ReadHandler = async (ctx, args) => {
  const { organizationId, input } = args;
  const spaceId = input.spaceId as Id<"spaces">;
  const space = await ctx.db.get(spaceId);
  if (!space || space.organizationId !== organizationId || space.deletedAt || space.recordState === "deleted" || !isScopedSpace(scopePolicyFromInput(input), spaceId)) {
    return null;
  }
  return { ...space, id: space._id };
};

export const spaces_create: WriteHandler = async (ctx, args) => {
  const { organizationId, input, now } = args;
  const actorId = scopeActorUserId(input);

  const existing = await ctx.db
    .query("spaces")
    .withIndex("by_organization_slug", (q) =>
      q.eq("organizationId", organizationId).eq("slug", requiredString(input, "slug")),
    )
    .first();
  if (existing) {
    throw new Error("A space with this slug already exists in this organization.");
  }

  const id = await ctx.db.insert("spaces", {
    organizationId,
    name: requiredString(input, "name"),
    slug: requiredString(input, "slug"),
    description: optionalString(input, "description"),
    icon: optionalString(input, "icon"),
    color: optionalString(input, "color"),
    visibility: input.visibility === "private" || input.visibility === "request_only" ? input.visibility : "public",
    defaultProjectVisibility: input.defaultProjectVisibility as "private" | "space_members" | "organization" | undefined,
    allowMemberProjectCreation: input.allowMemberProjectCreation as boolean | undefined,
    recordState: "active",
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
    recordState: "active",
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
  const { organizationId, input, now } = args;
  const actorId = scopeActorUserId(input);
  const spaceId = input.spaceId as Id<"spaces">;
  await assertCanPerformSpaceAction(ctx, organizationId, spaceId, actorId, "update");

  const existing = await ctx.db.get(spaceId);
  if (!existing || existing.organizationId !== organizationId || existing.deletedAt) {
    throw new Error("Space was not found.");
  }

  const nextSlug = optionalString(input, "slug") ?? existing.slug;
  if (nextSlug !== existing.slug) {
    const slugConflict = await ctx.db
      .query("spaces")
      .withIndex("by_organization_slug", (q) =>
        q.eq("organizationId", organizationId).eq("slug", nextSlug),
      )
      .first();
    if (slugConflict && slugConflict._id !== spaceId) {
      throw new Error("A space with this slug already exists in this organization.");
    }
  }

  await ctx.db.patch(spaceId, {
    name: optionalString(input, "name") ?? existing.name,
    slug: nextSlug,
    description: optionalString(input, "description") ?? existing.description,
    icon: optionalString(input, "icon") ?? existing.icon,
    color: optionalString(input, "color") ?? existing.color,
    visibility: input.visibility === "private" || input.visibility === "public" || input.visibility === "request_only"
      ? input.visibility
      : existing.visibility,
    defaultProjectVisibility: input.defaultProjectVisibility === "private" || input.defaultProjectVisibility === "space_members" || input.defaultProjectVisibility === "organization"
      ? input.defaultProjectVisibility
      : existing.defaultProjectVisibility,
    allowMemberProjectCreation: typeof input.allowMemberProjectCreation === "boolean"
      ? input.allowMemberProjectCreation
      : existing.allowMemberProjectCreation,
    updatedAt: now,
  });

  await ctx.db.insert("organizationAuditEvents", {
    organizationId,
    actorUserId: actorId,
    action: "space.update",
    target: spaceId,
    summary: `Updated space ${optionalString(input, "name") ?? existing.name}.`,
    createdAt: now,
  });

  const space = await ctx.db.get(spaceId);
  if (!space) throw new Error("Space was not found.");
  return presentSpace(space);
};

export const spaces_delete: WriteHandler = async (ctx, args) => {
  const { organizationId, input, now } = args;
  const actorId = scopeActorUserId(input);
  const spaceId = input.spaceId as Id<"spaces">;
  await assertCanPerformSpaceAction(ctx, organizationId, spaceId, actorId, "delete");

  const existing = await ctx.db.get(spaceId);
  if (!existing || existing.organizationId !== organizationId || existing.deletedAt) {
    throw new Error("Space was not found.");
  }

  // Soft delete the space
  await ctx.db.patch(spaceId, {
    deletedAt: now,
    recordState: "deleted",
    updatedAt: now,
  });

  // Dissociate projects from this space
  const projectSpaces = await ctx.db
    .query("projectSpaces")
    .withIndex("by_space_id", (q) =>
      q.eq("organizationId", organizationId).eq("spaceId", spaceId),
    )
    .take(500);
  for (const projectSpace of projectSpaces) {
    await ctx.db.patch(projectSpace._id, {
      deletedAt: now,
      recordState: "deleted",
    });
  }

  // Soft delete space memberships
  const spaceMembers = await ctx.db
    .query("spaceMembers")
    .withIndex("by_space_id", (q) =>
      q.eq("organizationId", organizationId).eq("spaceId", spaceId),
    )
    .take(500);
  for (const member of spaceMembers) {
    await ctx.db.patch(member._id, {
      deletedAt: now,
      recordState: "deleted",
    });
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
  const actorId = scopeActorUserId(input);
  await assertCanPerformSpaceAction(ctx, organizationId, spaceId, actorId, "read");
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
  const { organizationId, input, now } = args;
  const actorId = scopeActorUserId(input);
  const spaceId = input.spaceId as Id<"spaces">;
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
    if (existing.role === input.role) return { ...existing, id: existing._id };
    throw new Error("User is already a member of this space with a different role.");
  }

  const id = await ctx.db.insert("spaceMembers", {
    organizationId,
    spaceId,
    userId: input.userId as string,
    role: input.role as "admin" | "member" | "viewer",
    recordState: "active",
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
  const { organizationId, input, now } = args;
  const actorId = scopeActorUserId(input);
  const spaceId = input.spaceId as Id<"spaces">;
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
  const { organizationId, input, now } = args;
  const actorId = scopeActorUserId(input);
  const spaceId = input.spaceId as Id<"spaces">;
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

  if (existing.role === input.role) return { ...existing, id: existing._id };

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
