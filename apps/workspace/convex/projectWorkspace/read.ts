import { v } from "convex/values";
import { query } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { resolveSpaceAccess } from "../access/space";
import { resolveProjectAccess } from "../access/project";
import { resolveProjectSpaceAccess } from "../access/projectSpace";
import { resolveDocumentAccess } from "../access/document";
import { resolveChannelAccess } from "../access/channel";
import { canPerformOrganizationAction } from "../permissions";
import { requireServerActor } from "../access/actor";
import { assertCanReadSavedViewScope } from "../access/savedView";
import {
  resolveSavedViewGrantAccess,
  type SavedViewAccessDecision,
} from "../access/savedViewGrant";
import {
  canonicalProjectWorkspaceRoute,
  isProjectWorkspaceViewType,
  PROJECT_WORKSPACE_SURFACE_KEY,
} from "./data";
import {
  projectWorkspaceSurfaceProjectionValidator,
  projectWorkspaceTabValidator,
  projectManagementTreeProjectionValidator,
} from "./validators";

type ProjectWorkspaceTabProjection = typeof projectWorkspaceTabValidator.type;

async function accessForView(
  ctx: QueryCtx,
  view: Doc<"savedViews">,
): Promise<SavedViewAccessDecision | null> {
  try {
    await assertCanReadSavedViewScope(ctx, view.organizationId, view);
    if (view.isSystemDefault) {
      return {
        canRead: true,
        canConfigure: false,
        canShare: false,
        canDelete: false,
        canSetDefault: false,
      };
    }
    const access = await resolveSavedViewGrantAccess(ctx, view);
    return access.canRead ? access : null;
  } catch {
    return null;
  }
}

export async function projectWorkspaceTabProjection(
  ctx: QueryCtx,
  tab: Doc<"surfaceTabs">,
): Promise<ProjectWorkspaceTabProjection | null> {
  if (tab.recordState !== "active" || !tab.savedViewId) return null;
  const view = await ctx.db.get(tab.savedViewId);
  if (
    !view ||
    view.recordState !== "active" ||
    view.resourceType !== "project" ||
    !isProjectWorkspaceViewType(view.viewType)
  ) {
    return null;
  }
  const access = await accessForView(ctx, view);
  if (!access) return null;
  const removable = view.isRemovable && !view.isSystemDefault;
  return {
    id: tab._id,
    label: tab.label,
    icon: tab.icon,
    order: tab.order,
    canonicalRoute: canonicalProjectWorkspaceRoute(
      view.viewType,
      view.isSystemDefault ? undefined : view._id,
    ),
    savedView: {
      id: view._id,
      name: view.name,
      viewType: view.viewType,
      config: view.config,
      sharingMode: view.sharingMode ?? (view.isSystemDefault ? "shared" : "personal"),
      revision: view.revision ?? 1,
      isSystemDefault: view.isSystemDefault ?? false,
    },
    capabilities: {
      canRename: removable && access.canConfigure,
      canReorder: access.canConfigure,
      canDuplicate: access.canRead,
      canShare: removable && access.canShare,
      canRemove: removable && access.canConfigure,
    },
  };
}

export async function readableProjectWorkspaceTabs(
  ctx: QueryCtx,
  organizationId: string,
  surfaceId: Doc<"surfaces">["_id"],
) {
  const tabs = await ctx.db
    .query("surfaceTabs")
    .withIndex("by_surface_state_order", (q) =>
      q
        .eq("organizationId", organizationId)
        .eq("surfaceId", surfaceId)
        .eq("recordState", "active"),
    )
    .collect();
  const projected = await Promise.all(
    tabs.map((tab) => projectWorkspaceTabProjection(ctx, tab)),
  );
  return projected
    .filter((tab): tab is ProjectWorkspaceTabProjection => tab !== null)
    .sort((left, right) => left.order - right.order);
}

export const getSurfaceProjection = query({
  args: { organizationId: v.string() },
  returns: v.union(projectWorkspaceSurfaceProjectionValidator, v.null()),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const surface = await ctx.db
      .query("surfaces")
      .withIndex("by_organization_key", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("key", PROJECT_WORKSPACE_SURFACE_KEY),
      )
      .first();
    if (!surface || surface.recordState !== "active") return null;
    return {
      surface: {
        id: surface._id,
        key: surface.key,
        title: surface.title,
        canonicalRoute: "/projects/table",
      },
      tabs: await readableProjectWorkspaceTabs(
        ctx,
        args.organizationId,
        surface._id,
      ),
      capabilities: { canCreateView: true },
    };
  },
});

export const getProjectManagementTree = query({
  args: { organizationId: v.string() },
  returns: projectManagementTreeProjectionValidator,
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const actor = await requireServerActor(ctx);
    const [spaceAccess, projectAccess, projectSpaceAccess, documentAccess, channelAccess] = await Promise.all([
      resolveSpaceAccess(ctx, args.organizationId),
      resolveProjectAccess(ctx, args.organizationId),
      resolveProjectSpaceAccess(ctx, args.organizationId),
      resolveDocumentAccess(ctx, args.organizationId),
      resolveChannelAccess(ctx, args.organizationId),
    ]);
    const [spaceRows, projectRows, linkRows, documentRows, channelRows, taskRows] = await Promise.all([
      ctx.db.query("spaces").withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId)).take(200),
      ctx.db.query("projects").withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId)).take(300),
      ctx.db.query("projectSpaces").withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId)).take(800),
      ctx.db.query("docs").withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId)).take(500),
      ctx.db.query("channels").withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId)).take(500),
      ctx.db.query("tasks").withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId)).take(2_000),
    ]);
    const spaces = spaceAccess.filterReadable(spaceRows.filter((space) => !space.deletedAt && space.recordState !== "deleted"));
    const projects = projectAccess.filterReadable(projectRows.filter((project) => !project.deletedAt && project.recordState !== "deleted"));
    const links = await projectSpaceAccess.filterReadableLinks(linkRows.filter((link) => !link.deletedAt && link.recordState === "active"));
    const documents = await documentAccess.filterReadableDocuments(documentRows.filter((document) => !document.deletedAt));
    const channels = await channelAccess.filterReadable(channelRows);
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
      channels: channels.filter((channel) => channel.type !== "dm").map((channel) => ({ id: channel.id, name: channel.name, route: `/channels/${channel.id}`, scope: channel.type })),
      directMessages: channels.filter((channel) => channel.type === "dm").map((channel) => ({ id: channel.id, name: channel.name, route: `/channels/${channel.id}` })),
      capabilities: {
        canCreateSpace: await canPerformOrganizationAction(ctx, args.organizationId, actor.userId, "space", "create"),
        canCreateProject: await canPerformOrganizationAction(ctx, args.organizationId, actor.userId, "project", "create"),
        canCreateChannel: await canPerformOrganizationAction(ctx, args.organizationId, actor.userId, "channel", "create"),
        canCreateDirectMessage: true,
      },
    };
  },
});
