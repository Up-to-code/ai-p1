import { NextResponse, type NextRequest } from "next/server";
import {
  copySetCookieHeaders,
  getJsonMessage,
  isExistingAccountResponse,
  readJsonBody,
  resolveBridgeSecret,
  safeResponseJson,
} from "@qentrah/web-foundation/api";
import {
  appendPartnerAuthRateLimitHeaders,
  checkPartnerAuthRateLimit,
  partnerAuthJson,
  partnerAuthRateLimitedResponse,
} from "../partner-auth-rate-limit";
import { validatePartnerSignupInput } from "@/lib/partner-signup";
import { assertPartnersProductionEnv } from "@/security/production-env";
import { buildTrustedSignupHeaders } from "@/trust/auth-request";

const LOCAL_PARTNER_SIGNUP_BRIDGE_SECRET = "local-qentrah-partner-signup-bridge-secret";

function isLocalDevelopmentEnv() {
  return process.env.NODE_ENV === "development" && process.env.VERCEL_ENV !== "production";
}

function readBridgeSecret() {
  return resolveBridgeSecret(
    [
      { header: "x-qentrah-partner-signup-secret", value: process.env.PARTNER_SIGNUP_BRIDGE_SECRET },
      {
        header: "x-qentrah-partner-signup-secret",
        value: isLocalDevelopmentEnv() ? LOCAL_PARTNER_SIGNUP_BRIDGE_SECRET : undefined,
      },
    ],
    "PARTNER_SIGNUP_BRIDGE_SECRET is not configured.",
  );
}

async function callBetterAuth(request: NextRequest, path: "sign-up" | "sign-in", body: Record<string, unknown>) {
  const bridge = readBridgeSecret();
  return fetch(new URL(`/api/auth/${path}/email`, request.nextUrl.origin), {
    method: "POST",
    headers: buildTrustedSignupHeaders({
      request,
      bridgeHeader: bridge.header,
      bridgeSecret: bridge.value,
    }),
    body: JSON.stringify(body),
  });
}

export async function POST(request: NextRequest) {
  try {
    assertPartnersProductionEnv();
    const body = await readJsonBody<Parameters<typeof validatePartnerSignupInput>[0]>(request);
    const parsed = validatePartnerSignupInput(body);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: "PARTNER_SIGNUP_INVALID", message: parsed.message },
        { status: 400 },
      );
    }

    const rateLimit = checkPartnerAuthRateLimit("partner-signup", request, parsed.value.email);
    if (!rateLimit.allowed) {
      return partnerAuthRateLimitedResponse(
        rateLimit,
        { error: "PARTNER_SIGNUP_RATE_LIMITED", message: "Too many signup attempts. Try again shortly." },
      );
    }

    const authBody = {
      email: parsed.value.email,
      password: parsed.value.password,
      name: parsed.value.name,
    };
    let authResponse = await callBetterAuth(request, "sign-up", authBody);
    let authPayload = await safeResponseJson(authResponse, {});
    const accountAlreadyExists = !authResponse.ok && isExistingAccountResponse(authResponse.status, authPayload);

    if (accountAlreadyExists) {
      authResponse = await callBetterAuth(request, "sign-in", {
        email: parsed.value.email,
        password: parsed.value.password,
        rememberMe: true,
      });
      authPayload = await safeResponseJson(authResponse, {});
    }

    if (!authResponse.ok) {
      if (accountAlreadyExists) {
        return partnerAuthJson(
          {
            error: "PARTNER_ACCOUNT_EXISTS",
            message: "An account with this email already exists. Sign in with the password used when the account was created.",
            redirectTo: "/signin?returnTo=%2Fdashboard",
          },
          { status: 409 },
          rateLimit,
        );
      }

      return partnerAuthJson(
        {
          error: "PARTNER_SIGNUP_AUTH_FAILED",
          message: getJsonMessage(authPayload, "Could not create or sign in the partner programmer account."),
        },
        { status: authResponse.status },
        rateLimit,
      );
    }

    const response = NextResponse.json({ ok: true, redirectTo: "/dashboard" });
    copySetCookieHeaders(authResponse, response);
    appendPartnerAuthRateLimitHeaders(response, rateLimit);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: "PARTNER_SIGNUP_FAILED",
        message: error instanceof Error ? error.message : "Partner programmer signup failed.",
      },
      { status: 400 },
    );
  }
}
