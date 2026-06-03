import test from "node:test";
import assert from "node:assert/strict";

import {
  MOBILE_AUTH_ENTRY_ROUTE,
  MOBILE_WORKSPACE_GATE_ROUTE,
  authRouteWithCallback,
  mobilePostAuthRoute,
  sanitizeAuthCallback,
} from "@/auth/authNavigation";

test("auth callback sanitizing falls back to the workspace gate", () => {
  assert.equal(sanitizeAuthCallback(undefined), MOBILE_WORKSPACE_GATE_ROUTE);
  assert.equal(sanitizeAuthCallback(""), MOBILE_WORKSPACE_GATE_ROUTE);
  assert.equal(sanitizeAuthCallback("https://evil.example"), MOBILE_WORKSPACE_GATE_ROUTE);
  assert.equal(sanitizeAuthCallback("//evil.example"), MOBILE_WORKSPACE_GATE_ROUTE);
  assert.equal(sanitizeAuthCallback("/(auth)/choose-workspace"), "/(auth)/choose-workspace");
});

test("auth route callback avoids self and gate loops", () => {
  assert.equal(authRouteWithCallback("/(auth)/login", MOBILE_WORKSPACE_GATE_ROUTE), "/(auth)/login");
  assert.equal(authRouteWithCallback("/(auth)/login", "/(auth)/login"), "/(auth)/login");
  assert.equal(
    authRouteWithCallback("/(auth)/login", "/(auth)/choose-workspace"),
    "/(auth)/login?callbackURL=%2F(auth)%2Fchoose-workspace",
  );
});

test("mobile post-auth routing sends signed-in users through workspace selection", () => {
  assert.equal(mobilePostAuthRoute({ canAccessApp: false }), MOBILE_AUTH_ENTRY_ROUTE);
  assert.equal(mobilePostAuthRoute({ canAccessApp: true, workspaceStatus: "ready" }), "/(app)");
  assert.equal(mobilePostAuthRoute({ canAccessApp: true, workspaceStatus: "needs_workspace" }), MOBILE_WORKSPACE_GATE_ROUTE);
  assert.equal(mobilePostAuthRoute({ canAccessApp: true, workspaceStatus: "error" }), MOBILE_WORKSPACE_GATE_ROUTE);
});
