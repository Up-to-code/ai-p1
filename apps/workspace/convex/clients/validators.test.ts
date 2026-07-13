import { describe, expect, it } from "vitest";
import {
  clientInputSchema,
  clientPatchSchema,
  clientPrioritySchema,
} from "@qentrah/domain-contracts";
import {
  clientInputValidator,
  clientPatchValidator,
  clientPriorityValidator,
  normalizeClientPriority,
  resolveClientPipelineStage,
  storedClientPriorityValidator,
} from "./validators";

const sortedKeys = (value: Record<string, unknown>) => Object.keys(value).sort();

describe("resolveClientPipelineStage", () => {
  it("returns stored pipeline stage for active clients", () => {
    expect(resolveClientPipelineStage({ status: "active", pipelineStage: "qualified" })).toBe("qualified");
  });

  it("defaults to new when pipeline stage is missing", () => {
    expect(resolveClientPipelineStage({ status: "new" })).toBe("new");
  });

  it("forces closed for archived clients", () => {
    expect(resolveClientPipelineStage({ status: "archived", pipelineStage: "negotiation" })).toBe("closed");
  });
});

describe("Client priority contract", () => {
  const convexPriorities = clientPriorityValidator.members.map(
    (member) => member.value,
  );

  it("keeps the public Zod and Convex input adapters aligned", () => {
    expect(convexPriorities).toEqual(clientPrioritySchema.options);
    expect(convexPriorities).toEqual(["normal", "high", "urgent"]);
  });

  it("rejects low for new input while preserving a legacy storage adapter", () => {
    expect(clientPrioritySchema.safeParse("low").success).toBe(false);
    expect(storedClientPriorityValidator.members.map((member) => member.value))
      .toContain("low");
  });

  it("normalizes legacy low and missing values at the presentation seam", () => {
    expect(normalizeClientPriority("low")).toBe("normal");
    expect(normalizeClientPriority(undefined)).toBe("normal");
    expect(normalizeClientPriority("urgent")).toBe("urgent");
  });
});

describe("Client executable contract parity", () => {
  it("keeps create and patch field inventories aligned across Zod and Convex", () => {
    expect(sortedKeys(clientInputValidator.fields)).toEqual(sortedKeys(clientInputSchema.shape));
    expect(sortedKeys(clientPatchValidator.fields)).toEqual(sortedKeys(clientInputSchema.shape));
  });

  it("accepts writable patches and rejects empty, unknown, or immutable fields", () => {
    expect(clientPatchSchema.safeParse({ name: "Acme Group" }).success).toBe(true);
    expect(clientPatchSchema.safeParse({}).success).toBe(false);
    expect(clientPatchSchema.safeParse({ organizationId: "org_other" }).success).toBe(false);
    expect(clientPatchSchema.safeParse({ createdByUserId: "attacker" }).success).toBe(false);
  });
});
