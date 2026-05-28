import { beforeEach, describe, expect, it, vi } from "vitest";

const updateUser = vi.fn();

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    updateUser,
  },
}));

describe("profile picture request module", () => {
  beforeEach(() => {
    updateUser.mockReset();
    vi.unstubAllGlobals();
  });

  it("saves avatar metadata then updates Better Auth user image", async () => {
    const { saveProfileAvatar } = await import("./profile-picture-request");
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetcher);
    updateUser.mockResolvedValue({ error: null });

    await saveProfileAvatar({ avatarUrl: "https://cdn.example/avatar.webp", avatarKey: "avatar_key" }, "Save failed.");

    expect(fetcher).toHaveBeenCalledWith("/api/v1/profile/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: "https://cdn.example/avatar.webp", avatarKey: "avatar_key" }),
    });
    expect(updateUser).toHaveBeenCalledWith({ image: "https://cdn.example/avatar.webp" });
  });

  it("removes avatar metadata then clears Better Auth user image", async () => {
    const { removeProfileAvatar } = await import("./profile-picture-request");
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetcher);
    updateUser.mockResolvedValue({ error: null });

    await removeProfileAvatar("Save failed.");

    expect(fetcher).toHaveBeenCalledWith("/api/v1/profile/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(updateUser).toHaveBeenCalledWith({ image: null });
  });

  it("preserves server and Better Auth error fallback behavior", async () => {
    const { removeProfileAvatar, saveProfileAvatar } = await import("./profile-picture-request");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: "Server failed." }), { status: 400 })));

    await expect(removeProfileAvatar("Save failed.")).rejects.toThrow("Server failed.");

    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })));
    updateUser.mockResolvedValue({ error: { message: "Auth failed." } });

    await expect(saveProfileAvatar({ avatarUrl: "https://cdn.example/avatar.webp" }, "Save failed.")).rejects.toThrow("Auth failed.");
  });
});
