import type { QueryCtx, MutationCtx } from "../../_generated/server";
import type { Doc, Id } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";
import { presentWorkspaceRecord } from "../../shared/present";
import { assertActiveWorkspaceRecord, assertPublicWorkspaceRecord } from "../../workspace/businessData";
import { projectInput, listLimit, listCursor, requiredString, searchTerm, assertProjectLinks } from "../toolInputs";
import { mcpPublicWorkspacePage, mcpPublicWorkspaceSearchResult } from "../readSurface";
import {
  type ReadHandler, type WriteHandler, type ReadToolArgs, type WriteToolArgs,
  TOOL_SCAN_LIMIT, projectSearchValues, audit,
} from "./shared";
import { isScopedProject, projectVisibilityForMcpCreate, scopeActorUserId } from "../scopePolicy";

export const projectsList: ReadHandler = async (ctx: QueryCtx, args: ReadToolArgs) => {
  const limit = listLimit(args.input);
  const search = searchTerm(args.input);
  
  const scope = args.scopePolicy;

  if (!search) {
    let page;
    if (scope.scopeType !== "organization") {
      const projects: Doc<"projects">[] = [];
      for (const projectId of scope.projectIds) {
        const project = await ctx.db.get(projectId as Id<"projects">);
        if (project && project.organizationId === args.organizationId && !project.deletedAt && project.recordState !== "deleted") {
          projects.push(project);
        }
      }
      page = {
        page: projects.slice(0, limit),
        continueCursor: "",
        isDone: true,
      };
    } else {
      page = await ctx.db
        .query("projects")
        .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
        .order("desc")
        .paginate({ numItems: limit, cursor: listCursor(args.input) });
    }
    return mcpPublicWorkspacePage(page);
  }
  
  let projects;
  if (scope.scopeType !== "organization") {
    projects = [] as Doc<"projects">[];
    for (const projectId of scope.projectIds) {
      const project = await ctx.db.get(projectId as Id<"projects">);
      if (project && project.organizationId === args.organizationId && !project.deletedAt && project.recordState !== "deleted") {
        projects.push(project);
      }
    }
  } else {
    projects = await ctx.db
      .query("projects")
      .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .take(TOOL_SCAN_LIMIT);
  }
  
  return mcpPublicWorkspaceSearchResult(projects, { search, limit, searchValues: projectSearchValues });
};

export const projectsGet: ReadHandler = async (ctx: QueryCtx, args: ReadToolArgs) => {
  const projectId = requiredString(args.input, "projectId") as Id<"projects">;
  const project = await ctx.db.get(projectId);
  
  if (
    !isScopedProject(args.scopePolicy, projectId) ||
    project?.recordState === "deleted"
  ) throw new Error("Project was not found.");
  
  return presentWorkspaceRecord(assertPublicWorkspaceRecord(assertActiveWorkspaceRecord(project, args.organizationId, "Project"), "Project"));
};

export const projectsCreate: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const project = projectInput(args.input);
  const actorUserId = scopeActorUserId(args.scopePolicy);
  const scope = args.scopePolicy;
  const selectedSpace = scope.scopeType === "space"
    ? await ctx.db.get(requiredString(args.input, "spaceId") as Id<"spaces">)
    : null;
  const visibility = projectVisibilityForMcpCreate(
    scope.scopeType,
    selectedSpace?.defaultProjectVisibility,
  );
  await assertProjectLinks(ctx, args.organizationId, project);
  const result = await ctx.runMutation(internal.projects.write.createInternal, {
    organizationId: args.organizationId,
    input: { ...project, visibility },
    actorUserId,
  });
  if (scope.scopeType === "space") {
    const spaceId = requiredString(args.input, "spaceId") as Id<"spaces">;
    await ctx.db.insert("projectSpaces", {
      organizationId: args.organizationId,
      projectId: result.id as Id<"projects">,
      spaceId,
      isPrimary: true,
      recordState: "active",
      addedByUserId: actorUserId,
      addedAt: args.now,
    });
  }
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
    actorUserId: scopeActorUserId(args.scopePolicy),
  });
  await audit(ctx, args.organizationId, args.connectionId, "project.update", projectId, `Updated project.`);
  return presentWorkspaceRecord(result);
};

export const projectsDelete: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const projectId = requiredString(args.input, "projectId") as Id<"projects">;
  const result = await ctx.runMutation(internal.projects.write.deleteInternal, {
    organizationId: args.organizationId,
    projectId,
    actorUserId: scopeActorUserId(args.scopePolicy),
  });
  await audit(ctx, args.organizationId, args.connectionId, "project.delete", projectId, `Deleted project.`);
  return result;
};
