import { createRemoteJWKSet, jwtVerify } from "jose";
import { api } from "@convex/_generated/api";
import { convexCalls } from "@/server/convex/http-client";
import { getWorkOSClient } from "./client";
import { WORKOS_ACCESS_TOKEN_COOKIE, readCookieFromHeader } from "./cookies";
import { workosRuntimeConfig } from "@/packages/config";

export type WorkOSAccessClaims = {
  sub: string;
  client_id?: string;
  org_id?: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
  sid?: string;
  exp?: number;
  iat?: number;
};

export type WorkOSResolvedSession = {
  userId: string;
  workosUserId: string;
  userName?: string;
  userEmail?: string;
  userImage?: string | null;
  organizationId: string;
  workosOrganizationId: string;
  membershipId?: string;
  workosMembershipId?: string;
  role?: string;
  roles: string[];
  permissions: string[];
  organizationName?: string;
  sessionId?: string;
};

function displayName(user: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  id: string;
}) {
  const name = [user.firstName, user.lastName].map((part) => part?.trim()).filter(Boolean).join(" ");
  return name || user.email || user.id;
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  if (jwks) return jwks;
  const url = getWorkOSClient().userManagement.getJwksUrl(workosRuntimeConfig.clientId);
  jwks = createRemoteJWKSet(new URL(url));
  return jwks;
}

function bearerToken(authorization: string | undefined) {
  return authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? "";
}

function sealedSessionToken(authorization: string | undefined) {
  return authorization?.match(/^WorkOS-Session\s+(.+)$/i)?.[1]?.trim() ?? "";
}

export function workosAccessTokenFromHeaders(headers: Headers) {
  return bearerToken(headers.get("authorization") ?? undefined) ||
    readCookieFromHeader(headers.get("cookie") ?? undefined, WORKOS_ACCESS_TOKEN_COOKIE);
}

export function workosSealedSessionFromHeaders(headers: Headers) {
  return sealedSessionToken(headers.get("authorization") ?? undefined) ||
    headers.get("x-qentrah-workos-session")?.trim() ||
    "";
}

export async function verifyWorkOSAccessToken(token: string): Promise<WorkOSAccessClaims> {
  const result = await jwtVerify(token, getJwks(), {
    issuer: workosRuntimeConfig.issuer,
  });
  const payload = result.payload as WorkOSAccessClaims;
  if (payload.client_id !== workosRuntimeConfig.clientId) {
    throw new Error("WorkOS token client id does not match this application.");
  }
  if (!payload.sub) throw new Error("WorkOS token subject is missing.");
  return payload;
}

export async function ensureWorkOSProjectedSession(input: {
  email?: string;
  workosUserId: string;
  workosOrganizationId: string;
  organizationId?: string;
  organizationName?: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
  sessionId?: string;
}) {
  const resolved = await convexCalls.query<{
    workosUserId: string;
    workosOrganizationId: string;
  }, WorkOSResolvedSession | null>(api.workosAuth.resolveSession, {
    workosUserId: input.workosUserId,
    workosOrganizationId: input.workosOrganizationId,
  });
  if (resolved) {
    const shouldReconcileMobileOwner =
      resolved.organizationId.startsWith("org_workos_") &&
      resolved.userId === input.workosUserId &&
      resolved.role !== "owner";
    if (!shouldReconcileMobileOwner) {
      return {
        ...resolved,
        role: resolved.role ?? input.role,
        roles: resolved.roles.length > 0 ? resolved.roles : input.roles ?? [],
        permissions: resolved.permissions.length > 0 ? resolved.permissions : input.permissions ?? [],
        sessionId: input.sessionId,
      };
    }
  }

  const projected = await convexCalls.mutation<{
    email?: string;
    workosUserId: string;
    workosOrganizationId: string;
    organizationId?: string;
    organizationName?: string;
    role?: string;
    roles: string[];
    permissions: string[];
  }, WorkOSResolvedSession>(api.workosAuth.ensureMobileSessionProjection, {
    email: input.email,
    workosUserId: input.workosUserId,
    workosOrganizationId: input.workosOrganizationId,
    organizationId: input.organizationId,
    organizationName: input.organizationName,
    role: input.role,
    roles: input.roles ?? [],
    permissions: input.permissions ?? [],
  });

  if (resolved) {
    return {
      ...projected,
      role: projected.role,
      roles: projected.roles,
      permissions: projected.permissions,
      sessionId: input.sessionId,
    };
  }

  return {
    ...projected,
    role: projected.role ?? input.role,
    roles: projected.roles.length > 0 ? projected.roles : input.roles ?? [],
    permissions: projected.permissions.length > 0 ? projected.permissions : input.permissions ?? [],
    sessionId: input.sessionId,
  };
}

async function workOSOrganizationContext(workosOrganizationId: string) {
  const organization = await getWorkOSClient().organizations
    .getOrganization(workosOrganizationId)
    .catch(() => null);
  const organizationMetadata = organization?.metadata ?? {};
  const organizationId = organization?.externalId ??
    organizationMetadata.qentrah_organization_id ??
    organizationMetadata.organizationId ??
    undefined;

  return {
    organizationId,
    organizationName: organization?.name,
  };
}

export async function resolveWorkOSSessionFromHeaders(headers: Headers): Promise<WorkOSResolvedSession> {
  const sealedSession = workosSealedSessionFromHeaders(headers);
  if (sealedSession) {
    const session = await getWorkOSClient().userManagement.authenticateWithSessionCookie({
      sessionData: sealedSession,
      cookiePassword: workosRuntimeConfig.cookiePassword,
    });
    if (!session.authenticated) {
      throw new Error("WorkOS mobile session is invalid.");
    }
    if (!session.organizationId) {
      throw new Error("WorkOS organization is required for workspace routes.");
    }
    const organization = await workOSOrganizationContext(session.organizationId);
    return ensureWorkOSProjectedSession({
      email: typeof session.user.email === "string" ? session.user.email : undefined,
      workosUserId: session.user.id,
      workosOrganizationId: session.organizationId,
      organizationId: organization.organizationId,
      organizationName: organization.organizationName,
      role: session.role,
      roles: session.roles,
      permissions: session.permissions,
      sessionId: session.sessionId,
    }).then((resolved) => ({
      ...resolved,
      userName: displayName(session.user),
      userEmail: typeof session.user.email === "string" ? session.user.email : undefined,
      userImage: session.user.profilePictureUrl ?? null,
    }));
  }

  const token = workosAccessTokenFromHeaders(headers);
  if (!token) throw new Error("WorkOS access token is required.");
  const claims = await verifyWorkOSAccessToken(token);
  if (!claims.org_id) throw new Error("WorkOS organization is required for workspace routes.");
  const [user, organization] = await Promise.all([
    getWorkOSClient().userManagement.getUser(claims.sub).catch(() => null),
    workOSOrganizationContext(claims.org_id),
  ]);

  return ensureWorkOSProjectedSession({
    email: typeof user?.email === "string" ? user.email : undefined,
    workosUserId: claims.sub,
    workosOrganizationId: claims.org_id,
    organizationId: organization.organizationId,
    organizationName: organization.organizationName,
    role: claims.role,
    roles: claims.roles,
    permissions: claims.permissions,
    sessionId: claims.sid,
  }).then((resolved) => ({
    ...resolved,
    userName: user ? displayName(user) : undefined,
    userEmail: typeof user?.email === "string" ? user.email : undefined,
    userImage: user?.profilePictureUrl ?? null,
  }));
}
