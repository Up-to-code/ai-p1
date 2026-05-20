import { NextResponse } from "next/server";
import { oauthDebug } from "@/lib/oauth-debug";
import { loadQentrahMe } from "@/lib/workspace-api";
import { errorResponse, requireDemoSession } from "../route-helpers";

export async function GET() {
  const { session, response } = await requireDemoSession();
  if (response) return response;
  try {
    oauthDebug("demo.resource.me.start", {
      organizationId: session.organizationId,
      tokenType: session.token_type,
    });
    return NextResponse.json(await loadQentrahMe(session));
  } catch (error) {
    oauthDebug("demo.resource.me.error", {
      organizationId: session.organizationId,
      error: error instanceof Error ? error.message : "unknown",
    });
    return errorResponse(error);
  }
}
