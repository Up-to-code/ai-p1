import { v } from "convex/values";
import {
  savedViewConfigValidator,
  viewTypeValidator,
} from "../schema/validators";

export const taskWorkspaceViewTypeValidator = v.union(
  v.literal("table"),
  v.literal("list"),
  v.literal("board"),
  v.literal("calendar"),
  v.literal("timeline"),
  v.literal("dashboard"),
);

export const taskWorkspaceTabCapabilitiesValidator = v.object({
  canRename: v.boolean(),
  canReorder: v.boolean(),
  canDuplicate: v.boolean(),
  canShare: v.boolean(),
  canRemove: v.boolean(),
});

export const taskWorkspaceTabValidator = v.object({
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
  capabilities: taskWorkspaceTabCapabilitiesValidator,
});

export const taskWorkspaceSurfaceProjectionValidator = v.object({
  surface: v.object({
    id: v.id("surfaces"),
    key: v.string(),
    title: v.string(),
    canonicalRoute: v.string(),
  }),
  tabs: v.array(taskWorkspaceTabValidator),
  capabilities: v.object({
    canCreateView: v.boolean(),
  }),
});

export const taskWorkspaceCreateInputValidator = v.object({
  organizationId: v.string(),
  surfaceId: v.id("surfaces"),
  viewType: taskWorkspaceViewTypeValidator,
  name: v.string(),
  config: savedViewConfigValidator,
});
