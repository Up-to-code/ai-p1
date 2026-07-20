import { afterEach, describe, expect, it } from "vitest";
import {
  decryptAutomationCredentials,
  encryptAutomationCredentials,
} from "./credentialCrypto";

const originalSecret = process.env.AUTOMATION_CREDENTIALS_SECRET;

afterEach(() => {
  if (originalSecret === undefined) delete process.env.AUTOMATION_CREDENTIALS_SECRET;
  else process.env.AUTOMATION_CREDENTIALS_SECRET = originalSecret;
});

describe("automation credential encryption", () => {
  it("round-trips provider credentials without storing plaintext", () => {
    process.env.AUTOMATION_CREDENTIALS_SECRET = "test-secret";
    const secret = {
      provider: "whatsapp",
      credentials: { accessToken: "token", phoneNumberId: "phone-id" },
    };
    const encrypted = encryptAutomationCredentials(secret);

    expect(encrypted.encryptedCredentials).not.toContain("token");
    expect(
      decryptAutomationCredentials(
        encrypted.encryptedCredentials,
        encrypted.credentialIv,
      ),
    ).toEqual(secret);
  });
});
