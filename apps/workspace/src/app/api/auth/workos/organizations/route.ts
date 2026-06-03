import { api } from "@convex/_generated/api";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";
import { convexCalls } from "@/server/convex/http-client";
import {
  resolveWorkOSSessionFromHeaders,
  workosAccessTokenFromHeaders,
  workosSealedSessionFromHeaders,
} from "@/server/auth/workos/session";

type UserOrganization = {
  organizationId: string;
  workosOrganizationId: string;
  name: string;
  role?: string;
  roles: string[];
};

async function organizationList(workosUserId: string) {
  return convexCalls.query<{ workosUserId: string }, UserOrganization[]>(
    api.workosAuth.listUserOrganizations,
    { workosUserId },
  );
}

export async function GET(request: Request) {
  try {
    if (workosAccessTokenFromHeaders(request.headers) || workosSealedSessionFromHeaders(request.headers)) {
      const session = await resolveWorkOSSessionFromHeaders(request.headers);
      return NextResponse.json({
        ok: true,
        activeWorkosOrganizationId: session.workosOrganizationId,
        organizations: await organizationList(session.workosUserId),
      });
    }

    const auth = await withAuth();
    if (!auth.user) {
      return NextResponse.json({ ok: false, error: "WorkOS session is required." }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      activeWorkosOrganizationId: auth.organizationId ?? null,
      organizations: await organizationList(auth.user.id),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Organizations could not be loaded." },
      { status: 401 },
    );
  }
}
