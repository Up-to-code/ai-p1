import { describe, expect, it } from "vitest";
import { formatAiResponseText } from "./ai-response-format";

describe("formatAiResponseText", () => {
  it("removes internal agent markup while preserving readable text", () => {
    expect(
      formatAiResponseText('<p data-agent-actor="true">List brain notes</p><p data-agent-actor="true">Turn into task</p>'),
    ).toBe("List brain notes\nTurn into task");
  });

  it("removes control tags and decodes common HTML entities", () => {
    expect(formatAiResponseText("<follow-up><action>Draft &amp; share</action></follow-up>")).toBe("Draft & share");
  });
});
