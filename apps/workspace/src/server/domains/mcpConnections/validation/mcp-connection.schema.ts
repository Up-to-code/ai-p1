import { z } from "zod";

const mcpPermissionSchema = z.object({
  resource: z.enum(["organization", "client", "project", "calendar", "task", "media"]),
  actions: z.array(z.enum(["read", "create", "update", "delete"])).min(1),
});

export const createMcpConnectionSchema = z.object({
  name: z.string().trim().min(1),
  instructions: z.string().trim().optional().transform((value) => value || undefined),
  principalType: z.enum(["user", "organization"]).optional(),
  permissions: z.array(mcpPermissionSchema).min(1),
  expiresAt: z.coerce.number().optional(),
});

export const updateMcpConnectionSchema = z.object({
  name: z.string().trim().min(1).optional(),
  instructions: z.string().trim().optional().transform((value) => value || undefined),
  permissions: z.array(mcpPermissionSchema).min(1).optional(),
  status: z.enum(["active", "paused", "draft"]).optional(),
  expiresAt: z.union([z.coerce.number(), z.null()]).optional(),
});

export type CreateMcpConnectionPayload = z.infer<typeof createMcpConnectionSchema>;
export type UpdateMcpConnectionPayload = z.infer<typeof updateMcpConnectionSchema>;
