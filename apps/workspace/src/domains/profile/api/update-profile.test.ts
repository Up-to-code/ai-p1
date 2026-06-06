import { beforeEach, describe, expect, it, vi } from "vitest";

describe("profile update request", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("patches the current user's persisted profile settings", async () => {
    const { updateProfileRequest } = await import("./update-profile");
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      profile: {
        userId: "user_1",
        name: "Ahmed Mansour",
        phone: "+201000000000",
        role: "Workspace Owner",
        language: "en",
        timezone: "Africa/Cairo",
        notifications: {
          product: true,
          approvals: true,
          billing: false,
          security: true,
        },
        updatedAt: 1,
      },
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetcher);

    await updateProfileRequest({
      name: "Ahmed Mansour",
      phone: "+201000000000",
      role: "Workspace Owner",
      language: "en",
      timezone: "Africa/Cairo",
      notifications: {
        product: true,
        approvals: true,
        billing: false,
        security: true,
      },
    }, "Save failed.");

    expect(fetcher).toHaveBeenCalledWith("/api/v1/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Ahmed Mansour",
        phone: "+201000000000",
        role: "Workspace Owner",
        language: "en",
        timezone: "Africa/Cairo",
        notifications: {
          product: true,
          approvals: true,
          billing: false,
          security: true,
        },
      }),
    });
  });

  it("uses the server error when profile persistence fails", async () => {
    const { updateProfileRequest } = await import("./update-profile");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: "Invalid profile payload." }), { status: 400 })));

    await expect(updateProfileRequest({
      name: "A",
      role: "Owner",
      language: "en",
      timezone: "Africa/Cairo",
      notifications: {
        product: true,
        approvals: true,
        billing: false,
        security: true,
      },
    }, "Save failed.")).rejects.toThrow("Invalid profile payload.");
  });
});
