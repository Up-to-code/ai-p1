import test from "node:test";
import assert from "node:assert/strict";
import { mock } from "node:test";

import {
  MOBILE_AUTH_CALLBACK_URL,
  mobileSocialProviders,
  signInWithWorkspaceSocialProvider,
  socialAuthError,
} from "@/auth/socialAuth";

test("mobile auth exposes configured social providers without email auth", () => {
  assert.deepEqual([...mobileSocialProviders], ["google"]);
  assert.equal(mobileSocialProviders.includes("google"), true);
  assert.equal((mobileSocialProviders as readonly string[]).includes("email"), false);
});

test("Google social auth starts Clerk SSO through the workspace callback route", async () => {
  const calls: unknown[] = [];
  const createUrl = mock.fn((path: string) => `qentrah://${path.replace(/^\//, "")}`);
  const flow = {
    startSSOFlow: async (input: unknown) => {
      calls.push(input);
      return {
        createdSessionId: "sess_1",
        setActive: async (input: unknown) => {
          calls.push(input);
        },
      };
    },
  };

  await signInWithWorkspaceSocialProvider(flow, "google", createUrl);

  assert.equal(createUrl.mock.callCount(), 1);
  assert.deepEqual(createUrl.mock.calls[0]?.arguments, [MOBILE_AUTH_CALLBACK_URL]);
  assert.deepEqual(calls, [
    { strategy: "oauth_google", redirectUrl: "qentrah://sso-callback" },
    { session: "sess_1" },
  ]);
});

test("social auth surfaces provider setup errors", async () => {
  assert.equal(
    socialAuthError({ code: "PROVIDER_NOT_FOUND" }, "google"),
    "PROVIDER_NOT_FOUND",
  );

  await assert.rejects(
    () => signInWithWorkspaceSocialProvider({
      startSSOFlow: async () => ({}),
    }, "google", (path) => `qentrah://${path.replace(/^\//, "")}`),
    /google sign in is not configured/,
  );
});
