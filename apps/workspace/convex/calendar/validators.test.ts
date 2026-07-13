import { describe, expect, it } from "vitest";
import {
  calendarEventInputObjectSchema,
  calendarEventInputSchema,
  calendarEventPatchSchema,
} from "@qentrah/domain-contracts";
import { calendarEventInputValidator, calendarEventPatchValidator } from "./validators";

const sortedKeys = (value: Record<string, unknown>) => Object.keys(value).sort();

describe("Calendar executable contract parity", () => {
  it("keeps create and patch field inventories aligned across adapters", () => {
    expect(sortedKeys(calendarEventInputValidator.fields))
      .toEqual(sortedKeys(calendarEventInputObjectSchema.shape));
    expect(sortedKeys(calendarEventPatchValidator.fields))
      .toEqual(sortedKeys(calendarEventInputObjectSchema.shape));
  });

  it("enforces time ordering and writable patch boundaries", () => {
    expect(calendarEventInputSchema.safeParse({
      title: "Kickoff",
      startAt: 20,
      endAt: 10,
      type: "meeting",
      status: "confirmed",
    }).success).toBe(false);
    expect(calendarEventPatchSchema.safeParse({ title: "Renamed" }).success).toBe(true);
    expect(calendarEventPatchSchema.safeParse({}).success).toBe(false);
    expect(calendarEventPatchSchema.safeParse({ organizationId: "org_other" }).success).toBe(false);
  });
});
