import { describe, expect, it } from "vitest";
import {
  eventWorkosOrganizationId,
  eventWorkosUserId,
  membershipStatus,
  shouldProjectMembershipEvent,
} from "./workosAuth";

describe("WorkOS auth projection helpers", () => {
  it("resolves organization ids from direct organization events and nested membership events", () => {
    expect(eventWorkosOrganizationId({
      event: "organization.updated",
      data: { id: "org_workos_1" },
    })).toBe("org_workos_1");

    expect(eventWorkosOrganizationId({
      event: "organization_membership.updated",
      data: { organization_id: "org_workos_2" },
    })).toBe("org_workos_2");
  });

  it("resolves user ids from direct user events and nested membership events", () => {
    expect(eventWorkosUserId({
      event: "user.deleted",
      data: { id: "user_workos_1" },
    })).toBe("user_workos_1");

    expect(eventWorkosUserId({
      event: "organization_membership.updated",
      data: { user_id: "user_workos_2" },
    })).toBe("user_workos_2");
  });

  it("normalizes membership status defensively", () => {
    expect(membershipStatus("pending")).toBe("pending");
    expect(membershipStatus("inactive")).toBe("inactive");
    expect(membershipStatus("deleted")).toBe("deleted");
    expect(membershipStatus("unknown")).toBe("active");
    expect(membershipStatus(undefined)).toBe("active");
  });

  it("projects WorkOS membership create and update without treating delete as an upsert", () => {
    expect(shouldProjectMembershipEvent("organization_membership.created")).toBe(true);
    expect(shouldProjectMembershipEvent("organization_membership.updated")).toBe(true);
    expect(shouldProjectMembershipEvent("organization_membership.deleted")).toBe(false);
  });
});
