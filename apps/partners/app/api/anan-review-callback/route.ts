import { fetchMutation } from "convex/nextjs";
import { NextResponse, type NextRequest } from "next/server";
import { partnerBackendRefs } from "@/server/partnerBackendRefs";

function bearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? request.headers.get("x-anan-service-token")?.trim() ?? "";
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function reviewCallbackError(error: unknown) {
  const message = error instanceof Error ? error.message : "Review callback failed.";
  if (message.includes("Could not find public function")) {
    return NextResponse.json(
      {
        error: "Partners backend is not deployed with the review callback functions. Run `npx convex dev` or deploy the Partners Convex backend, then retry the admin action.",
        detail: message,
      },
      { status: 503 },
    );
  }
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
    if (!appId || !["approved", "rejected", "suspended"].includes(status)) {
      return NextResponse.json({ error: "Invalid review callback payload." }, { status: 400 });
    }

    await fetchMutation(partnerBackendRefs.partnerApps.applyHubReviewDecision as never, {
      serviceToken,
      appId,
      status,
      hubPartnerAppId: readString(body.hubPartnerAppId) || undefined,
      hubOauthClientId: readString(body.hubOauthClientId) || undefined,
      reviewNotes: readString(body.reviewNotes) || undefined,
      clientSecret: readString(body.clientSecret) || undefined,
    } as never);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return reviewCallbackError(error);
  }
}
