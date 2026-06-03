import { api } from "@convex/_generated/api";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";
import { convexCalls } from "@/server/convex/http-client";
import {
  resolveWorkOSSessionFromHeaders,
  workosAccessTokenFromHeaders,
  workosSealedSessionFromHeaders,
} from "@/server/auth/workos/session";

type ResolvedWorkOSSession = {
  organizationId: string;
  workosOrganizationId: string;
  organizationName?: string;
  role?: string;
  roles: string[];
  permissions: string[];
} | null;

function userName(user: { firstName?: string | null; lastName?: string | null; email?: string }, fallback: string) {
  const firstName = user.firstName?.trim() ?? "";
  const lastName = user.lastName?.trim() ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  return fullName || user.email || fallback;
}

function sessionResponse(input: {
  user: {
    id: string;
    workosUserId: string;
    name: string;
    email: string;
    image?: string | null;
  };
  organization: {
    id: string;
    workosOrganizationId: string;
    name: string;
    role?: string;
    roles: string[];
    permissions: string[];
  };
}) {
  return NextResponse.json({
    ok: true,
    session: input,
  });
}

export async function GET(request: Request) {
  try {
    if (workosAccessTokenFromHeaders(request.headers) || workosSealedSessionFromHeaders(request.headers)) {
      const resolved = await resolveWorkOSSessionFromHeaders(request.headers);
      return sessionResponse({
        user: {
          id: resolved.userId,
          workosUserId: resolved.workosUserId,
          name: resolved.workosUserId,
          email: "Mobile WorkOS user",
          image: null,
        },
        organization: {
          id: resolved.organizationId,
          workosOrganizationId: resolved.workosOrganizationId,
          name: resolved.organizationName ?? "Workspace",
          role: resolved.role,
          roles: resolved.roles,
          permissions: resolved.permissions,
        },
      });
    }

    const auth = await withAuth();
    if (!auth.user) {
      return NextResponse.json({ ok: false, error: "WorkOS session is required." }, { status: 401 });
    }
    const resolvedOrganization = auth.organizationId
      ? await convexCalls.query<{
          workosUserId: string;
          workosOrganizationId: string;
        }, ResolvedWorkOSSession>(api.workosAuth.resolveSession, {
          workosUserId: auth.user.id,
          workosOrganizationId: auth.organizationId,
        }).catch(() => null)
      : null;

    return sessionResponse({
      user: {
        id: auth.user.id,
        workosUserId: auth.user.id,
        name: userName(auth.user, "Account"),
        email: auth.user.email || "No email set",
        image: auth.user.profilePictureUrl ?? null,
      },
      organization: {
        id: resolvedOrganization?.organizationId ?? "",
        workosOrganizationId: resolvedOrganization?.workosOrganizationId ?? "",
        name: resolvedOrganization?.organizationName ?? "Workspace",
        role: auth.role ?? resolvedOrganization?.role,
        roles: auth.roles ?? resolvedOrganization?.roles ?? [],
        permissions: auth.permissions ?? resolvedOrganization?.permissions ?? [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "WorkOS session is required." },
      { status: 401 },
    );
  }
}
