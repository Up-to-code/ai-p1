import { describe, expect, it } from "vitest";
import { propertyPayloadSchema } from "./validation/property.schema";

const validPropertyPayload = {
  title: "Test unit",
  project: "Standalone unit",
  city: "Riyadh",
  type: "Apartment",
  status: "draft",
  visibility: "private",
  purpose: "sale",
  price: "100",
  area: "90",
  bedrooms: 1,
  bathrooms: 1,
  description: "test",
};

describe("property payload schema", () => {
  it("accepts short draft descriptions so rough unit inputs can be saved", () => {
    expect(propertyPayloadSchema.safeParse(validPropertyPayload).success).toBe(true);
  });

  it("still rejects blank descriptions", () => {
    const result = propertyPayloadSchema.safeParse({ ...validPropertyPayload, description: "   " });

    expect(result.success).toBe(false);
  });

  it("accepts a selected project id and project name from the frontend packet", () => {
    const result = propertyPayloadSchema.safeParse({
      ...validPropertyPayload,
      projectId: "jn7f9e7ts6ftm6k0h8y0b64ec176p8qn",
      project: "Selected project",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.projectId).toBe("jn7f9e7ts6ftm6k0h8y0b64ec176p8qn");
      expect(result.data.project).toBe("Selected project");
    }
  });
});
