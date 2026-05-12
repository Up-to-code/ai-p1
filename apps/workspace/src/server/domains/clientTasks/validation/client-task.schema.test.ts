import { describe, expect, it } from "vitest";
import { clientTaskPayloadSchema } from "./client-task.schema";

describe("client task validation", () => {
  it("defaults new task status and priority", () => {
    const parsed = clientTaskPayloadSchema.parse({
      clientId: "client_123",
      title: "Prepare viewing checklist",
    });

    expect(parsed.status).toBe("open");
    expect(parsed.priority).toBe("normal");
  });

  it("normalizes empty optional links", () => {
    const parsed = clientTaskPayloadSchema.parse({
      clientId: "client_123",
      title: "Follow up",
      propertyId: "",
      projectId: "",
      calendarEventId: "",
      notes: "",
    });

    expect(parsed.propertyId).toBeUndefined();
    expect(parsed.projectId).toBeUndefined();
    expect(parsed.calendarEventId).toBeUndefined();
    expect(parsed.notes).toBeUndefined();
  });
});
