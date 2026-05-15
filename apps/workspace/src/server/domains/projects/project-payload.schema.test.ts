import { describe, expect, it } from "vitest";
import { projectPayloadSchema } from "./validation/project.schema";

const validProjectPayload = {
  name: "Test project",
  developer: "Developer",
  city: "Riyadh",
  area: "Al Malqa",
  type: "Residential",
  unitTypes: ["Apartment"],
  status: "draft",
  visibility: "private",
  units: 0,
  averagePrice: "100",
  projectPrices: [],
  priceRange: "100",
  description: "test",
};

describe("project payload schema", () => {
  it("accepts short draft descriptions so rough project inputs can be saved", () => {
    expect(projectPayloadSchema.safeParse(validProjectPayload).success).toBe(true);
  });

  it("still rejects blank descriptions", () => {
    const result = projectPayloadSchema.safeParse({ ...validProjectPayload, description: "   " });

    expect(result.success).toBe(false);
  });
});
