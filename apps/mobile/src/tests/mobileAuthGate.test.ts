import test from "node:test";
import assert from "node:assert/strict";

import { resolveMobileAuthGate, type ResolveMobileAuthGateInput } from "@/auth/mobileAuthGateResolver";

const base: ResolveMobileAuthGateInput = {
  activeOrganizationId: null,
  authConfigured: true,
  authPending: false,
  e2eForceAuthScreen: false,
  e2eSignedIn: false,
  hasSession: false,
  hydrationComplete: true,
  organizationCount: 0,
  organizationPending: false,
  workspaceError: null,
};

test("mobile auth gate sends signed-out users to auth", () => {
  const result = resolveMobileAuthGate(base);

  assert.equal(result.status, "signed_out");
  assert.equal(result.destination, "/(auth)");
  assert.equal(result.isAuthenticated, false);
});

test("mobile auth gate waits during session restore", () => {
  const result = resolveMobileAuthGate({ ...base, authPending: true });

  assert.equal(result.status, "loading");
  assert.equal(result.destination, null);
  assert.equal(result.isReady, false);
});

test("mobile auth gate opens home for active workspace", () => {
  const result = resolveMobileAuthGate({ ...base, activeOrganizationId: "org_1", hasSession: true });

  assert.equal(result.status, "ready");
  assert.equal(result.destination, "/(app)");
  assert.equal(result.workspaceStatus, "ready");
});

test("mobile auth gate uses native session before JS user profile sync", () => {
  const result = resolveMobileAuthGate({ ...base, activeOrganizationId: "org_1", hasSession: true });

  assert.equal(result.isAuthenticated, true);
  assert.equal(result.destination, "/(app)");
});

test("mobile auth gate auto-selects one workspace", () => {
  const result = resolveMobileAuthGate({ ...base, hasSession: true, organizationCount: 1 });

  assert.equal(result.status, "selecting_workspace");
  assert.equal(result.destination, null);
  assert.equal(result.isReady, false);
});

test("mobile auth gate sends multiple workspaces to chooser", () => {
  const result = resolveMobileAuthGate({ ...base, hasSession: true, organizationCount: 2 });

  assert.equal(result.status, "choose_workspace");
  assert.equal(result.destination, "/(auth)/choose-workspace");
});

test("mobile auth gate sends signed-in users without orgs to setup", () => {
  const result = resolveMobileAuthGate({ ...base, hasSession: true, organizationCount: 0 });

  assert.equal(result.status, "setup_workspace");
  assert.equal(result.destination, "/(auth)/choose-workspace");
});

test("mobile auth gate exposes workspace errors on setup route", () => {
  const result = resolveMobileAuthGate({ ...base, hasSession: true, workspaceError: "No access" });

  assert.equal(result.status, "error");
  assert.equal(result.destination, "/(auth)/choose-workspace");
  assert.equal(result.workspaceStatus, "error");
});
