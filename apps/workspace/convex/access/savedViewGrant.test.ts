import { beforeEach, describe, expect, it, vi } from "vitest";

const { role, teamIds, actor } = vi.hoisted(() => ({
  role: vi.fn(async (): Promise<"owner" | "admin" | "member" | null> => null),
  teamIds: vi.fn(async (): Promise<string[]> => ["team_1"]),
  actor: vi.fn(async () => ({ userId: "user_1" })),
}));
vi.mock("../permissions", () => ({ getOrganizationRole: role }));
vi.mock("./team", () => ({ resolveActorTeamIds: teamIds }));
vi.mock("./actor", () => ({ requireServerActor: actor }));

import { resolveSavedViewGrantAccess } from "./savedViewGrant";

function view(input: { ownerUserId?: string; sharingMode?: "personal" | "shared" | "protected" } = {}) {
  return { _id: "view_1", organizationId: "org_1", createdByUserId: "owner", recordState: "active", ...input };
}

function context(grants: Array<{ principalType: "user" | "team"; principalId: string; access: "read" | "configure" }> = []) {
  return { auth: {}, runQuery: vi.fn(), db: { query: vi.fn(() => ({ withIndex: vi.fn(() => ({ collect: vi.fn(async () => grants.map((grant) => ({ ...grant, recordState: "active" }))) })) })) } };
}

describe("Saved View live grant access", () => {
  beforeEach(() => { vi.clearAllMocks(); role.mockResolvedValue(null); teamIds.mockResolvedValue(["team_1"]); });
  it("keeps personal views private from administrators", async () => {
    role.mockResolvedValue("admin");
    await expect(resolveSavedViewGrantAccess(context() as never, view({ sharingMode: "personal" }) as never)).resolves.toMatchObject({ canRead: false });
  });
  it("resolves Team grants without copying users", async () => {
    await expect(resolveSavedViewGrantAccess(context([{ principalType: "team", principalId: "team_1", access: "read" }]) as never, view({ sharingMode: "shared" }) as never)).resolves.toEqual({ canRead: true, canConfigure: false, canShare: false, canDelete: false, canSetDefault: false });
    teamIds.mockResolvedValue([]);
    await expect(resolveSavedViewGrantAccess(context([{ principalType: "team", principalId: "team_1", access: "read" }]) as never, view({ sharingMode: "shared" }) as never)).resolves.toMatchObject({ canRead: false });
  });
  it("allows only explicit configure grants to change protected configuration", async () => {
    await expect(resolveSavedViewGrantAccess(context([{ principalType: "user", principalId: "user_1", access: "configure" }]) as never, view({ sharingMode: "protected" }) as never)).resolves.toMatchObject({ canRead: true, canConfigure: true, canShare: false });
  });
});
