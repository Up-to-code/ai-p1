import { z } from "zod";
import { organizationPermissionStatement } from "@/packages/authz";

const permissionResourceKeys = Object.keys(organizationPermissionStatement) as [
  keyof typeof organizationPermissionStatement,
  ...(keyof typeof organizationPermissionStatement)[],
];

const organizationPermissionResourceSchema = z.enum(permissionResourceKeys);

export const organizationIdentityUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  slug: z.string().trim().min(1).max(120).optional(),
  logo: z.string().trim().max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createOrganizationInvitationSchema = z.object({
  email: z.string().trim().email(),
  role: z.string().trim().min(1).max(80),
});

export const acceptOrganizationInvitationSchema = z.object({
  invitationId: z.string().trim().min(1),
});

export const updateOrganizationMemberRoleSchema = z.object({
  role: z.string().trim().min(1).max(80),
});

const organizationRolePermissionSchema = z.partialRecord(
  organizationPermissionResourceSchema,
  z.array(z.string().trim().min(1)).max(20),
);

export const createOrganizationRoleSchema = z.object({
  role: z.string().trim().min(1).max(80),
  permission: organizationRolePermissionSchema,
});

export const updateOrganizationRoleSchema = z.object({
  roleName: z.string().trim().min(1).max(80).optional(),
  permission: organizationRolePermissionSchema.optional(),
});

export type OrganizationIdentityUpdateInput = z.infer<typeof organizationIdentityUpdateSchema>;
export type CreateOrganizationInvitationInput = z.infer<typeof createOrganizationInvitationSchema>;
export type UpdateOrganizationMemberRoleInput = z.infer<typeof updateOrganizationMemberRoleSchema>;
export type CreateOrganizationRoleInput = z.infer<typeof createOrganizationRoleSchema>;
export type UpdateOrganizationRoleInput = z.infer<typeof updateOrganizationRoleSchema>;
