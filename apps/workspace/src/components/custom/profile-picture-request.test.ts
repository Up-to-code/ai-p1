import { beforeEach, describe, expect, it, vi } from "vitest";

describe("profile picture request module", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("saves avatar metadata through the Workspace API", async () => {
    const { saveProfileAvatar } = await import("./profile-picture-request");
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetcher);

    await saveProfileAvatar({ avatarUrl: "https://cdn.example/avatar.webp", avatarKey: "avatar_key" }, "Save failed.");

    expect(fetcher).toHaveBeenCalledWith("/api/v1/profile/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: "https://cdn.example/avatar.webp", avatarKey: "avatar_key" }),
    });
  });

  it("removes avatar metadata through the Workspace API", async () => {
    const { removeProfileAvatar } = await import("./profile-picture-request");
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetcher);

    await removeProfileAvatar("Save failed.");

    expect(fetcher).toHaveBeenCalledWith("/api/v1/profile/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
  });

  it("preserves server error fallback behavior", async () => {
    const { removeProfileAvatar } = await import("./profile-picture-request");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: "Server failed." }), { status: 400 })));

    await expect(removeProfileAvatar("Save failed.")).rejects.toThrow("Server failed.");
  });
});
