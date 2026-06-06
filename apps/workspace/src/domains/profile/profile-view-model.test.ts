import { describe, expect, it } from "vitest";
import {
  profileFormValues,
  profileInitials,
  profileNotificationEntries,
  profileRolePresentation,
  profileTabs,
} from "./profile-view-model";
import type { ProfileSettings } from "./store/profile.types";

const profile: ProfileSettings = {
  name: "Stored Name",
  email: "stored@example.com",
  phone: "+966500000000",
  role: "Organization Admin",
  language: "en",
  timezone: "Africa/Cairo",
  notifications: {
    product: true,
    approvals: false,
    billing: true,
    security: false,
  },
};

describe("profile view model", () => {
  it("keeps profile tab vocabulary stable", () => {
    expect(profileTabs).toEqual([
      { id: "profile", labelKey: "tabs.profile", icon: "profile" },
      { id: "account", labelKey: "tabs.account", icon: "account" },
      { id: "notifications", labelKey: "tabs.notifications", icon: "notifications" },
      { id: "security", labelKey: "tabs.security", icon: "security" },
    ]);
  });

  it("builds form values from account identity and persisted profile settings", () => {
    expect(profileFormValues({
      name: "Account Name",
      email: "account@example.com",
      profile: {
        phone: "+201111111111",
        role: "Project Manager",
        language: "ar",
        timezone: "Asia/Riyadh",
        notifications: profile.notifications,
      },
    }, profile)).toEqual({
      name: "Account Name",
      phone: "+201111111111",
      role: "Project Manager",
      language: "ar",
      timezone: "Asia/Riyadh",
    });
  });

  it("derives initials and role presentation with viewer fallback", () => {
    expect(profileInitials("Ahmed Mansour Team")).toBe("AM");
    expect(profileRolePresentation("Organization Admin")).toMatchObject({
      roleKey: "organizationAdmin",
      permissionKeys: ["manageMembers", "editOrganization", "viewBilling", "apiAccess", "allProjects"],
    });
    expect(profileRolePresentation("Workspace Owner")).toMatchObject({
      roleKey: "workspaceOwner",
      permissionKeys: ["manageMembers", "editOrganization", "viewBilling", "apiAccess", "allProjects"],
    });
  });

  it("normalizes notification entries with typed keys", () => {
    expect(profileNotificationEntries(profile)).toEqual([
      ["product", true],
      ["approvals", false],
      ["billing", true],
      ["security", false],
    ]);
  });
});
