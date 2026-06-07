import { describe, expect, it } from "vitest";
import { clientCreateInputSchema, taskToolSearchResults } from "./tool-inputs";

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

  it("defaults sparse client create input with one contact method", () => {
    expect(clientCreateInputSchema.parse({
      name: "Mona Saleh",
      email: "mona@example.com",
    })).toMatchObject({
      name: "Mona Saleh",
      type: "person",
      email: "mona@example.com",
      source: "agent",
      status: "new",
    });

    expect(clientCreateInputSchema.parse({
      name: "Mona Saleh",
      phone: "+20 100 000 0000",
    })).toMatchObject({
      phone: "+20 100 000 0000",
      type: "person",
      source: "agent",
    });
  });

  it("rejects sparse client create input without a contact method", () => {
    expect(() => clientCreateInputSchema.parse({ name: "Mona Saleh" })).toThrow("Provide either email or phone for the client.");
  });
});
