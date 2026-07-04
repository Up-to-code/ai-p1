import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "../../../lib/convex";
import { requireOrgId } from "../../../lib/org-context";
import { requireOrganizationAction } from "../../../lib/action-workflow";

export default defineTool({
  description: "Update an existing space's name, slug, description, or visibility.",
  inputSchema: z.object({
    spaceId: z.string().min(1),
    name: z.string().trim().min(1).max(100).optional(),
    slug: z.string().trim().min(1).max(60).regex(/^[a-z0-9-]+$/).optional(),
    description: z.string().max(500).optional(),
    icon: z.string().max(20).optional(),
    color: z.string().max(20).optional(),
    visibility: z.enum(["private", "public", "request_only"]).optional(),
    defaultProjectVisibility: z.enum(["private", "space_members", "organization"]).optional(),
    allowMemberProjectCreation: z.boolean().optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    await requireOrganizationAction(ctx, organizationId, "space", "update");
    const { spaceId, ...input } = args;
    return fetchAuthMutation(ctx, api.spaces.index.update, { organizationId, spaceId: spaceId as any, input: input as never });
  },
});
