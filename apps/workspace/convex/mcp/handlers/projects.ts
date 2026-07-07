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
  
  // Get connection to check scope
  const connection = await ctx.db.get(args.connectionId);
  const scope = connection?.scope;

  if (!search) {
    let page;
    if (scope?.type === "project" && scope.projectIds) {
      // Filter by specific project IDs
      const projects = [];
      for (const projectId of scope.projectIds) {
        const project = await ctx.db.get(projectId);
        if (project && project.organizationId === args.organizationId && !project.deletedAt) {
          projects.push(project);
        }
      }
      page = {
        page: projects.slice(0, limit),
        continueCursor: "",
        isDone: true,
      };
    } else if (scope?.type === "space" && scope.spaceIds && scope.spaceIds.length > 0) {
      // Filter by space IDs via projectSpaces junction
      const spaceIds = scope.spaceIds;
      const projectSpaces = await ctx.db
        .query("projectSpaces")
        .withIndex("by_space_id", (q) =>
          q.eq("organizationId", args.organizationId),
        )
        .filter((q) =>
          q.and(
            q.eq(q.field("deletedAt"), undefined),
            q.or(...spaceIds.map((spaceId: Id<"spaces">) => q.eq(q.field("spaceId"), spaceId))),
          ),
        )
        .take(TOOL_SCAN_LIMIT);
      
      const projectIds = projectSpaces.map((ps) => ps.projectId);
      const projects = [];
      for (const projectId of projectIds) {
        const project = await ctx.db.get(projectId);
        if (project && project.organizationId === args.organizationId && !project.deletedAt) {
          projects.push(project);
        }
      }
      page = {
        page: projects.slice(0, limit),
        continueCursor: "",
        isDone: true,
      };
    } else {
      // No scope or organization scope - show all
      page = await ctx.db
        .query("projects")
        .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
        .order("desc")
        .paginate({ numItems: limit, cursor: listCursor(args.input) });
    }
    return mcpPublicWorkspacePage(page);
  }
  
  // Search with scope filtering
  let projects;
  if (scope?.type === "project" && scope.projectIds) {
    projects = [];
    for (const projectId of scope.projectIds) {
      const project = await ctx.db.get(projectId);
      if (project && project.organizationId === args.organizationId && !project.deletedAt) {
        projects.push(project);
      }
    }
  } else if (scope?.type === "space" && scope.spaceIds && scope.spaceIds.length > 0) {
    const spaceIds = scope.spaceIds;
    const projectSpaces = await ctx.db
      .query("projectSpaces")
      .withIndex("by_space_id", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("deletedAt"), undefined),
          q.or(...spaceIds.map((spaceId: Id<"spaces">) => q.eq(q.field("spaceId"), spaceId))),
        ),
      )
      .take(TOOL_SCAN_LIMIT);
    
    const projectIds = projectSpaces.map((ps) => ps.projectId);
    projects = [];
    for (const projectId of projectIds) {
      const project = await ctx.db.get(projectId);
      if (project && project.organizationId === args.organizationId && !project.deletedAt) {
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
  
  // Check if project is within MCP scope
  const connection = await ctx.db.get(args.connectionId);
  const scope = connection?.scope;
  if (scope?.type === "project" && scope.projectIds) {
    if (!scope.projectIds.includes(projectId)) {
      throw new Error("Project not in MCP scope");
    }
  } else if (scope?.type === "space" && scope.spaceIds && scope.spaceIds.length > 0) {
    const spaceIds = scope.spaceIds;
    const projectSpaces = await ctx.db
      .query("projectSpaces")
      .withIndex("by_project_id", (q) =>
        q.eq("organizationId", args.organizationId).eq("projectId", projectId),
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("deletedAt"), undefined),
          q.or(...spaceIds.map((spaceId: Id<"spaces">) => q.eq(q.field("spaceId"), spaceId))),
        ),
      )
      .first();
    if (!projectSpaces) {
      throw new Error("Project not in MCP scope");
    }
  }
  
  return presentWorkspaceRecord(assertPublicWorkspaceRecord(assertActiveWorkspaceRecord(project, args.organizationId, "Project"), "Project"));
};

export const projectsCreate: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const project = projectInput(args.input);
  await assertProjectLinks(ctx, args.organizationId, project);
  const result = await ctx.runMutation(internal.projects.write.createInternal, {
    organizationId: args.organizationId,
    input: { ...project, visibility: "organization" },
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
