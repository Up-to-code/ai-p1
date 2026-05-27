import test from "node:test";
import assert from "node:assert/strict";

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

test("Google social auth starts Better Auth through the workspace callback route", async () => {
  const calls: unknown[] = [];
  const client = {
    signIn: {
      social: async (input: unknown) => {
        calls.push(input);
        return {};
      },
    },
    getSession: async () => {
      calls.push("getSession");
    },
  };

  await signInWithWorkspaceSocialProvider(client, "google");

  assert.deepEqual(calls, [
    { provider: "google", callbackURL: MOBILE_AUTH_CALLBACK_URL },
    "getSession",
  ]);
});

test("social auth surfaces provider setup errors", async () => {
  assert.equal(
    socialAuthError({ code: "PROVIDER_NOT_FOUND" }, "google"),
    "PROVIDER_NOT_FOUND",
  );

  await assert.rejects(
    () => signInWithWorkspaceSocialProvider({
      signIn: {
        social: async () => ({ error: { message: "Google OAuth is not configured." } }),
      },
      getSession: async () => undefined,
    }, "google"),
    /Google OAuth is not configured/,
  );
});
