import test from "node:test";
import assert from "node:assert/strict";

import {
  createAndSelectWorkspaceOrganization,
  createWorkspaceInviteLink,
  getAcceptedWorkspaceOrganizationId,
  parseInviteInput,
  requireWorkspaceOrganization,
  selectWorkspaceOrganization,
  slugifyWorkspaceName,
} from "@/auth/workspaceAccess";

test("workspace organization selection activates before returning", async () => {
  const calls: string[] = [];
  const organization = await selectWorkspaceOrganization({
    organizationId: "org_1",
    setActive: async ({ organizationId }) => {
      calls.push(`setActive:${organizationId}`);
      return { data: { id: organizationId, name: "Qentrah" } };
    },
  });

  assert.equal(organization.id, "org_1");
  assert.deepEqual(calls, ["setActive:org_1"]);
});

test("workspace organization creation creates, selects, and returns the new organization", async () => {
  const calls: string[] = [];
  const organization = await createAndSelectWorkspaceOrganization({
    name: "Qentrah Brokerage",
    type: "broker",
    create: async (input) => {
      calls.push(`create:${input.slug}:${input.metadata?.type}`);
      return { data: { id: "org_new", name: input.name, slug: input.slug } };
    },
    setActive: async ({ organizationId }) => {
      calls.push(`setActive:${organizationId}`);
      return { data: { id: organizationId } };
    },
  });

  assert.equal(organization.id, "org_new");
  assert.deepEqual(calls, ["create:qentrah-brokerage:broker", "setActive:org_new"]);
});

test("workspace organization helpers reject missing or mismatched results", () => {
  assert.throws(
    () => requireWorkspaceOrganization({ data: null }, "Could not select this workspace."),
    /Could not select this workspace/,
  );
  assert.throws(
    () => requireWorkspaceOrganization({ data: { id: "org_2" } }, "Could not select this workspace.", "org_1"),
    /Could not select this workspace/,
  );
  assert.throws(
    () => requireWorkspaceOrganization({ error: { code: "ORG_NOT_FOUND" } }, "fallback"),
    /ORG_NOT_FOUND/,
  );
});

test("invite parser accepts urls, relative paths, plain tokens, and missing input", () => {
  assert.deepEqual(
    parseInviteInput("https://app.qentrah.com/en/accept-invite?inviteToken=abc"),
    { kind: "inviteToken", value: "abc" },
  );
  assert.deepEqual(
    parseInviteInput("qentrah://accept-invite?inviteToken=mobile-token"),
    { kind: "inviteToken", value: "mobile-token" },
  );
  assert.deepEqual(
    parseInviteInput("/accept-invite?invitationId=inv_1"),
    { kind: "invitationId", value: "inv_1" },
  );
  assert.deepEqual(parseInviteInput("token-123"), { kind: "inviteToken", value: "token-123" });
  assert.equal(parseInviteInput("   "), null);
});

test("accepted invite organization id is resolved from supported payloads", () => {
  assert.equal(getAcceptedWorkspaceOrganizationId({ organizationId: "org_1" }), "org_1");
  assert.equal(getAcceptedWorkspaceOrganizationId({ inviteLink: { id: "link_1", organizationId: "org_2", role: "member", status: "pending" } }), "org_2");
  assert.equal(getAcceptedWorkspaceOrganizationId({ invitation: { organizationId: "org_3" } }), "org_3");
  assert.equal(getAcceptedWorkspaceOrganizationId({ member: { organizationId: "org_4" } }), "org_4");
  assert.equal(getAcceptedWorkspaceOrganizationId({}), null);
});

test("workspace slug generation normalizes names and falls back for empty values", () => {
  assert.equal(slugifyWorkspaceName("Qentrah Brokerage LLC"), "qentrah-brokerage-llc");
  assert.match(slugifyWorkspaceName("!!!"), /^org-/);
});

test("workspace invite API uses the configured Workspace API origin", async () => {
  process.env.EXPO_PUBLIC_WORKSPACE_API_URL = "https://app.qentrah.com";
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (url, init) => {
    assert.equal(url, "https://app.qentrah.com/api/v1/organizations/org_1/invite-links");
    assert.equal(init?.method, "POST");
    assert.equal(init?.credentials, "include");
    assert.equal(init?.body, JSON.stringify({ role: "member", locale: "en" }));
    return new Response(JSON.stringify({
      inviteUrl: "https://app.qentrah.com/accept-invite?inviteToken=abc",
      inviteLink: { id: "link_1", organizationId: "org_1", role: "member", status: "pending" },
    }));
  }) as typeof fetch;

  try {
    const invite = await createWorkspaceInviteLink("org_1", { role: "member", locale: "en" });
    assert.equal(invite.inviteUrl, "https://app.qentrah.com/accept-invite?inviteToken=abc");
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.EXPO_PUBLIC_WORKSPACE_API_URL;
  }
});
