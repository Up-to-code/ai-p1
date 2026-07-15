import { v } from "convex/values";
import {
  savedViewConfigValidator,
  viewTypeValidator,
} from "../schema/validators";

export const projectWorkspaceViewTypeValidator = v.union(
  v.literal("table"),
  v.literal("list"),
  v.literal("board"),
  v.literal("calendar"),
  v.literal("timeline"),
  v.literal("dashboard"),
);

export const projectWorkspaceTabCapabilitiesValidator = v.object({
  canRename: v.boolean(),
  canReorder: v.boolean(),
  canDuplicate: v.boolean(),
  canShare: v.boolean(),
  canRemove: v.boolean(),
});

export const projectWorkspaceTabValidator = v.object({
  id: v.id("surfaceTabs"),
  label: v.string(),
  icon: v.optional(v.string()),
  order: v.number(),
  canonicalRoute: v.string(),
  savedView: v.object({
    id: v.id("savedViews"),
    name: v.string(),
    viewType: viewTypeValidator,
    config: savedViewConfigValidator,
    sharingMode: v.union(
      v.literal("personal"),
      v.literal("shared"),
      v.literal("protected"),
    ),
    revision: v.number(),
    isSystemDefault: v.boolean(),
  }),
  capabilities: projectWorkspaceTabCapabilitiesValidator,
});

export const projectWorkspaceSurfaceProjectionValidator = v.object({
  surface: v.object({
    id: v.id("surfaces"),
    key: v.string(),
    title: v.string(),
    canonicalRoute: v.string(),
  }),
  tabs: v.array(projectWorkspaceTabValidator),
  capabilities: v.object({
    canCreateView: v.boolean(),
  }),
});

export const projectWorkspaceCreateInputValidator = v.object({
  organizationId: v.string(),
  surfaceId: v.id("surfaces"),
  viewType: projectWorkspaceViewTypeValidator,
  name: v.string(),
  config: savedViewConfigValidator,
});

export const projectManagementTreeProjectionValidator = v.object({
  allProjectsRoute: v.string(),
  spaces: v.array(v.object({
    id: v.id("spaces"),
    name: v.string(),
    slug: v.string(),
    color: v.optional(v.string()),
    projects: v.array(v.object({
      id: v.id("projects"),
      name: v.string(),
      route: v.string(),
      taskCount: v.number(),
      documents: v.array(v.object({ id: v.id("docs"), title: v.string(), route: v.string() })),
    })),
    documents: v.array(v.object({ id: v.id("docs"), title: v.string(), route: v.string() })),
  })),
  channels: v.array(v.object({ id: v.string(), name: v.string(), route: v.string(), scope: v.string() })),
  directMessages: v.array(v.object({ id: v.string(), name: v.string(), route: v.string() })),
  capabilities: v.object({
    canCreateSpace: v.boolean(),
    canCreateProject: v.boolean(),
    canCreateChannel: v.boolean(),
    canCreateDirectMessage: v.boolean(),
  }),
});
