import { describe, expect, it } from "vitest";
import { propertySchema } from "./validation/property.schema";

const validPropertyForm = {
  title: "Test unit",
  projectId: "",
  project: "",
  city: "Riyadh",
  type: "Apartment",
  status: "draft",
  visibility: "private",
  purpose: "sale",
  price: "100",
  area: "90",
  bedrooms: "1",
  bathrooms: "1",
  description: "test",
};

describe("property form schema", () => {
  it("accepts short draft descriptions before starting the save operation", () => {
    expect(propertySchema.safeParse(validPropertyForm).success).toBe(true);
  });

  it("still rejects blank descriptions", () => {
    const result = propertySchema.safeParse({ ...validPropertyForm, description: "   " });

    expect(result.success).toBe(false);
  });
});
