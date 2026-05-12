import type { SessionContext } from "@anan/platform-core/session";
import { normalizeScopes } from "../scopes/catalog";
import type { AnanOidcClaims, AuthContext } from "../types";

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function readStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
  }
  if (typeof value === "string") {
    return normalizeScopes(value);
  }
  return [];
}

export function getClaimScopes(claims: AnanOidcClaims): string[] {
  return normalizeScopes(
    Array.isArray(claims.scp)
      ? claims.scp
      : Array.isArray(claims.scope)
        ? claims.scope
        : typeof claims.scope === "string"
          ? claims.scope
          : undefined,
  );
}

export function getClaimEntitlements(claims: AnanOidcClaims): string[] {
  const explicit = readStringArray(claims.entitlements);
  const permissions = readStringArray(claims.permissions);
  const organizationPermissions = readStringArray(
    claims.org_permissions ?? claims.orgPermissions ?? claims.organizationPermissions,
  );
  const role = readString(claims.role);
  const roleEntitlements = role ? [`workspace:${role}`] : [];
  return [...new Set([...explicit, ...permissions, ...organizationPermissions, ...roleEntitlements])].sort();
}

export function authContextFromClaims(claims: AnanOidcClaims, token?: string): AuthContext {
  const subject = readString(claims.sub);
  if (!subject) {
    throw new Error("OIDC subject claim is required");
  }

  const organizationId = readString(claims.org_id ?? claims.orgId ?? claims.organizationId) ?? null;
  const brokerId = readString(claims.broker_id ?? claims.brokerId) ?? null;
  const redId = readString(claims.red_id ?? claims.redId ?? claims.developer_id ?? claims.developerId) ?? null;
  const ownerType = claims.owner_type === "broker" || claims.owner_type === "developer" || claims.owner_type === "RED"
    ? claims.owner_type
    : brokerId
      ? "broker"
      : redId
        ? "RED"
        : null;

  return {
    token,
    issuer: readString(claims.iss),
    audience: claims.aud,
    subject,
    userId: subject,
    email: readString(claims.email) ?? null,
    name: readString(claims.name) ?? null,
    image: readString(claims.picture) ?? null,
    scopes: getClaimScopes(claims),
    entitlements: getClaimEntitlements(claims),
    organizationId,
    organizationSlug: readString(claims.org_slug ?? claims.orgSlug ?? claims.organizationSlug) ?? null,
    organizationRole: readString(claims.org_role ?? claims.orgRole ?? claims.organizationRole) ?? null,
    organizationPermissions: readStringArray(
      claims.org_permissions ?? claims.orgPermissions ?? claims.organizationPermissions,
    ),
    brokerId,
    redId,
    ownerType,
    ownerId: readString(claims.owner_id) ?? brokerId ?? redId ?? organizationId,
    isActive: true,
    claims,
  };
}

export function authContextFromSessionContext(session: SessionContext, token?: string): AuthContext {
  const claims: AnanOidcClaims = {
    sub: session.userId,
    email: session.email,
    name: session.name,
    picture: session.image,
    role: session.role,
    org_id: session.organizationId,
    org_slug: session.organizationSlug,
    org_role: session.organizationRole,
    org_permissions: session.organizationPermissions,
    broker_id: session.brokerId,
    red_id: session.redId,
    entitlements: [
      ...(session.role ? [`workspace:${session.role}`] : []),
      ...(session.isAdmin ? ["platform:admin"] : []),
      ...(session.adminAccess?.permissions ?? []),
    ],
  };

  return {
    ...authContextFromClaims(claims, token),
    isActive: session.isActive,
  };
}
