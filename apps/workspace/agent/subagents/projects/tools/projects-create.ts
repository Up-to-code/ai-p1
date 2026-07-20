import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "../../../lib/convex";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";
import {
  projectStatusSchema,
  projectHealthSchema,
  projectVisibilitySchema,
} from "@qentrah/domain-contracts";

export default defineTool({
  description: "Create a new project.",
  inputSchema: z.object({
    name: z.string().min(1),
    clientId: z.string().min(1).optional(),
    opportunityId: z.string().min(1).optional(),
    status: projectStatusSchema,
    health: projectHealthSchema.default("onTrack"),
    visibility: projectVisibilitySchema.optional(),
    budget: z.number().optional(),
    currency: z.string().optional(),
    description: z.string().optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    return fetchAuthMutation(ctx, api.projects.write.createFromHono, {
      organizationId,
      input: args as never,
    });
  },
});
