import { describe, expect, it } from "vitest";
import { parseClientUpdatePatch } from "../subagents/clients/client-update-input";
import { parseCalendarUpdatePatch } from "../subagents/calendar/calendar-update-input";
import { buildDealUpdateInput } from "../subagents/deals/deal-update-input";
import { buildProjectUpdateInput } from "../subagents/projects/project-update-input";
import { parseTaskUpdatePatch } from "../subagents/tasks/task-update-input";

describe("Eve domain-owned update inputs", () => {
  it("passes a validated Client patch without mirroring the persisted record", () => {
    expect(parseClientUpdatePatch({ name: "After", phone: "+201" })).toEqual({
      name: "After",
      phone: "+201",
    });
    expect(() => parseClientUpdatePatch({ organizationId: "org_other" })).toThrow();
  });

  it("supports domain-specific Deal, Project, and configurable Task transitions", () => {
    expect(
      buildDealUpdateInput(
        { title: "Deal", stage: "lead", status: "open", priority: "normal" },
        { stage: "qualified" },
      ).stage,
    ).toBe("qualified");
    expect(
      buildProjectUpdateInput(
        { name: "Project", status: "active", health: "onTrack" },
        { visibility: "space_members" },
      ).visibility,
    ).toBe("space_members");
    expect(parseTaskUpdatePatch({ status: "client-review" })).toEqual({
      status: "client-review",
    });
  });

  it("passes a Calendar patch without mirroring the persisted event", () => {
    expect(parseCalendarUpdatePatch({ endAt: 3 })).toEqual({ endAt: 3 });
    expect(() => parseCalendarUpdatePatch({ organizationId: "org_other" })).toThrow();
  });

  it("rejects unknown, immutable, and explicit-null patch fields", () => {
    expect(() => parseClientUpdatePatch({ organizationId: "org_other" })).toThrow();
    expect(() => parseClientUpdatePatch({ createdAt: 1 })).toThrow();
    expect(() => parseClientUpdatePatch({ name: null })).toThrow();
  });
});
