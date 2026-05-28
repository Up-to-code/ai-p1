import { describe, expect, it } from "vitest";
import { adminOrganizationMemberIds, adminOrganizationNotifications } from "./organizationDashboard";

describe("Admin organization dashboard projection", () => {
  it("collects unique member ids from activity, access, partner, and invite records", () => {
    expect(adminOrganizationMemberIds({
      projects: [{ createdByUserId: "user_1" }],
      properties: [{ createdByUserId: "user_2" }],
      clients: [{ createdByUserId: "user_1" }],
      tasks: [{ createdByUserId: undefined }],
      calendar: [{ createdByUserId: "user_3" }],
      media: [],
      apiKeys: [{ createdByUserId: "user_4" }],
      mcpConnections: [{ createdByUserId: "user_5" }],
      partnerConnections: [{ _id: "partner_1", partnersClientId: "client", status: "active", updatedAt: 1, authorizedByUserId: "user_6" }],
      invites: [{ createdByUserId: "user_7", usedByUserId: "user_8" }],
    })).toEqual(["user_1", "user_2", "user_3", "user_4", "user_5", "user_6", "user_7", "user_8"]);
  });

  it("caps member ids at twelve in discovery order", () => {
    const projects = Array.from({ length: 14 }, (_, index) => ({ createdByUserId: `user_${index}` }));

    expect(adminOrganizationMemberIds({
      projects,
      properties: [],
      clients: [],
      tasks: [],
      calendar: [],
      media: [],
      apiKeys: [],
      mcpConnections: [],
      partnerConnections: [],
      invites: [],
    })).toHaveLength(12);
  });

  it("projects actionable organization notifications in newest-first order", () => {
    expect(adminOrganizationNotifications({
      projects: [
        { _id: "project_1", name: "North", status: "pending", updatedAt: 10 },
        { _id: "project_2", name: "South", status: "approved", updatedAt: 100 },
      ],
      partnerConnections: [
        { _id: "connection_1", partnersClientId: "pc_1", status: "paused", updatedAt: 30 },
        { _id: "connection_2", partnersClientId: "pc_2", status: "active", updatedAt: 40 },
      ],
      apiKeys: [
        { _id: "key_1", name: "Legacy", status: "revoked", updatedAt: 20 },
      ],
    }).map((notification) => notification.id)).toEqual([
      "connection_1:partner-connection",
      "key_1:api-key",
      "project_1:pending-project",
    ]);
  });
});
