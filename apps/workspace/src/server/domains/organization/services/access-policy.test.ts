import { describe, expect, it } from "vitest";
import {
  assertCanChangeMemberRole,
  assertCanDeleteRole,
  assertCanRemoveMember,
  assertOrganizationRetainsOwnerAfterMemberChange,
  normalizeOrganizationRoleName,
  validatePermissionPayload,
} from "./access-policy";

const owner = { id: "member_owner", userId: "user_owner", role: "owner", user: { email: "owner@example.com" } };
const admin = { id: "member_admin", userId: "user_admin", role: "admin", user: { email: "admin@example.com" } };
const customRole = { id: "role_project", role: "project-manager" };

describe("organization access policy", () => {
  it("normalizes custom work role names", () => {
    expect(normalizeOrganizationRoleName(" Project Manager ")).toBe("project-manager");
    expect(normalizeOrganizationRoleName("CRM / Sales")).toBe("crm-sales");
  });

  it("accepts only permissions from the shared catalog", () => {
    expect(validatePermissionPayload({ project: ["read", "create", "read"], media: ["read", "create"] })).toEqual({
      project: ["read", "create"],
      media: ["read", "create"],
    });

    expect(() => validatePermissionPayload({ project: ["publish"] })).toThrow("Unknown allowed work");
    expect(() => validatePermissionPayload({ nope: ["read"] } as never)).toThrow("Unknown work area");
  });

  it("blocks self removal and last owner removal", () => {
    expect(() =>
      assertCanRemoveMember({
        currentUserId: "user_owner",
        targetMemberIdOrEmail: "member_owner",
        members: [owner, admin],
      }),
    ).toThrow("remove yourself");

    expect(() =>
      assertCanRemoveMember({
        currentUserId: "user_admin",
        targetMemberIdOrEmail: "member_owner",
        members: [owner, admin],
      }),
    ).toThrow("at least one owner");
  });

  it("blocks demoting the last owner", () => {
    expect(() =>
      assertCanChangeMemberRole({
        targetMemberId: "member_owner",
        nextRole: "admin",
        members: [owner, admin],
        roles: [customRole],
      }),
    ).toThrow("at least one owner");
  });

  it("allows owner transitions when the organization keeps another owner", () => {
    const secondOwner = { id: "member_owner_2", userId: "user_owner_2", role: "owner,member" };

    expect(() =>
      assertOrganizationRetainsOwnerAfterMemberChange({
        currentRole: owner.role,
        members: [owner, secondOwner],
      }),
    ).not.toThrow();
    expect(() =>
      assertOrganizationRetainsOwnerAfterMemberChange({
        currentRole: owner.role,
        nextRole: "admin",
        members: [owner, secondOwner],
      }),
    ).not.toThrow();
    expect(() =>
      assertOrganizationRetainsOwnerAfterMemberChange({
        currentRole: owner.role,
        nextRole: "owner,admin",
        members: [owner, admin],
      }),
    ).not.toThrow();
  });

  it("blocks deleting built-in or in-use custom roles", () => {
    expect(() =>
      assertCanDeleteRole({
        role: { id: "owner", role: "owner" },
        members: [owner, admin],
        invitations: [],
        pendingInviteLinkCount: 0,
      }),
    ).toThrow("Built-in");

    expect(() =>
      assertCanDeleteRole({
        role: customRole,
        members: [{ id: "member_project", userId: "user_project", role: "project-manager" }],
        invitations: [],
        pendingInviteLinkCount: 0,
      }),
    ).toThrow("team members");

    expect(() =>
      assertCanDeleteRole({
        role: customRole,
        members: [owner, admin],
        invitations: [{ role: "project-manager", status: "pending" }],
        pendingInviteLinkCount: 0,
      }),
    ).toThrow("pending invitations");
  });
});
