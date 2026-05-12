export type AdminAccess = {
  enabled: boolean;
  level: string;
  permissions: string[];
  revokedAt?: number;
};

export type SessionContext = {
  userId: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  username?: string | null;
  role?: string;
  isAdmin?: boolean;
  adminAccess?: AdminAccess | null;
  brokerId?: string;
  redId?: string;
  organizationId?: string | null;
  organizationSlug?: string | null;
  organizationRole?: string | null;
  organizationPermissions?: string[];
  isActive: boolean;
};

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string | null;
  organizationId?: string | null;
  organizationSlug?: string | null;
  organizationRole?: string | null;
  organizationPermissions?: string[];
  isActive: boolean;
};

export function toSessionUser(context: SessionContext): SessionUser {
  return {
    id: context.userId,
    name: context.name,
    email: context.email,
    image: context.image,
    username: context.username,
    organizationId: context.organizationId,
    organizationSlug: context.organizationSlug,
    organizationRole: context.organizationRole,
    organizationPermissions: context.organizationPermissions,
    isActive: context.isActive,
  };
}
