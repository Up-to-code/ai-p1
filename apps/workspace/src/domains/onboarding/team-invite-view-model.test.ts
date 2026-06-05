import { describe, expect, it } from "vitest";
import {
  inviteEmailBlockReason,
  normalizeInviteEmail,
  onboardingInviteRoleOptions,
  pendingInvitations,
} from "./team-invite-view-model";

describe("onboarding team invite view model", () => {
  it("normalizes invite emails for submission and comparisons", () => {
    expect(normalizeInviteEmail("  Owner@Example.COM ")).toBe("owner@example.com");
  });

  it("filters visible invitations to pending invites only", () => {
    expect(pendingInvitations([
      { email: "pending@example.com", status: "pending" },
      { email: "accepted@example.com", status: "accepted" },
    ] as never)).toEqual([{ email: "pending@example.com", status: "pending" }]);
  });

  it("blocks the current user, existing members, and duplicate pending invitations", () => {
    const members = [
      { user: { email: "member@example.com" } },
    ];
    const invitations = [
      { email: "invited@example.com", status: "pending" },
    ];

    expect(inviteEmailBlockReason({
      email: " owner@example.com ",
      currentUserEmail: "OWNER@example.com",
      members: members as never,
      invitations: invitations as never,
    })).toBe("current-user");

    expect(inviteEmailBlockReason({
      email: "member@example.com",
      members: members as never,
      invitations: invitations as never,
    })).toBe("member");

    expect(inviteEmailBlockReason({
      email: "invited@example.com",
      members: members as never,
      invitations: invitations as never,
    })).toBe("pending-invite");
  });

  it("builds onboarding role options without owner", () => {
    expect(onboardingInviteRoleOptions([
      { role: "owner" },
      { role: "admin" },
      { role: "project-manager" },
      { role: "member" },
      { role: "project-manager" },
    ] as never)).toEqual(["member", "admin", "project-manager"]);
  });
});
