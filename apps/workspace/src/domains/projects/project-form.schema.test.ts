import { describe, expect, it } from "vitest";
import { projectSchema } from "./validation/project.schema";

const validProjectForm = {
  name: "Test project",
  developer: "Operations team",
  city: "Remote",
  area: "Support",
  type: "Commercial",
  assetTypes: ["Office"],
  status: "draft",
  visibility: "private",
  assetCount: "0",
  averagePrice: "100",
  projectPrices: [],
  priceRange: "",
  description: "test",
};

describe("project form schema", () => {
  it("accepts short draft descriptions before starting the save operation", () => {
    expect(projectSchema.safeParse(validProjectForm).success).toBe(true);
  });

  it("still rejects blank descriptions", () => {
    const result = projectSchema.safeParse({ ...validProjectForm, description: "   " });

    expect(result.success).toBe(false);
  });
});
