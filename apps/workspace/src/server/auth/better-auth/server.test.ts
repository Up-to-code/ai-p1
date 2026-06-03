import { describe, expect, it } from "vitest";
import {
  normalizeBetterAuthRequest,
  normalizeSocialSignInCallbackURL,
} from "./callback-normalization";
import {
  isRecoverableAuthSessionPath,
  staleAuthCookieRecoveryFallback,
  staleAuthCookieRecoveryResponse,
} from "./stale-cookie-recovery";

describe("Better Auth server adapter", () => {
  it("normalizes app-shell social sign-in callbacks before Better Auth creates OAuth state", () => {
    expect(normalizeSocialSignInCallbackURL("/ar/dashboard")).toBe("/ar/choose-org");
    expect(normalizeSocialSignInCallbackURL("/en/projects/project_1")).toBe("/en/choose-org");
  });

  it("preserves organization selection, invite, and mobile callbacks", () => {
    expect(normalizeSocialSignInCallbackURL("/ar/choose-org")).toBe("/ar/choose-org");
    expect(normalizeSocialSignInCallbackURL("/ar/accept-invite?inviteToken=invite_1")).toBe("/ar/accept-invite?inviteToken=invite_1");
    expect(normalizeSocialSignInCallbackURL("/auth-callback")).toBe("/auth-callback");
  });

  it("rewrites social sign-in JSON requests at the Next adapter boundary", async () => {
    const request = new Request("https://app.qentrah.com/api/auth/sign-in/social", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ provider: "google", callbackURL: "/ar/dashboard" }),
    });

    const normalized = await normalizeBetterAuthRequest(request);

    await expect(normalized.json()).resolves.toEqual({
      provider: "google",
      callbackURL: "/ar/choose-org",
    });
  });

  it("leaves non-social auth requests unchanged", async () => {
    const request = new Request("https://app.qentrah.com/api/auth/session", {
      method: "GET",
    });

    await expect(normalizeBetterAuthRequest(request)).resolves.toBe(request);
  });

  it("recovers stale encrypted session cookies as a signed-out session", async () => {
    const request = new Request("https://app.qentrah.com/api/auth/get-session", {
      method: "GET",
      headers: { cookie: "__Secure-better-auth.session_token=stale" },
    });

    const response = staleAuthCookieRecoveryResponse(request, new Response("", { status: 500 }));

    await expect(response.text()).resolves.toBe("null");
    expect(response.status).toBe(200);
    expect(response.headers.getSetCookie().some((cookie) => cookie.startsWith("__Secure-better-auth.session_token=;"))).toBe(true);
    expect(response.headers.getSetCookie().some((cookie) => cookie.startsWith("__Secure-better-auth.convex_jwt=;"))).toBe(true);
  });

  it("recovers thrown stale session failures before Next returns a 500", async () => {
    const request = new Request("https://app.qentrah.com/api/auth/convex/token", {
      method: "GET",
      headers: { cookie: "__Secure-better-auth.convex_jwt=stale" },
    });

    const response = staleAuthCookieRecoveryFallback(request);

    await expect(response.json()).resolves.toEqual({ token: null });
    expect(response.status).toBe(401);
    expect(response.headers.getSetCookie().some((cookie) => cookie.startsWith("__Secure-better-auth.session_token=;"))).toBe(true);
    expect(response.headers.getSetCookie().some((cookie) => cookie.startsWith("__Secure-better-auth.convex_jwt=;"))).toBe(true);
  });

  it("does not rewrite healthy auth responses", () => {
    const request = new Request("https://app.qentrah.com/api/auth/get-session");
    const response = new Response("null", { status: 200 });

    expect(isRecoverableAuthSessionPath(request)).toBe(true);
    expect(staleAuthCookieRecoveryResponse(request, response)).toBe(response);
  });
});
