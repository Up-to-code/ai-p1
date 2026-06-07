import { describe, expect, it } from "vitest";
import { clientTaskPayloadSchema } from "./client-task.schema";

describe("client task validation", () => {
  it("defaults new task status and priority", () => {
    const parsed = clientTaskPayloadSchema.parse({
      title: "Prepare onboarding checklist",
    });

    expect(parsed.status).toBe("todo");
    expect(parsed.priority).toBe("normal");
  });

  it("normalizes empty optional workspace fields", () => {
    const parsed = clientTaskPayloadSchema.parse({
      title: "Follow up",
      assigneeUserId: "",
      dueDate: "",
      description: "",
    });

    expect(parsed.assigneeUserId).toBeUndefined();
    expect(parsed.dueDate).toBeUndefined();
    expect(parsed.description).toBeUndefined();
  });

  it("accepts finite pipeline order for board moves", () => {
    const parsed = clientTaskPayloadSchema.parse({
      title: "Move board task",
      pipelineOrder: 12.5,
    });

    expect(parsed.pipelineOrder).toBe(12.5);
  });
});
