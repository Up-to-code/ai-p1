import { NextRequest, NextResponse } from "next/server";
import { authDebug } from "@/lib/auth-debug";
import { parsePartnerKeyCallbackPayload, partnerKeySessionFromCallback } from "@/lib/partner-key-auth";
import { storeTokenSession } from "@/lib/session";

function callbackError(error: unknown) {
  const message = error instanceof Error ? error.message : "Invalid Workspace partner authorization callback.";
  authDebug("demo.workos_partner_key.callback.invalid", { message });
  return NextResponse.json({ error: "invalid_partner_key_callback", message }, { status: 400 });
}

async function acceptCallbackPayload(request: NextRequest, payload: Record<string, unknown>) {
  try {
    const input = parsePartnerKeyCallbackPayload(payload);
    await storeTokenSession(partnerKeySessionFromCallback(input));
    authDebug("demo.workos_partner_key.callback.success", {
      organizationId: input.organizationId,
      keyId: input.keyId,
      keyLast4: input.keyLast4,
      hasExpiresAt: Boolean(input.expiresAt),
    });
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    return callbackError(error);
  }
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.has("error")) {
    return NextResponse.json({
      error: request.nextUrl.searchParams.get("error"),
      error_description: request.nextUrl.searchParams.get("error_description") ?? undefined,
    }, { status: 400 });
  }

  return acceptCallbackPayload(request, Object.fromEntries(request.nextUrl.searchParams));
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json() as Record<string, unknown>;
    return acceptCallbackPayload(request, payload);
  } catch {
    return callbackError(new Error("Callback request body must be valid JSON."));
  }
}
