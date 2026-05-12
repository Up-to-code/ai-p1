import { describe, expect, it } from "vitest";
import { signInWithEmailPassword, signOutWithAuthClient } from "./forms";
import { createAdminAuthPlugins, createExternalAppAuthPlugins, createWebAuthPlugins } from "./presets";

describe("@anan/auth-client plugin presets", () => {
  it("keeps web on Convex, organization, and email OTP plugins", () => {
    expect(createWebAuthPlugins()).toHaveLength(3);
  });

  it("keeps admin and external apps on the Convex-only browser preset", () => {
    expect(createAdminAuthPlugins()).toHaveLength(1);
    expect(createExternalAppAuthPlugins()).toHaveLength(1);
  });

  it("wraps auth form actions without exposing Better Auth internals", async () => {
    const calls: unknown[] = [];
    const authClient = {
      signIn: {
        email: async (input: unknown) => {
          calls.push(input);
          return { error: null };
        },
      },
      signOut: async () => "signed-out",
    };

    await expect(signInWithEmailPassword(authClient, {
      email: " user@anan.test ",
      password: "secret",
      callbackURL: "https://app.test",
    })).resolves.toEqual({ error: null });
    expect(calls[0]).toMatchObject({ email: "user@anan.test" });
    await expect(signOutWithAuthClient(authClient)).resolves.toBe("signed-out");
  });
});
