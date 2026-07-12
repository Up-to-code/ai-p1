import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  emailAuthErrorMessage,
  sendSignUpEmailVerificationCode,
  signInWithEmailPassword,
  signUpWithEmailPassword,
} from "../auth/emailPasswordAuth";

describe("emailPasswordAuth", () => {
  it("returns missing login details before calling the auth server", async () => {
    let called = false;
    const result = await signInWithEmailPassword({
      emailAddress: "",
      password: "",
      signIn: {
        password: async () => {
          called = true;
          return undefined;
        },
      },
    });

    assert.deepEqual(result, { status: "missing_details", kind: "login" });
    assert.equal(called, false);
  });

  it("finalizes email password sign-in", async () => {
    let email = "";
    let finalized = false;
    const result = await signInWithEmailPassword({
      emailAddress: "  user@example.com  ",
      password: "secret",
      signIn: {
        password: async (input) => {
          email = input.emailAddress;
          return undefined;
        },
        finalize: async () => {
          finalized = true;
        },
      },
    });

    assert.equal(email, "user@example.com");
    assert.equal(finalized, true);
    assert.deepEqual(result, { status: "authenticated" });
  });

  it("starts signup email verification", async () => {
    let sentCode = false;
    const result = await signUpWithEmailPassword({
      emailAddress: "new@example.com",
      fullName: "Ada Lovelace",
      needsVerification: false,
      password: "secret",
      verificationCode: "",
      signUp: {
        password: async (input) => {
          assert.equal(input.firstName, "Ada");
          assert.equal(input.lastName, "Lovelace");
          return undefined;
        },
        verifications: {
          sendEmailCode: async () => {
            sentCode = true;
          },
        },
      },
    });

    assert.equal(sentCode, true);
    assert.deepEqual(result, { status: "needs_verification" });
  });

  it("returns missing signup details before calling the auth server without a full name", async () => {
    let called = false;
    const result = await signUpWithEmailPassword({
      emailAddress: "new@example.com",
      fullName: "",
      needsVerification: false,
      password: "secret",
      verificationCode: "",
      signUp: {
        password: async () => {
          called = true;
          return undefined;
        },
        verifications: {
          sendEmailCode: async () => undefined,
        },
      },
    });

    assert.deepEqual(result, { status: "missing_details", kind: "signup" });
    assert.equal(called, false);
  });

  it("finalizes signup after email verification", async () => {
    let code = "";
    let finalized = false;
    const result = await signUpWithEmailPassword({
      emailAddress: "new@example.com",
      fullName: "Ada Lovelace",
      needsVerification: true,
      password: "secret",
      verificationCode: "123456",
      signUp: {
        finalize: async () => {
          finalized = true;
        },
        verifications: {
          verifyEmailCode: async (input) => {
            code = input.code;
            return undefined;
          },
        },
      },
    });

    assert.equal(code, "123456");
    assert.equal(finalized, true);
    assert.deepEqual(result, { status: "authenticated" });
  });

  it("returns missing signup details before verifying an empty email code", async () => {
    let called = false;
    const result = await signUpWithEmailPassword({
      emailAddress: "new@example.com",
      fullName: "Ada Lovelace",
      needsVerification: true,
      password: "secret",
      verificationCode: "",
      signUp: {
        verifications: {
          verifyEmailCode: async () => {
            called = true;
            return undefined;
          },
        },
      },
    });

    assert.deepEqual(result, { status: "missing_details", kind: "signup" });
    assert.equal(called, false);
  });

  it("projects structured auth error messages", () => {
    const message = emailAuthErrorMessage(
      { errors: [{ longMessage: "Invalid password." }] },
      "Fallback",
    );

    assert.equal(message, "Invalid password.");
  });

  it("resends signup email verification codes", async () => {
    let sentCode = false;
    await sendSignUpEmailVerificationCode({
      signUp: {
        verifications: {
          sendEmailCode: async () => {
            sentCode = true;
          },
        },
      },
    });

    assert.equal(sentCode, true);
  });
});
