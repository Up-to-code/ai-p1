import { z } from "zod";

const mcpPermissionSchema = z.object({
  resource: z.enum(["organization", "client", "project", "deal", "calendar", "task", "media", "space"]),
  actions: z.array(z.enum(["read", "create", "update", "delete"])).min(1),
});

export const mcpConnectionScopeSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("organization") }),
  z.object({
    type: z.literal("space"),
    spaceIds: z.array(z.string().trim().min(1)).min(1),
  }),
  z.object({
    type: z.literal("project"),
    projectIds: z.array(z.string().trim().min(1)).min(1),
  }),
]);

export const createMcpConnectionSchema = z.object({
  name: z.string().trim().min(1),
  instructions: z.string().trim().optional().transform((value) => value || undefined),
  principalType: z.enum(["user", "organization"]).optional(),
  permissions: z.array(mcpPermissionSchema).min(1),
  scope: mcpConnectionScopeSchema.default({ type: "organization" }),
  expiresAt: z.coerce.number().optional(),
});

export const updateMcpConnectionSchema = z.object({
  name: z.string().trim().min(1).optional(),
  instructions: z.string().trim().optional().transform((value) => value || undefined),
  permissions: z.array(mcpPermissionSchema).min(1).optional(),
  scope: mcpConnectionScopeSchema.optional(),
  status: z.enum(["active", "paused", "draft"]).optional(),
  expiresAt: z.union([z.coerce.number(), z.null()]).optional(),
});

export type CreateMcpConnectionPayload = z.infer<typeof createMcpConnectionSchema>;
export type UpdateMcpConnectionPayload = z.infer<typeof updateMcpConnectionSchema>;
