import { describe, expect, it } from "vitest";
import { taskToolSearchResults } from "./tool-inputs";

describe("agent tool inputs", () => {
  it("filters task tool results by title or notes", () => {
    const tasks = [
      { id: "title", title: "Call Ahmed", notes: "" },
      { id: "notes", title: "Follow up", notes: "Ahmed asked for a brochure" },
      { id: "miss", title: "Send contract", notes: "Tomorrow" },
    ];

    expect(taskToolSearchResults(tasks, " ahmed ").map((task) => task.id)).toEqual(["title", "notes"]);
    expect(taskToolSearchResults(tasks, "").map((task) => task.id)).toEqual(["title", "notes", "miss"]);
    expect(taskToolSearchResults(tasks, 12).map((task) => task.id)).toEqual(["title", "notes", "miss"]);
  });
});
