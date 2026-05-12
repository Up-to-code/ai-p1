import { NextResponse, type NextRequest } from "next/server";
import {
  copySetCookieHeaders,
  getJsonMessage,
  readJsonBody,
  safeResponseJson,
} from "@anan/web-foundation/api";
import { checkRateLimit, getClientRateLimitKey } from "@/rate-limits/memory";
import { assertPartnersProductionEnv } from "@/security/production-env";
import { buildSameOriginAuthHeaders } from "@/trust/auth-request";

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function callBetterAuthSignIn(request: NextRequest, body: Record<string, unknown>) {
  return fetch(new URL("/api/auth/sign-in/email", request.nextUrl.origin), {
    method: "POST",
    headers: buildSameOriginAuthHeaders(request),
    body: JSON.stringify(body),
  });
}

export async function POST(request: NextRequest) {
  try {
    assertPartnersProductionEnv();
    const body = await readJsonBody<Record<string, unknown>>(request);
    const email = readString(body.email).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "PARTNER_SIGNIN_INVALID", message: "Enter your email and password." },
        { status: 400 },
      );
    }

    const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
    const rateLimit = checkRateLimit(getClientRateLimitKey("partner-signin", `${clientKey}:${email}`), {
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "PARTNER_SIGNIN_RATE_LIMITED", message: "Too many sign in attempts. Try again shortly." },
        { status: 429 },
      );
    }

    const authResponse = await callBetterAuthSignIn(request, {
      email,
      password,
      rememberMe: true,
    });
    const authPayload = await safeResponseJson(authResponse, {});

    if (!authResponse.ok) {
      return NextResponse.json(
        {
          error: "PARTNER_SIGNIN_FAILED",
          message: getJsonMessage(authPayload, "Could not sign in. Check the email and password."),
        },
        { status: authResponse.status },
      );
    }

    const response = NextResponse.json({ ok: true });
    copySetCookieHeaders(authResponse, response);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: "PARTNER_SIGNIN_FAILED",
        message: error instanceof Error ? error.message : "Partner sign in failed.",
      },
      { status: 400 },
    );
  }
}
