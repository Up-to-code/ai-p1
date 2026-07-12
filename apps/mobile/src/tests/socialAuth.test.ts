import test from "node:test";
import assert from "node:assert/strict";

import {
  MOBILE_AUTH_CALLBACK_URL,
  mobileSocialProviders,
  signInWithWorkspaceSocialProvider,
  socialAuthError,
} from "@/auth/socialAuth";

test("mobile auth exposes configured social providers", () => {
  assert.deepEqual([...mobileSocialProviders], ["google"]);
});

test("Google social auth uses the Better Auth Expo callback", async () => {
  const calls: unknown[] = [];
  await signInWithWorkspaceSocialProvider("google", {
    signIn: {
      social: async (input) => {
        calls.push(input);
        return { error: null };
      },
    },
  });
  assert.deepEqual(calls, [{ provider: "google", callbackURL: MOBILE_AUTH_CALLBACK_URL }]);
});

test("social auth surfaces provider setup errors", async () => {
  assert.equal(socialAuthError({ code: "PROVIDER_NOT_FOUND" }, "google"), "PROVIDER_NOT_FOUND");
  await assert.rejects(
    () => signInWithWorkspaceSocialProvider("google", {
      signIn: { social: async () => ({ error: { code: "PROVIDER_NOT_FOUND" } }) },
    }),
    /PROVIDER_NOT_FOUND/,
  );
});
