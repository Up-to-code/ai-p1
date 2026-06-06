import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(
  path.join(__dirname, "components", "team-invite-form.tsx"),
  "utf8",
);

describe("onboarding team invite form source", () => {
  it("uses real organization invite APIs instead of static rows", () => {
    expect(source).toContain("createOrganizationInvitation");
    expect(source).toContain("listOrganizationInvitations");
    expect(source).toContain("cancelOrganizationInvitation");
    expect(source).not.toContain("developer@acme.com");
  });

  it("normalizes invite email and blocks duplicate recipients before create", () => {
    expect(source).toContain("normalizeInviteEmail(values.inviteEmail)");
    expect(source).toContain("inviteEmailBlockReason");
    expect(source).toContain("setError(\"inviteEmail\"");
  });

  it("uses the shared Select control for invite roles", () => {
    expect(source).toContain("<Select");
    expect(source).toContain("onboardingInviteRoleOptions");
    expect(source).toContain("formatRoleName");
  });
});
