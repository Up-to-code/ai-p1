import test from "node:test";
import assert from "node:assert/strict";

import { socialAuthErrorMessage } from "@/auth/authErrors";
import {
  confirmWorkspaceEmailVerification,
  confirmWorkspacePasswordReset,
  mobileSocialProviders,
  requestWorkspacePasswordReset,
  signInWithWorkspaceEmailPassword,
  signInWithWorkspaceSocialProvider,
  registerWithWorkspaceEmailPassword,
  socialAuthError,
} from "@/auth/socialAuth";
import { resolveMobileAuthProviders } from "@/auth/mobileAuthProviders";

test("mobile auth exposes Apple and Google social auth without an inline email social provider", () => {
  assert.deepEqual([...mobileSocialProviders], ["apple", "google"]);
  assert.equal(mobileSocialProviders.includes("apple"), true);
  assert.equal(mobileSocialProviders.includes("google"), true);
  assert.equal((mobileSocialProviders as readonly string[]).includes("email"), false);
});

test("mobile auth provider presentation mirrors the supported social providers", () => {
  assert.deepEqual(resolveMobileAuthProviders(), [
    { provider: "apple" },
    { provider: "google" },
  ]);
});

test("social auth starts WorkOS through the mobile app callback route", async () => {
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
    { provider: "google" },
    "getSession",
  ]);

  await signInWithWorkspaceSocialProvider(client, "apple");

  assert.deepEqual(calls.slice(2), [
    { provider: "apple" },
    "getSession",
  ]);
});

test("email password auth starts local WorkOS password sign in with the mobile callback", async () => {
  const calls: unknown[] = [];
  const client = {
    signIn: {
      password: async (input: unknown) => {
        calls.push(input);
        return {};
      },
      social: async () => ({}),
    },
    getSession: async () => {
      calls.push("getSession");
    },
  };

  await signInWithWorkspaceEmailPassword(client, { email: "agent@example.com", password: "password-1" });

  assert.deepEqual(calls, [
    { email: "agent@example.com", password: "password-1" },
    "getSession",
  ]);
});

test("email password registration starts local WorkOS password registration with the mobile callback", async () => {
  const calls: unknown[] = [];
  const client = {
    signIn: {
      social: async () => ({}),
    },
    signUp: {
      emailPassword: async (input: unknown) => {
        calls.push(input);
        return {};
      },
    },
    getSession: async () => {
      calls.push("getSession");
    },
  };

  await registerWithWorkspaceEmailPassword(client, {
    name: "Noura Ahmed",
    email: "noura@example.com",
    password: "password-1",
  });

  assert.deepEqual(calls, [
    {
      name: "Noura Ahmed",
      email: "noura@example.com",
      password: "password-1",
    },
    "getSession",
  ]);
});

test("password reset request and confirmation use the mobile auth client", async () => {
  const calls: unknown[] = [];
  const client = {
    signIn: {
      social: async () => ({}),
    },
    requestPasswordReset: async (input: unknown) => {
      calls.push(input);
      return {};
    },
    confirmPasswordReset: async (input: unknown) => {
      calls.push(input);
      return {};
    },
    getSession: async () => undefined,
  };

  await requestWorkspacePasswordReset(client, "agent@example.com");
  await confirmWorkspacePasswordReset(client, { token: "reset-token", newPassword: "password-1" });

  assert.deepEqual(calls, [
    { email: "agent@example.com" },
    { token: "reset-token", newPassword: "password-1" },
  ]);
});

test("email verification challenge is preserved for password sign in", async () => {
  const challenge = {
    code: "email_verification_required" as const,
    email: "agent@example.com",
    pendingAuthenticationToken: "pending-token",
  };
  const client = {
    signIn: {
      password: async () => ({
        error: {
          message: "Email verification required.",
          emailVerification: challenge,
        },
      }),
      social: async () => ({}),
    },
    getSession: async () => undefined,
  };

  await assert.rejects(
    () => signInWithWorkspaceEmailPassword(client, { email: "agent@example.com", password: "password-1" }),
    (error) => {
      assert.deepEqual((error as { emailVerification?: unknown }).emailVerification, challenge);
      return true;
    },
  );
});

test("email verification confirmation stores the resulting mobile session", async () => {
  const calls: unknown[] = [];
  const client = {
    signIn: {
      social: async () => ({}),
    },
    confirmEmailVerification: async (input: unknown) => {
      calls.push(input);
      return {};
    },
    getSession: async () => {
      calls.push("getSession");
    },
  };

  await confirmWorkspaceEmailVerification(client, {
    code: "123456",
    pendingAuthenticationToken: "pending-token",
  });

  assert.deepEqual(calls, [
    { code: "123456", pendingAuthenticationToken: "pending-token" },
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
        social: async () => ({ error: { message: "Qentrah sign-in is not configured." } }),
      },
      getSession: async () => undefined,
    }, "google"),
    /Qentrah sign-in is not configured/,
  );
});

test("social auth does not show email password or linked-account copy for account lookup errors", () => {
  assert.equal(
    socialAuthErrorMessage(new Error("The email or password does not match a Qentrah account."), undefined, "google"),
    "Google sign in could not finish. Try again.",
  );
  assert.equal(
    socialAuthErrorMessage(new Error("User not found."), undefined, "apple"),
    "Apple sign in could not finish. Try again.",
  );
  assert.equal(
    socialAuthErrorMessage(new Error("User not found.")),
    "social sign in could not finish. Try again.",
  );
  assert.equal(
    socialAuthErrorMessage(new Error("GoogleOAuth was cancelled."), undefined, "google"),
    "Google sign in was cancelled.",
  );
  assert.equal(
    socialAuthErrorMessage(new Error("AppleOAuth provider not found."), undefined, "apple"),
    "Apple sign in is not ready in this build. Check the app configuration and try again.",
  );
});
