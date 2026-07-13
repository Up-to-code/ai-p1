import { describe, expect, it } from "vitest";
import {
  clientInputSchema,
  clientPrioritySchema,
  dealInputSchema,
  projectInputSchema,
  spaceInputSchema,
  taskInputSchema,
  taskPrioritySchema,
} from "./index";

describe("@qentrah/domain-contracts", () => {
  it("keeps Client and Task priorities intentionally separate", () => {
    expect(clientPrioritySchema.options).toEqual(["normal", "high", "urgent"]);
    expect(taskPrioritySchema.options).toEqual([
      "low",
      "normal",
      "high",
      "urgent",
    ]);
    expect(clientPrioritySchema.safeParse("low").success).toBe(false);
    expect(taskPrioritySchema.safeParse("low").success).toBe(true);
  });

  it("accepts the canonical Client input shape", () => {
    const client = clientInputSchema.parse({
      name: "Acme",
      type: "organization",
      status: "active",
      priority: "high",
      contact: "operations@acme.test",
      visibility: "private",
    });

    expect(client.name).toBe("Acme");
    expect(client.priority).toBe("high");
  });

  it("accepts configurable Task statuses and low priority", () => {
    const task = taskInputSchema.parse({
      title: "Prepare kickoff",
      status: "client-review",
      priority: "low",
      visibility: "team",
    });

    expect(task.status).toBe("client-review");
    expect(task.priority).toBe("low");
  });

  it("rejects incomplete core domain inputs", () => {
    expect(clientInputSchema.safeParse({ name: "" }).success).toBe(false);
    expect(taskInputSchema.safeParse({ title: "", status: "", priority: "normal" }).success).toBe(false);
    expect(dealInputSchema.safeParse({ title: "Deal" }).success).toBe(false);
    expect(projectInputSchema.safeParse({ name: "Project" }).success).toBe(false);
    expect(spaceInputSchema.safeParse({ name: "Space" }).success).toBe(false);
  });
});
