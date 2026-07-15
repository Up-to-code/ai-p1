import { ConvexError, v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { resolveProjectAccess } from "../access/project";
import { assertOrganizationEntitlement, countActiveProjects } from "../billing/access";
import { presentWorkspaceRecord, stripDeletedFields } from "../shared/present";
import {
  normalizeProjectVisibility,
  projectInputValidator,
  projectValidator,
} from "./validators";
import { projectSearchProjection } from "../search/adapters/project";

type ProjectInput = {
  name: string;
  clientId?: Id<"clients">;
  opportunityId?: Id<"opportunities">;
  status: "planned" | "active" | "paused" | "completed" | "archived";
  health: "onTrack" | "atRisk" | "blocked";
  visibility?: "private" | "space_members" | "organization";
  teamMemberIds?: string[];
  startDate?: string;
  endDate?: string;
  budget?: number;
  currency?: string;
  description?: string;
  tags?: string[];
  isStrict?: boolean;
  isRollupEnabled?: boolean;
  templateId?: string;
  progress?: number;
};

function presentProject(project: Doc<"projects">) {
  const clean = stripDeletedFields(project);
  return {
    ...presentWorkspaceRecord(clean),
    visibility: normalizeProjectVisibility(project.visibility),
    coverImageUrl: undefined,
  };
}

function projectNotFoundError(
  organizationId: string,
  projectId: Id<"projects">,
) {
  return new ConvexError({
    code: "PROJECT_NOT_FOUND",
    message: "Project was not found.",
    organizationId,
    projectId,
  });
}

async function requireActiveProject(
  ctx: MutationCtx,
  organizationId: string,
  projectId: Id<"projects">,
) {
  const project = await ctx.db.get(projectId);
  if (
    !project ||
    project.organizationId !== organizationId ||
    project.deletedAt ||
    project.recordState === "deleted"
  ) {
    throw projectNotFoundError(organizationId, projectId);
  }
  return project;
}

async function createProjectCore(
  ctx: MutationCtx,
  args: { organizationId: string; input: ProjectInput; actorUserId: string },
) {
  const currentProjects = await countActiveProjects(ctx, args.organizationId);
  await assertOrganizationEntitlement(ctx, {
    organizationId: args.organizationId,
    key: "project",
    used: currentProjects,
  });
  const now = Date.now();
  const id = await ctx.db.insert("projects", {
    organizationId: args.organizationId,
    ...args.input,
    ownerUserId: args.actorUserId,
    visibility: normalizeProjectVisibility(args.input.visibility),
    recordState: "active",
    createdByUserId: args.actorUserId,
    createdAt: now,
    updatedAt: now,
  });

  const project = await ctx.db.get(id);
  if (!project) throw new Error("Project could not be created.");
  await projectSearchProjection(ctx, project);
  return { presented: presentProject(project), now };
}

async function updateProjectCore(
  ctx: MutationCtx,
  args: {
    organizationId: string;
    projectId: Id<"projects">;
    input: ProjectInput;
    actorUserId: string;
  },
) {
  const existing = await requireActiveProject(
    ctx,
    args.organizationId,
    args.projectId,
  );

  const nextVisibility = normalizeProjectVisibility(
    args.input.visibility ?? existing.visibility,
  );
  const now = Date.now();
  await ctx.db.patch(args.projectId, {
    ...args.input,
    visibility: nextVisibility,
    updatedAt: now,
  });

  const project = await ctx.db.get(args.projectId);
  if (!project) throw projectNotFoundError(args.organizationId, args.projectId);
  await projectSearchProjection(ctx, project);
  return { presented: presentProject(project), now };
}

async function deleteProjectCore(
  ctx: MutationCtx,
  args: {
    organizationId: string;
    projectId: Id<"projects">;
    actorUserId: string;
  },
) {
  const existing = await requireActiveProject(
    ctx,
    args.organizationId,
    args.projectId,
  );
  const now = Date.now();
  await ctx.db.patch(args.projectId, {
    deletedAt: now,
    recordState: "deleted",
    updatedAt: now,
  });
  const deleted = await ctx.db.get(args.projectId);
  if (deleted) await projectSearchProjection(ctx, deleted);
  return { removed: true as const, now, name: existing.name };
}

export const createFromHono = mutation({
  args: {
    organizationId: v.string(),
    input: projectInputValidator,
  },
  returns: projectValidator,
  handler: async (ctx, args) => {
    const access = await resolveProjectAccess(ctx, args.organizationId);
    await access.assertCanCreate();
    const { presented, now } = await createProjectCore(ctx, {
      organizationId: args.organizationId,
      input: args.input,
      actorUserId: access.actor.userId,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: access.actor.userId,
      action: "project.create",
      target: presented.id,
      summary: `Created project ${args.input.name}.`,
      createdAt: now,
    });
    return presented;
  },
});

export const updateFromHono = mutation({
  args: {
    organizationId: v.string(),
    projectId: v.id("projects"),
    input: projectInputValidator,
  },
  returns: projectValidator,
  handler: async (ctx, args) => {
    const access = await resolveProjectAccess(ctx, args.organizationId);
    const existing = await requireActiveProject(
      ctx,
      args.organizationId,
      args.projectId,
    );
    access.assertCanUpdate(existing);
    const { presented, now } = await updateProjectCore(ctx, {
      organizationId: args.organizationId,
      projectId: args.projectId,
      input: args.input,
      actorUserId: access.actor.userId,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: access.actor.userId,
      action: "project.update",
      target: args.projectId,
      summary: `Updated project ${args.input.name}.`,
      createdAt: now,
    });
    return presented;
  },
});

export const deleteFromHono = mutation({
  args: {
    organizationId: v.string(),
    projectId: v.id("projects"),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const access = await resolveProjectAccess(ctx, args.organizationId);
    const existing = await requireActiveProject(
      ctx,
      args.organizationId,
      args.projectId,
    );
    access.assertCanDelete(existing);
    const { now, name } = await deleteProjectCore(ctx, {
      organizationId: args.organizationId,
      projectId: args.projectId,
      actorUserId: access.actor.userId,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: access.actor.userId,
      action: "project.delete",
      target: args.projectId,
      summary: `Deleted project ${name}.`,
      createdAt: now,
    });
    return { removed: true };
  },
});

export const createInternal = internalMutation({
  args: {
    organizationId: v.string(),
    input: projectInputValidator,
    actorUserId: v.string(),
  },
  returns: projectValidator,
  handler: async (ctx, args) => {
    const { presented } = await createProjectCore(ctx, {
      organizationId: args.organizationId,
      input: args.input,
      actorUserId: args.actorUserId,
    });
    return presented;
  },
});

export const updateInternal = internalMutation({
  args: {
    organizationId: v.string(),
    projectId: v.id("projects"),
    input: projectInputValidator,
    actorUserId: v.string(),
  },
  returns: projectValidator,
  handler: async (ctx, args) => {
    const { presented } = await updateProjectCore(ctx, {
      organizationId: args.organizationId,
      projectId: args.projectId,
      input: args.input,
      actorUserId: args.actorUserId,
    });
    return presented;
  },
});

export const deleteInternal = internalMutation({
  args: {
    organizationId: v.string(),
    projectId: v.id("projects"),
    actorUserId: v.string(),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    await deleteProjectCore(ctx, {
      organizationId: args.organizationId,
      projectId: args.projectId,
      actorUserId: args.actorUserId,
    });
    return { removed: true };
  },
});
