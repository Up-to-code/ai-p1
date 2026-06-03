import { describe, expect, it, vi, beforeEach } from "vitest";

const workos = {
  userManagement: {
    authenticateWithPassword: vi.fn(),
    authenticateWithEmailVerification: vi.fn(),
    createUser: vi.fn(),
    createPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
  },
};

vi.mock("@/packages/config", () => ({
  workosRuntimeConfig: {
    enabled: true,
    apiKey: "sk_test",
    clientId: "client_test",
    cookiePassword: "x".repeat(32),
  },
}));

vi.mock("@/server/auth/workos", () => ({
  assertWorkOSConfigured: vi.fn(),
  getWorkOSClient: () => workos,
}));

import {
  confirmMobileEmailVerification,
  mobileAuthErrorMessage,
  mobileEmailVerificationChallenge,
  confirmMobilePasswordReset,
  registerWithMobilePassword,
  requestMobilePasswordReset,
  signInWithMobilePassword,
} from "./mobile-password";

describe("mobile WorkOS password auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    workos.userManagement.authenticateWithPassword.mockResolvedValue({
      sealedSession: "sealed_session",
      organizationId: "org_workos",
      user: {
        id: "user_1",
        email: "agent@example.com",
        firstName: "Noura",
        lastName: "Ahmed",
      },
    });
    workos.userManagement.authenticateWithEmailVerification.mockResolvedValue({
      sealedSession: "sealed_session_verified",
      organizationId: "org_workos",
      user: {
        id: "user_1",
        email: "agent@example.com",
        firstName: "Noura",
        lastName: "Ahmed",
      },
    });
  });

  it("signs in with password and returns a sealed mobile session", async () => {
    await expect(signInWithMobilePassword({
      email: " Agent@Example.com ",
      password: "password-1",
      ipAddress: "127.0.0.1",
      userAgent: "vitest",
    })).resolves.toEqual({
      sealedSession: "sealed_session",
      organizationId: "org_workos",
      user: {
        id: "user_1",
        email: "agent@example.com",
        name: "Noura Ahmed",
      },
    });

    expect(workos.userManagement.authenticateWithPassword).toHaveBeenCalledWith(expect.objectContaining({
      clientId: "client_test",
      email: "agent@example.com",
      password: "password-1",
      ipAddress: "127.0.0.1",
      userAgent: "vitest",
      session: {
        sealSession: true,
        cookiePassword: "x".repeat(32),
      },
    }));
  });

  it("registers a WorkOS user before authenticating", async () => {
    await registerWithMobilePassword({
      name: "Noura Ahmed",
      email: "noura@example.com",
      password: "password-1",
    });

    expect(workos.userManagement.createUser).toHaveBeenCalledWith({
      email: "noura@example.com",
      password: "password-1",
      firstName: "Noura",
      lastName: "Ahmed",
    });
    expect(workos.userManagement.authenticateWithPassword).toHaveBeenCalled();
  });

  it("requests a password reset through WorkOS", async () => {
    await requestMobilePasswordReset({ email: " Agent@Example.com " });

    expect(workos.userManagement.createPasswordReset).toHaveBeenCalledWith({
      email: "agent@example.com",
    });
  });

  it("confirms a password reset with a reset token and new password", async () => {
    await confirmMobilePasswordReset({
      token: " reset-token ",
      newPassword: " new-password-1 ",
    });

    expect(workos.userManagement.resetPassword).toHaveBeenCalledWith({
      token: "reset-token",
      newPassword: "new-password-1",
    });
  });

  it("extracts WorkOS pending email verification challenges", () => {
    expect(mobileEmailVerificationChallenge({
      rawData: {
        code: "email_verification_required",
        email_verification_id: "verification_1",
        pending_authentication_token: "pending-token",
        user: {
          email: "Agent@Example.com",
        },
      },
    })).toEqual({
      code: "email_verification_required",
      email: "agent@example.com",
      emailVerificationId: "verification_1",
      pendingAuthenticationToken: "pending-token",
    });
  });

  it("confirms email verification with the pending authentication token", async () => {
    await expect(confirmMobileEmailVerification({
      code: " 123456 ",
      pendingAuthenticationToken: " pending-token ",
      ipAddress: "127.0.0.1",
      userAgent: "vitest",
    })).resolves.toEqual({
      sealedSession: "sealed_session_verified",
      organizationId: "org_workos",
      user: {
        id: "user_1",
        email: "agent@example.com",
        name: "Noura Ahmed",
      },
    });

    expect(workos.userManagement.authenticateWithEmailVerification).toHaveBeenCalledWith(expect.objectContaining({
      clientId: "client_test",
      code: "123456",
      pendingAuthenticationToken: "pending-token",
      ipAddress: "127.0.0.1",
      userAgent: "vitest",
      session: {
        sealSession: true,
        cookiePassword: "x".repeat(32),
      },
    }));
  });

  it("normalizes provider errors into Qentrah copy", () => {
    expect(mobileAuthErrorMessage(new Error("WorkOS API key and client id are required.")))
      .toBe("Qentrah sign-in is not ready in this build.");
    expect(mobileAuthErrorMessage(new Error("AuthKit invalid password.")))
      .toBe("The email or password does not match a Qentrah account.");
    expect(mobileAuthErrorMessage(new Error("WorkOS rate limit exceeded.")))
      .toBe("Too many attempts. Wait a minute, then try again.");
  });
});
