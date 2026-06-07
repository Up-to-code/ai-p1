import { describe, expect, it } from "vitest";
import { projectPayloadSchema } from "./validation/project.schema";

const validProjectPayload = {
  name: "Test project",
  status: "planned",
  health: "onTrack",
  visibility: "private",
  budget: 100,
  currency: "USD",
  description: "test",
};

describe("project payload schema", () => {
  it("accepts short draft descriptions so rough project inputs can be saved", () => {
    expect(projectPayloadSchema.safeParse(validProjectPayload).success).toBe(true);
  });

  it("normalizes blank optional descriptions", () => {
    const result = projectPayloadSchema.safeParse({ ...validProjectPayload, description: "   " });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeUndefined();
    }
  });
});
