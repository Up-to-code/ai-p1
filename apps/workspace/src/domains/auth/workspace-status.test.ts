import { describe, expect, it } from "vitest";
import { deriveWorkspaceStatus, getWorkspaceAuthRedirect } from "./workspace-status";

const readyInput = {
  isSessionPending: false,
  isOrganizationPending: false,
  organizationId: "org_123",
  isConvexAuthPending: false,
  isConvexAuthenticated: true,
};

describe("deriveWorkspaceStatus", () => {
  it("waits for the app session and active organization before checking Convex auth", () => {
    expect(deriveWorkspaceStatus({ ...readyInput, isSessionPending: true })).toBe("loadingSession");
    expect(deriveWorkspaceStatus({ ...readyInput, isOrganizationPending: true })).toBe("loadingSession");
  });

  it("requires an active organization", () => {
    expect(deriveWorkspaceStatus({ ...readyInput, organizationId: null })).toBe("noOrganization");
  });

  it("keeps the workspace out of ready while Convex auth is loading or disconnected", () => {
    expect(deriveWorkspaceStatus({ ...readyInput, isConvexAuthPending: true })).toBe("convexAuthLoading");
    expect(deriveWorkspaceStatus({ ...readyInput, isConvexAuthPending: true, isConvexAuthStalled: true })).toBe("convexAuthFailed");
    expect(deriveWorkspaceStatus({ ...readyInput, isConvexAuthenticated: false })).toBe("convexAuthFailed");
  });

  it("returns ready only when app auth, organization, and Convex auth are all resolved", () => {
    expect(deriveWorkspaceStatus(readyInput)).toBe("ready");
  });
});

describe("getWorkspaceAuthRedirect", () => {
  it("sends signed-out users to localized sign-in", () => {
    expect(getWorkspaceAuthRedirect({ isSignedIn: false, workspaceStatus: "ready", locale: "ar" })).toBe(
      "/ar/sign-in?callbackURL=%2Far%2Fchoose-org",
    );
  });

  it("does not use app-shell routes as auth callbacks", () => {
    expect(getWorkspaceAuthRedirect({ isSignedIn: false, workspaceStatus: "ready", locale: "ar" })).not.toContain("dashboard");
  });

  it("does not redirect during the organization auth handoff", () => {
    expect(getWorkspaceAuthRedirect({ isSignedIn: false, workspaceStatus: "noOrganization", locale: "ar", isAuthHandoffPending: true })).toBeNull();
  });

  it("sends signed-in users without an active organization to choose-org", () => {
    expect(getWorkspaceAuthRedirect({ isSignedIn: true, workspaceStatus: "noOrganization", locale: "en" })).toBe("/en/choose-org");
  });

  it("does not redirect while workspace auth is still loading or ready", () => {
    expect(getWorkspaceAuthRedirect({ isSignedIn: true, workspaceStatus: "loadingSession", locale: "ar" })).toBeNull();
    expect(getWorkspaceAuthRedirect({ isSignedIn: true, workspaceStatus: "convexAuthLoading", locale: "ar" })).toBeNull();
    expect(getWorkspaceAuthRedirect({ isSignedIn: true, workspaceStatus: "ready", locale: "ar" })).toBeNull();
  });

  it("keeps Convex auth failures on the app screen so the user sees recovery actions", () => {
    expect(getWorkspaceAuthRedirect({ isSignedIn: true, workspaceStatus: "convexAuthFailed", locale: "ar" })).toBeNull();
  });
});
