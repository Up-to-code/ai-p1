import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery, fetchAuthMutation } from "../lib/convex";
import { requireOrgId } from "../lib/org-context";
import { updateEntity } from "../lib/update-entity";

export default defineTool({
  description: "Update an existing project.",
  inputSchema: z.object({
    projectId: z.string().min(1),
    name: z.string().min(1).optional(),
    clientId: z.string().min(1).optional(),
    opportunityId: z.string().min(1).optional(),
    status: z.enum(["planned", "active", "paused", "completed", "archived"]).optional(),
    health: z.enum(["onTrack", "atRisk", "blocked"]).optional(),
    visibility: z.enum(["private", "team", "workspace"]).optional(),
    budget: z.number().optional(),
    currency: z.string().optional(),
    description: z.string().optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    return updateEntity({
      organizationId,
      id: args.projectId,
      idKey: "projectId",
      label: "Project",
      fetchExisting: () => fetchAuthQuery(ctx, api.projects.read.get, { organizationId, projectId: args.projectId as never }),
      updateFn: (orgId, id, data) =>
        fetchAuthMutation(ctx, api.projects.write.updateFromHono, {
          organizationId: orgId,
          projectId: id as never,
          input: data as never,
        }),
      input: args,
      schema: z.object({}).passthrough(),
    });
  },
});
