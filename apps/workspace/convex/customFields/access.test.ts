import { describe, expect, it } from "vitest";
import { customFieldPermissionResource } from "./access";

describe("customFieldPermissionResource", () => {
  it.each([
    ["client", "client"],
    ["deal", "deal"],
    ["opportunity", "deal"],
    ["project", "project"],
    ["task", "task"],
    ["calendarEvent", "calendar"],
    ["doc", "document"],
    ["media", "media"],
    ["space", "space"],
  ] as const)("maps %s custom fields to %s access", (recordType, resource) => {
    expect(customFieldPermissionResource(recordType)).toBe(resource);
  });
});
