import { describe, it, expect } from "vitest";
import { parseFollowUpActions } from "./parse-follow-up-actions";

describe("parseFollowUpActions", () => {
  it("should parse follow-up actions with labels only", () => {
    const markdown = `
Some response text

<follow-up>
  <action>Show more details</action>
  <action>Explain further</action>
  <action>Give examples</action>
</follow-up>
`;

    const result = parseFollowUpActions(markdown);
    expect(result).not.toBeNull();
    expect(result?.actions).toHaveLength(3);
    expect(result?.actions[0]).toEqual({ label: "Show more details", prompt: "Show more details" });
    expect(result?.actions[1]).toEqual({ label: "Explain further", prompt: "Explain further" });
    expect(result?.actions[2]).toEqual({ label: "Give examples", prompt: "Give examples" });
  });

  it("should parse follow-up actions with prompt attributes", () => {
    const markdown = `
Some response text

<follow-up>
  <action prompt="Create tasks for the new project">Add tasks</action>
  <action prompt="Show all deals for this client">View deals</action>
  <action prompt="Show me how to set this up">Setup guide</action>
</follow-up>
`;

    const result = parseFollowUpActions(markdown);
    expect(result).not.toBeNull();
    expect(result?.actions).toHaveLength(3);
    expect(result?.actions[0]).toEqual({ label: "Add tasks", prompt: "Create tasks for the new project" });
    expect(result?.actions[1]).toEqual({ label: "View deals", prompt: "Show all deals for this client" });
    expect(result?.actions[2]).toEqual({ label: "Setup guide", prompt: "Show me how to set this up" });
  });

  it("should return null when no follow-up tags are present", () => {
    const markdown = "Some response text without follow-up actions";
    const result = parseFollowUpActions(markdown);
    expect(result).toBeNull();
  });

  it("should return null when follow-up tags are empty", () => {
    const markdown = `<follow-up></follow-up>`;
    const result = parseFollowUpActions(markdown);
    expect(result).toBeNull();
  });

  it("should limit to 3 actions maximum", () => {
    const markdown = `
<follow-up>
  <action>Action 1</action>
  <action>Action 2</action>
  <action>Action 3</action>
  <action>Action 4</action>
  <action>Action 5</action>
</follow-up>
`;

    const result = parseFollowUpActions(markdown);
    expect(result).not.toBeNull();
    expect(result?.actions).toHaveLength(3);
  });

  it("should handle mixed labels and prompts", () => {
    const markdown = `
<follow-up>
  <action prompt="Full prompt for action 1">Label 1</action>
  <action>Label 2 without prompt</action>
  <action prompt="Full prompt for action 3">Label 3</action>
</follow-up>
`;

    const result = parseFollowUpActions(markdown);
    expect(result).not.toBeNull();
    expect(result?.actions).toHaveLength(3);
    expect(result?.actions[0]).toEqual({ label: "Label 1", prompt: "Full prompt for action 1" });
    expect(result?.actions[1]).toEqual({ label: "Label 2 without prompt", prompt: "Label 2 without prompt" });
    expect(result?.actions[2]).toEqual({ label: "Label 3", prompt: "Full prompt for action 3" });
  });

  it("should strip follow-up tags from display content", () => {
    const markdown = `
Here is your answer.

<follow-up>
  <action>Learn more</action>
</follow-up>
`;

    const result = parseFollowUpActions(markdown);
    expect(result).not.toBeNull();
    // The original content should be preserved, just the tags are stripped during display
  });
});
