import { describe, expect, it } from "vitest";
import { mapOrganizationMembersToShareUsers } from "./map-share-members";

describe("mapOrganizationMembersToShareUsers", () => {
  it("maps member roles and contact fields", () => {
    expect(
      mapOrganizationMembersToShareUsers([
        {
          id: "mem_1",
          organizationId: "org_1",
          userId: "user_1",
          role: "org:admin",
          createdAt: "2024-01-01",
          user: { id: "user_1", name: "Ada", email: "ada@example.com", image: "https://example.com/a.png" },
        },
        {
          id: "mem_2",
          organizationId: "org_1",
          userId: "user_2",
          role: "org:member",
          createdAt: "2024-01-01",
          user: { id: "user_2", name: "", email: "bob@example.com" },
        },
      ]),
    ).toEqual([
      {
        id: "mem_1",
        name: "Ada",
        email: "ada@example.com",
        avatar: "https://example.com/a.png",
        role: "editor",
      },
      {
        id: "mem_2",
        name: "bob@example.com",
        email: "bob@example.com",
        avatar: undefined,
        role: "viewer",
      },
    ]);
  });
});
