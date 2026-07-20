import { v } from "convex/values";
import { query } from "../_generated/server";
import {
  buildSurfaceProjection,
  readableSurfaceTabs,
} from "../workspaceSurfaces/helpers";
import {
  taskWorkspaceSurfaceProjectionValidator,
  taskWorkspaceTabValidator,
} from "./validators";
import { TASK_WORKSPACE_SURFACE_CONFIG } from "./data";

export const getSurfaceProjection = query({
  args: { organizationId: v.string() },
  returns: v.union(taskWorkspaceSurfaceProjectionValidator, v.null()),
  handler: async (ctx, args) => {
    return buildSurfaceProjection(
      ctx,
      args.organizationId,
      TASK_WORKSPACE_SURFACE_CONFIG,
    );
  },
});
