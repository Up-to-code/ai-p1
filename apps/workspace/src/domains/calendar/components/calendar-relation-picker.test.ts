import { describe, expect, it } from "vitest";
import { filterCalendarRelationOptions } from "./calendar-relation-picker";

const options = [
  { value: "project_01", label: "Website launch", description: "Active project" },
  { value: "task_99", label: "Prepare launch brief", description: "In progress" },
];

describe("calendar relation picker", () => {
  it("searches human labels and helpers while retaining IDs as values", () => {
    expect(filterCalendarRelationOptions(options, "website")).toEqual([options[0]]);
    expect(filterCalendarRelationOptions(options, "progress")).toEqual([options[1]]);
    expect(filterCalendarRelationOptions(options, "website")[0]?.value).toBe("project_01");
  });
});
