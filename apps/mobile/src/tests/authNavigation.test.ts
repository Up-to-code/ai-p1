import test from "node:test";
import assert from "node:assert/strict";

import {
  authRouteWithCallback,
  firstSearchParam,
  sanitizeAuthCallback,
} from "@/auth/authNavigation";

test("auth callback sanitizer keeps internal app routes only", () => {
  assert.equal(sanitizeAuthCallback("/(auth)/accept-invite?inviteToken=abc"), "/(auth)/accept-invite?inviteToken=abc");
  assert.equal(sanitizeAuthCallback("/"), "/");
  assert.equal(sanitizeAuthCallback(undefined), "/");
  assert.equal(sanitizeAuthCallback("https://evil.example/callback"), "/");
  assert.equal(sanitizeAuthCallback("//evil.example/callback"), "/");
  assert.equal(sanitizeAuthCallback("qentrah://accept-invite?inviteToken=abc"), "/");
});

test("auth route builder preserves invite return targets between login and signup", () => {
  assert.equal(
    authRouteWithCallback("/(auth)/register", "/(auth)/accept-invite?inviteToken=abc"),
    "/(auth)/register?callbackURL=%2F(auth)%2Faccept-invite%3FinviteToken%3Dabc",
  );
  assert.equal(authRouteWithCallback("/(auth)/login", "/"), "/(auth)/login");
});

test("firstSearchParam unwraps expo-router repeated params", () => {
  assert.equal(firstSearchParam(["first", "second"]), "first");
  assert.equal(firstSearchParam("single"), "single");
  assert.equal(firstSearchParam(undefined), undefined);
});
