import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery, fetchAuthMutation } from "../../../lib/convex";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";
import {
  buildProjectUpdateInput,
  projectUpdatePatchSchema,
} from "../project-update-input";

export default defineTool({
  description: "Update an existing project.",
  inputSchema: projectUpdatePatchSchema
    .extend({ projectId: z.string().min(1) })
    .strict(),
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    const existing = await fetchAuthQuery(ctx, api.projects.read.get, {
      organizationId,
      projectId: args.projectId as never,
    });
    if (!existing) throw new Error("Project was not found.");
    const { projectId, ...patch } = args;
    return fetchAuthMutation(ctx, api.projects.write.updateFromHono, {
      organizationId,
      projectId: projectId as never,
      input: buildProjectUpdateInput(existing, patch) as never,
    });
  },
});
