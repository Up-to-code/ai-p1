import { describe, expect, it } from "vitest";
import { projectPrincipalKeys } from "./project";
import { taskPrincipalKeys } from "./task";

describe("search projection coarse principals", () => {
  it("does not expose private Projects through Organization or Space keys", () => {
    expect(projectPrincipalKeys({ _id: "project_1", organizationId: "org_1", ownerUserId: "owner", createdByUserId: "creator", visibility: "private" } as never, ["space_1"])).toEqual(["project:project_1:member", "user:owner"]);
  });
  it("uses semantic membership keys so membership changes need no reindex", () => {
    expect(projectPrincipalKeys({ _id: "project_1", organizationId: "org_1", ownerUserId: "owner", createdByUserId: "creator", visibility: "space_members" } as never, ["space_1"])).toContain("space:space_1:member");
    expect(taskPrincipalKeys({ organizationId: "org_1", createdByUserId: "creator", assigneeUserId: "assigned", assigneeUserIds: ["assigned", "other"], projectId: "project_1", visibility: "team" })).toEqual(["user:creator", "user:assigned", "user:other", "project:project_1:member"]);
  });
  it("adds the Organization key only for workspace-visible tasks", () => {
    expect(taskPrincipalKeys({ organizationId: "org_1", createdByUserId: "creator", visibility: "workspace" })).toContain("org:org_1:member");
    expect(taskPrincipalKeys({ organizationId: "org_1", createdByUserId: "creator", visibility: "private" })).not.toContain("org:org_1:member");
  });
});
