import test from "node:test";
import assert from "node:assert/strict";

import { canManageWorkspaceMembers, normalizeWorkspaceRole } from "@/auth/workspace-roles";

test("workspace roles normalize Better Auth prefixes", () => {
  assert.equal(normalizeWorkspaceRole({ role: "org:owner" }), "owner");
  assert.equal(normalizeWorkspaceRole({ role: " ADMIN " }), "admin");
  assert.equal(normalizeWorkspaceRole({ role: null }), null);
});

test("only workspace owners and admins get member-management affordances", () => {
  assert.equal(canManageWorkspaceMembers({ role: "org:owner" }), true);
  assert.equal(canManageWorkspaceMembers({ role: "admin" }), true);
  assert.equal(canManageWorkspaceMembers({ role: "member" }), false);
  assert.equal(canManageWorkspaceMembers({ role: "custom-sales" }), false);
  assert.equal(canManageWorkspaceMembers(undefined), false);
});
