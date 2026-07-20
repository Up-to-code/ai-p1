import { describe, expect, it } from "vitest";
import { automationNodeConfigurationProblems } from "./configuration";

describe("automation action configuration", () => {
  it("requires every binding in the Sheets to agent to WhatsApp path", () => {
    expect(
      automationNodeConfigurationProblems({
        id: "sheets",
        kind: "action",
        type: "google_sheets",
        label: "Get spreadsheet values",
        x: 0,
        y: 0,
        config: {},
      }),
    ).toHaveLength(3);
    expect(
      automationNodeConfigurationProblems({
        id: "agent",
        kind: "action",
        type: "agent",
        label: "Analyze order",
        x: 0,
        y: 0,
        config: { agentId: "agent-id", prompt: "Find problems" },
      }),
    ).toEqual([]);
    expect(
      automationNodeConfigurationProblems({
        id: "whatsapp",
        kind: "action",
        type: "whatsapp_message",
        label: "Send message",
        x: 0,
        y: 0,
        config: {},
      }),
    ).toHaveLength(3);
  });
});
