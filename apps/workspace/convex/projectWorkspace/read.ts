import { v } from "convex/values";
import { query } from "../_generated/server";
import {
  buildSurfaceProjection,
  readableSurfaceTabs,
} from "../workspaceSurfaces/helpers";
import {
  projectWorkspaceSurfaceProjectionValidator,
  projectWorkspaceTabValidator,
  projectManagementTreeProjectionValidator,
} from "./validators";
import { PROJECT_WORKSPACE_SURFACE_CONFIG } from "./data";
import { requireServerActor } from "../access/actor";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { resolveSpaceAccess } from "../access/space";
import { resolveProjectAccess } from "../access/project";
import { resolveProjectSpaceAccess } from "../access/projectSpace";
import { resolveDocumentAccess } from "../access/document";
import { canPerformOrganizationAction } from "../permissions";
import type { Doc, Id } from "../_generated/dataModel";

export const getSurfaceProjection = query({
  args: { organizationId: v.string() },
  returns: v.union(projectWorkspaceSurfaceProjectionValidator, v.null()),
  handler: async (ctx, args) => {
    return buildSurfaceProjection(
      ctx,
      args.organizationId,
      PROJECT_WORKSPACE_SURFACE_CONFIG,
    );
  },
});

export const getProjectManagementTree = query({
  args: { organizationId: v.string() },
  returns: projectManagementTreeProjectionValidator,
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const actor = await requireServerActor(ctx);
    const [spaceAccess, projectAccess, projectSpaceAccess, documentAccess] = await Promise.all([
      resolveSpaceAccess(ctx, args.organizationId),
      resolveProjectAccess(ctx, args.organizationId),
      resolveProjectSpaceAccess(ctx, args.organizationId),
      resolveDocumentAccess(ctx, args.organizationId),
    ]);
    const [spaceRows, projectRows, linkRows, documentRows, taskRows] = await Promise.all([
      ctx.db.query("spaces").withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId)).take(200),
      ctx.db.query("projects").withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId)).take(300),
      ctx.db.query("projectSpaces").withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId)).take(800),
      ctx.db.query("docs").withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId)).take(500),
      ctx.db.query("tasks").withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId)).take(2_000),
    ]);
    const spaces = spaceAccess.filterReadable(spaceRows.filter((space) => !space.deletedAt && space.recordState !== "deleted"));
    const projects = projectAccess.filterReadable(projectRows.filter((project) => !project.deletedAt && project.recordState !== "deleted"));
    const links = await projectSpaceAccess.filterReadableLinks(linkRows.filter((link) => !link.deletedAt && link.recordState === "active"));
    const documents = await documentAccess.filterReadableDocuments(documentRows.filter((document) => !document.deletedAt));
    const projectIds = new Set(projects.map((project) => project._id));
    const taskCounts = new Map<string, number>();
    for (const task of taskRows) {
      if (!task.deletedAt && task.projectId && projectIds.has(task.projectId as Id<"projects">)) {
        taskCounts.set(task.projectId, (taskCounts.get(task.projectId) ?? 0) + 1);
      }
    }
    const documentsByProject = new Map<string, Doc<"docs">[]>();
    for (const document of documents) {
      if (!document.projectId || !projectIds.has(document.projectId as Id<"projects">)) continue;
      documentsByProject.set(document.projectId, [...(documentsByProject.get(document.projectId) ?? []), document]);
    }
    const projectById = new Map(projects.map((project) => [project._id, project]));
    return {
      allProjectsRoute: "/projects/table",
      spaces: spaces.map((space) => {
        const spaceProjects = links
          .filter((link) => link.spaceId === space._id)
          .map((link) => projectById.get(link.projectId))
          .filter((project): project is Doc<"projects"> => Boolean(project));
        const spaceDocuments = spaceProjects.flatMap((project) => documentsByProject.get(project._id) ?? []);
        return {
          id: space._id,
          name: space.name,
          slug: space.slug,
          color: space.color,
          projects: spaceProjects.map((project) => ({
            id: project._id,
            name: project.name,
            route: `/projects/${project._id}`,
            taskCount: taskCounts.get(project._id) ?? 0,
            documents: (documentsByProject.get(project._id) ?? []).map((document) => ({ id: document._id, title: document.title, route: `/docs/${document._id}` })),
          })),
          documents: [...new Map(spaceDocuments.map((document) => [document._id, document])).values()].map((document) => ({ id: document._id, title: document.title, route: `/docs/${document._id}` })),
        };
      }),
      capabilities: {
        canCreateSpace: await canPerformOrganizationAction(ctx, args.organizationId, actor.userId, "space", "create"),
        canCreateProject: await canPerformOrganizationAction(ctx, args.organizationId, actor.userId, "project", "create"),
      },
    };
  },
});
