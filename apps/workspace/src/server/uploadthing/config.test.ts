import { describe, expect, it } from "vitest";

import { hydrateUploadThingEnvFromToken, normalizeUploadThingToken, parseUploadThingToken } from "./config";

const tokenPayload = {
  apiKey: "sk_test_1234567890",
  appId: "app_123",
  regions: ["sea1"],
};

function encodeToken(payload: unknown = tokenPayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}

describe("UploadThing config", () => {
  it("normalizes copied .env quotes around the token", () => {
    const token = encodeToken();

    expect(normalizeUploadThingToken(`'${token}'`)).toBe(token);
    expect(normalizeUploadThingToken(`"${token}"`)).toBe(token);
  });

  it("parses a valid UploadThing token payload", () => {
    expect(parseUploadThingToken(encodeToken())).toEqual(tokenPayload);
  });

  it("rejects tokens missing UploadThing regions", () => {
    expect(() => parseUploadThingToken(encodeToken({ apiKey: "sk_test_123", appId: "app_123" }))).toThrow(
      /UPLOADTHING_TOKEN/u,
    );
  });

  it("hydrates legacy env aliases and writes the sanitized token back", () => {
    const token = encodeToken();
    const env: Record<string, string | undefined> = {
      UPLOADTHING_TOKEN: `'${token}'`,
    };

    hydrateUploadThingEnvFromToken(env);

    expect(env.UPLOADTHING_TOKEN).toBe(token);
    expect(env.UPLOADTHING_SECRET).toBe(tokenPayload.apiKey);
    expect(env.UPLOADTHING_APP_ID).toBe(tokenPayload.appId);
  });

  it("preserves explicit legacy aliases when present", () => {
    const token = encodeToken();
    const env: Record<string, string | undefined> = {
      UPLOADTHING_TOKEN: token,
      UPLOADTHING_SECRET: "sk_test_existing",
      UPLOADTHING_APP_ID: "existing_app",
    };

    hydrateUploadThingEnvFromToken(env);

    expect(env.UPLOADTHING_SECRET).toBe("sk_test_existing");
    expect(env.UPLOADTHING_APP_ID).toBe("existing_app");
  });
});
