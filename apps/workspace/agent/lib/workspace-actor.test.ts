import { describe, expect, it } from "vitest";
import {
  getWorkspaceActor,
  requireWorkspaceActor,
  WorkspaceActorError,
} from "./workspace-actor";

function context(input?: {
  principalId?: string;
  organizationId?: unknown;
  userId?: unknown;
  role?: unknown;
  sessionToken?: unknown;
  convexToken?: unknown;
}) {
  return {
    session: {
      auth: {
        current: input
          ? {
              principalId: input.principalId ?? "user_1",
              attributes: input,
            }
          : null,
      },
    },
  };
}

describe("Eve Workspace Actor", () => {
  it("normalizes the authenticated actor once", () => {
    expect(
      requireWorkspaceActor(
        context({
          organizationId: " org_1 ",
          userId: "user_1",
          role: "member",
          sessionToken: "session",
          convexToken: "convex",
        }) as never,
      ),
    ).toEqual({
      organizationId: "org_1",
      userId: "user_1",
      role: "member",
      sessionToken: "session",
      convexToken: "convex",
    });
  });

  it("fails closed for missing or incomplete authentication", () => {
    expect(getWorkspaceActor(context() as never)).toBeNull();
    expect(
      getWorkspaceActor(
        context({ organizationId: "org_1", userId: "user_1" }) as never,
      ),
    ).toBeNull();
    expect(() => requireWorkspaceActor(context() as never)).toThrow(
      WorkspaceActorError,
    );
  });

  it("rejects a principal/user mismatch", () => {
    expect(() =>
      requireWorkspaceActor(
        context({
          principalId: "user_other",
          organizationId: "org_1",
          userId: "user_1",
          role: "member",
        }) as never,
      ),
    ).toThrow(/principal does not match/);
  });
});
