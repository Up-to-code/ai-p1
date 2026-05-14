import { NextResponse, type NextRequest } from "next/server";
import { partnerAppsRepository } from "@/server/partnerApps";

function bearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? request.headers.get("x-qentrah-service-token")?.trim() ?? "";
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isReviewStatus(value: string): value is "approved" | "rejected" | "suspended" {
  return ["approved", "rejected", "suspended"].includes(value);
}

function reviewCallbackError(error: unknown) {
  const message = error instanceof Error ? error.message : "Review callback failed.";
  if (message.includes("Invalid Partners review callback token")) {
    return NextResponse.json({ error: message }, { status: 401 });
  }
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const serviceToken = bearerToken(request);
    const appId = readString(body.appId);
    const status = readString(body.status);
    if (!appId || !isReviewStatus(status)) {
      return NextResponse.json({ error: "Invalid review callback payload." }, { status: 400 });
    }

    await partnerAppsRepository.applyWorkspaceReviewDecision({
      serviceToken,
      appId,
      status,
      workspacePartnerAppId: readString(body.workspacePartnerAppId) || undefined,
      workspaceOauthClientId: readString(body.workspaceOauthClientId) || undefined,
      reviewNotes: readString(body.reviewNotes) || undefined,
      clientSecret: readString(body.clientSecret) || undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return reviewCallbackError(error);
  }
}
