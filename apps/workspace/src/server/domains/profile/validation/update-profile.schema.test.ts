import { describe, expect, it } from "vitest";
import { updateProfileSchema } from "./update-profile.schema";

describe("update profile schema", () => {
  it("accepts persisted profile settings", () => {
    expect(updateProfileSchema.parse({
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
    })).toMatchObject({
      name: "Ahmed Mansour",
      language: "en",
    });
  });

  it("rejects invalid identity and preference values", () => {
    expect(updateProfileSchema.safeParse({
      name: "A",
      role: "",
      language: "fr",
      timezone: "",
      notifications: {
        product: true,
        approvals: true,
        billing: false,
        security: true,
      },
    }).success).toBe(false);
  });
});
