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

async function resolveProjectedSession(input: {
  workosUserId: string;
  workosOrganizationId: string;
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
  if (!resolved) throw new Error("WorkOS session has no matching Convex organization membership.");

  return {
    ...resolved,
    role: input.role ?? resolved.role,
    roles: input.roles ?? resolved.roles,
    permissions: input.permissions ?? resolved.permissions,
    sessionId: input.sessionId,
  };
}

async function ensureMobileProjectedSession(input: {
  email?: string;
  workosUserId: string;
  workosOrganizationId: string;
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
    return {
      ...resolved,
      role: input.role ?? resolved.role,
      roles: input.roles ?? resolved.roles,
      permissions: input.permissions ?? resolved.permissions,
      sessionId: input.sessionId,
    };
  }

  const projected = await convexCalls.mutation<{
    email?: string;
    workosUserId: string;
    workosOrganizationId: string;
    role?: string;
    roles: string[];
    permissions: string[];
  }, WorkOSResolvedSession>(api.workosAuth.ensureMobileSessionProjection, {
    email: input.email,
    workosUserId: input.workosUserId,
    workosOrganizationId: input.workosOrganizationId,
    role: input.role,
    roles: input.roles ?? [],
    permissions: input.permissions ?? [],
  });

  return {
    ...projected,
    role: input.role ?? projected.role,
    roles: input.roles ?? projected.roles,
    permissions: input.permissions ?? projected.permissions,
    sessionId: input.sessionId,
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
    return ensureMobileProjectedSession({
      email: typeof session.user.email === "string" ? session.user.email : undefined,
      workosUserId: session.user.id,
      workosOrganizationId: session.organizationId,
      role: session.role,
      roles: session.roles,
      permissions: session.permissions,
      sessionId: session.sessionId,
    });
  }

  const token = workosAccessTokenFromHeaders(headers);
  if (!token) throw new Error("WorkOS access token is required.");
  const claims = await verifyWorkOSAccessToken(token);
  if (!claims.org_id) throw new Error("WorkOS organization is required for workspace routes.");

  return resolveProjectedSession({
    workosUserId: claims.sub,
    workosOrganizationId: claims.org_id,
    role: claims.role,
    roles: claims.roles,
    permissions: claims.permissions,
    sessionId: claims.sid,
  });
}
