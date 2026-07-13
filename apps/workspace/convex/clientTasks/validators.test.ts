import { describe, expect, it } from "vitest";
import {
  taskInputObjectSchema,
  taskPatchSchema,
  taskPrioritySchema,
} from "@qentrah/domain-contracts";
import {
  clientTaskInputValidator,
  clientTaskPatchValidator,
  taskPriorityValidator,
} from "./validators";

const sortedKeys = (value: Record<string, unknown>) => Object.keys(value).sort();

describe("Task executable contract parity", () => {
  it("keeps create and patch inventories aligned across Zod and Convex", () => {
    expect(sortedKeys(clientTaskInputValidator.fields))
      .toEqual(sortedKeys(taskInputObjectSchema.shape));
    expect(sortedKeys(clientTaskPatchValidator.fields))
      .toEqual(sortedKeys(taskInputObjectSchema.shape));
    expect(taskPriorityValidator.members.map((member) => member.value))
      .toEqual(taskPrioritySchema.options);
  });

  it("accepts configurable statuses and rejects empty or immutable patches", () => {
    expect(taskPatchSchema.safeParse({ status: "client-review" }).success).toBe(true);
    expect(taskPatchSchema.safeParse({ checklist: [{ id: "one", title: "Review", done: false }] }).success).toBe(true);
    expect(taskPatchSchema.safeParse({}).success).toBe(false);
    expect(taskPatchSchema.safeParse({ organizationId: "org_other" }).success).toBe(false);
    expect(taskPatchSchema.safeParse({ completedAt: 1 }).success).toBe(false);
  });
});
