import type { QueryCtx, MutationCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";
import { presentWorkspaceRecord } from "../../shared/present";
import { assertActiveWorkspaceRecord, assertPublicWorkspaceRecord } from "../../workspace/businessData";
import { projectInput, listLimit, listCursor, requiredString, searchTerm, assertProjectLinks } from "../toolInputs";
import { mcpPublicWorkspacePage, mcpPublicWorkspaceSearchResult } from "../readSurface";
import {
  type ReadHandler, type WriteHandler, type ReadToolArgs, type WriteToolArgs,
  TOOL_SCAN_LIMIT, projectSearchValues, audit,
} from "./shared";

export const projectsList: ReadHandler = async (ctx: QueryCtx, args: ReadToolArgs) => {
  const limit = listLimit(args.input);
  const search = searchTerm(args.input);
  if (!search) {
    const page = await ctx.db
      .query("projects")
      .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .paginate({ numItems: limit, cursor: listCursor(args.input) });
    return mcpPublicWorkspacePage(page);
  }
  const projects = await ctx.db
    .query("projects")
    .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
    .order("desc")
    .take(TOOL_SCAN_LIMIT);
  return mcpPublicWorkspaceSearchResult(projects, { search, limit, searchValues: projectSearchValues });
};

export const projectsGet: ReadHandler = async (ctx: QueryCtx, args: ReadToolArgs) => {
  const project = await ctx.db.get(requiredString(args.input, "projectId") as Id<"projects">);
  return presentWorkspaceRecord(assertPublicWorkspaceRecord(assertActiveWorkspaceRecord(project, args.organizationId, "Project"), "Project"));
};

export const projectsCreate: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const project = projectInput(args.input);
  await assertProjectLinks(ctx, args.organizationId, project);
  const result = await ctx.runMutation(internal.projects.write.createInternal, {
    organizationId: args.organizationId,
    input: { ...project, visibility: "workspace" },
    actorUserId: args.actorId,
  });
  await audit(ctx, args.organizationId, args.connectionId, "project.create", result.id, `Created project ${project.name}.`);
  return presentWorkspaceRecord(result);
};

export const projectsUpdate: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const projectId = requiredString(args.input, "projectId") as Id<"projects">;
  const patch = projectInput(args.input);
  await assertProjectLinks(ctx, args.organizationId, patch);
  const result = await ctx.runMutation(internal.projects.write.updateInternal, {
    organizationId: args.organizationId,
    projectId,
    input: patch,
    actorUserId: args.actorId,
  });
  await audit(ctx, args.organizationId, args.connectionId, "project.update", projectId, `Updated project.`);
  return presentWorkspaceRecord(result);
};

export const projectsDelete: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const projectId = requiredString(args.input, "projectId") as Id<"projects">;
  const result = await ctx.runMutation(internal.projects.write.deleteInternal, {
    organizationId: args.organizationId,
    projectId,
    actorUserId: args.actorId,
  });
  await audit(ctx, args.organizationId, args.connectionId, "project.delete", projectId, `Deleted project.`);
  return result;
};
