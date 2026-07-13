import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "../../../lib/convex";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";

export default defineTool({
  description: "Create a new client (person or organization).",
  inputSchema: z.object({
    name: z.string().trim().min(1),
    type: z.enum(["person", "organization"]).default("person"),
    email: z.string().trim().optional().transform((v) => v || undefined),
    phone: z.string().trim().optional().transform((v) => v || undefined),
    company: z.string().trim().optional().transform((v) => v || undefined),
    contactName: z.string().trim().optional().transform((v) => v || undefined),
    website: z.string().trim().optional().transform((v) => v || undefined),
    notes: z.string().trim().optional().transform((v) => v || undefined),
    source: z.string().trim().default("agent"),
    status: z.enum(["new", "active", "nurture", "inactive", "archived"]).default("new"),
    visibility: z.enum(["private", "team", "workspace"]).optional(),
  }).passthrough().superRefine((value, ctx) => {
    if (!value.email && !value.phone) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Provide either email or phone for the client.", path: ["email"] });
    }
  }),
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    return fetchAuthMutation(ctx, api.clients.write.createFromHono, {
      organizationId,
      input: args as never,
    });
  },
});
