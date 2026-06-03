import { describe, expect, it } from "vitest";
import {
  normalizeBetterAuthRequest,
  normalizeSocialSignInCallbackURL,
} from "./callback-normalization";

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
});
