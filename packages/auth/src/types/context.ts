import type { AnanOidcClaims } from "./claims";

export type AuthContext = {
  token?: string;
  issuer?: string;
  audience?: string | string[];
  subject: string;
  userId: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  scopes: string[];
  entitlements: string[];
  organizationId?: string | null;
  organizationSlug?: string | null;
  organizationRole?: string | null;
  organizationPermissions: string[];
  brokerId?: string | null;
  redId?: string | null;
  ownerType?: "broker" | "developer" | "RED" | null;
  ownerId?: string | null;
  isActive: boolean;
  claims: AnanOidcClaims;
};

export type ResourceOwner = {
  ownerType?: "broker" | "developer" | "RED" | null;
  ownerId?: string | null;
  brokerId?: string | null;
  redId?: string | null;
  organizationId?: string | null;
};
