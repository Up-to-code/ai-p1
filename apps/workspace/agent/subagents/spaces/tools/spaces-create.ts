import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "../../../lib/convex";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";
import { requireOrganizationAction } from "../../../lib/action-workflow";

export default defineTool({
  description: "Create a new space in the organization.",
  inputSchema: z.object({
    name: z.string().trim().min(1).max(100),
    slug: z.string().trim().min(1).max(60).regex(/^[a-z0-9-]+$/),
    description: z.string().max(500).optional(),
    icon: z.string().max(20).optional(),
    color: z.string().max(20).optional(),
    visibility: z.enum(["private", "public", "request_only"]).default("public"),
    defaultProjectVisibility: z.enum(["private", "space_members", "organization"]).optional(),
    allowMemberProjectCreation: z.boolean().optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    await requireOrganizationAction(ctx, organizationId, "role", "create");
    return fetchAuthMutation(ctx, api.spaces.index.create, { organizationId, input: args as never });
  },
});
