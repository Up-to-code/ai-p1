import { describe, expect, it, vi } from "vitest";
import { assertTeamInOrganization, resolveActorTeamIds } from "./team";

function context() {
  return {
    runQuery: vi.fn(async (_ref, args: { model: string }) => {
      if (args.model === "team") return [{ _id: "team_1", organizationId: "org_1" }, { _id: "team_other", organizationId: "org_2" }];
      return [{ teamId: "team_1", userId: "user_1" }, { teamId: "team_other", userId: "user_1" }];
    }),
  };
}

describe("live Team access principal", () => {
  it("intersects live memberships with the active Organization", async () => {
    await expect(resolveActorTeamIds(context() as never, "org_1", "user_1")).resolves.toEqual(["team_1"]);
  });
  it("rejects cross-Organization Team grants", async () => {
    await expect(assertTeamInOrganization(context() as never, "org_1", "team_other")).rejects.toMatchObject({ data: { code: "TEAM_SCOPE_INVALID" } });
  });
  it("follows Better Auth pagination without truncating live memberships", async () => {
    const runQuery = vi.fn(async (_ref, args: { model: string; paginationOpts: { cursor: string | null } }) => {
      if (args.model === "team") {
        return args.paginationOpts.cursor
          ? { page: [{ _id: "team_2", organizationId: "org_1" }], isDone: true, continueCursor: "done" }
          : { page: [{ _id: "team_1", organizationId: "org_1" }], isDone: false, continueCursor: "teams_2" };
      }
      return { page: [
        { teamId: "team_1", userId: "user_1" },
        { teamId: "team_2", userId: "user_1" },
      ], isDone: true, continueCursor: "done" };
    });
    await expect(resolveActorTeamIds({ runQuery } as never, "org_1", "user_1")).resolves.toEqual(["team_1", "team_2"]);
  });
});
