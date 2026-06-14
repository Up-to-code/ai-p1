import { describe, expect, it } from "vitest";
import { projectSchema } from "./validation/project.schema";

const validProjectForm = {
  name: "Test project",
  status: "planned",
  health: "onTrack",
  visibility: "private",
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
