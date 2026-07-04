import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery, fetchAuthMutation } from "../lib/convex";
import { requireOrgId } from "../lib/org-context";
import { updateEntity } from "../lib/update-entity";

export default defineTool({
  description: "Update an existing client's details.",
  inputSchema: z.object({
    clientId: z.string().min(1),
    name: z.string().min(1).optional(),
    type: z.enum(["person", "organization"]).optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    contactName: z.string().optional(),
    website: z.string().optional(),
    notes: z.string().optional(),
    source: z.string().optional(),
    status: z.enum(["new", "active", "nurture", "inactive", "archived"]).optional(),
    visibility: z.enum(["private", "team", "workspace"]).optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    return updateEntity({
      organizationId,
      id: args.clientId,
      idKey: "clientId",
      label: "Client",
      fetchExisting: () => fetchAuthQuery(ctx, api.clients.read.get, { organizationId, clientId: args.clientId as never }),
      updateFn: (orgId, id, data) =>
        fetchAuthMutation(ctx, api.clients.write.updateFromHono, {
          organizationId: orgId,
          clientId: id as never,
          input: data as never,
        }),
      input: args,
      schema: z.object({}).passthrough(),
    });
  },
});
