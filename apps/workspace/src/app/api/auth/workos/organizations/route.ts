import { api } from "@convex/_generated/api";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";
import { convexCalls } from "@/server/convex/http-client";

type UserOrganization = {
  organizationId: string;
  workosOrganizationId: string;
  name: string;
  role?: string;
  roles: string[];
};

export async function GET() {
  try {
    const auth = await withAuth();
    if (!auth.user) {
      return NextResponse.json({ ok: false, error: "WorkOS session is required." }, { status: 401 });
    }

    const organizations = await convexCalls.query<{ workosUserId: string }, UserOrganization[]>(
      api.workosAuth.listUserOrganizations,
      { workosUserId: auth.user.id },
    );

    return NextResponse.json({
      ok: true,
      activeWorkosOrganizationId: auth.organizationId ?? null,
      organizations,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Organizations could not be loaded." },
      { status: 401 },
    );
  }
}
