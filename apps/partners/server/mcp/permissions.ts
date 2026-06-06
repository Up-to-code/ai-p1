import { z } from "zod/v4";

const partnerMcpToolPermissionSchema = z.object({
  resource: z.enum(["partner_apps", "sandbox", "guidance"]),
  actions: z.array(z.enum(["read", "create", "update", "delete", "submit"])).min(1),
});

export const partnerMcpConnectionInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  instructions: z.string().trim().optional().transform((value) => value || undefined),
  permissions: z.array(partnerMcpToolPermissionSchema).min(1, "Select at least one permission.").default([
    { resource: "partner_apps", actions: ["read", "create", "update", "delete", "submit"] },
    { resource: "sandbox", actions: ["read"] },
    { resource: "guidance", actions: ["read"] },
  ]),
  expiresAt: z.union([z.coerce.number(), z.null()]).optional(),
});

export const partnerMcpConnectionUpdateSchema = partnerMcpConnectionInputSchema.partial().extend({
  status: z.enum(["active", "paused"]).optional(),
});

export type PartnerMcpPermission = z.infer<typeof partnerMcpToolPermissionSchema>;
export type PartnerMcpConnectionInput = z.infer<typeof partnerMcpConnectionInputSchema>;
export type PartnerMcpConnectionUpdate = z.infer<typeof partnerMcpConnectionUpdateSchema>;

export function hasMcpPermission(
  permissions: PartnerMcpPermission[],
  resource: PartnerMcpPermission["resource"],
  action: PartnerMcpPermission["actions"][number],
) {
  return permissions.some((permission) => permission.resource === resource && permission.actions.includes(action));
}
