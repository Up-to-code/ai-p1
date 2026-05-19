import test from "node:test";
import assert from "node:assert/strict";

import {
  assistantTurnSchema,
  extractTurnPropertyIds,
} from "@/conversation/assistantProtocol";

test("assistant turn schema accepts a property response", () => {
  const turn = assistantTurnSchema.parse({
    version: "assistant_turn.v1",
    route: "property",
    status: "completed",
    assistantText: "I shortlisted the strongest matches for you.",
    blocks: [
      {
        type: "property_list",
        id: "shortlist-1",
        title: "Best matches",
        propertyIds: ["prop-1", "prop-2"],
      },
      {
        type: "actions",
        id: "actions-1",
        actionIds: ["open-1"],
      },
    ],
    actions: [
      {
        id: "open-1",
        title: "Open property",
        name: "open_property",
        payload: { propertyId: "prop-1" },
      },
    ],
    agent: {
      primaryAgent: "property",
      participatingAgents: ["orchestrator", "property", "summary"],
      handoffs: [],
    },
    motion: {
      preset: "property",
    },
  });

  assert.deepEqual(extractTurnPropertyIds(turn), ["prop-1", "prop-2"]);
});

test("assistant turn schema rejects invalid action payloads", () => {
  assert.throws(() =>
    assistantTurnSchema.parse({
      version: "assistant_turn.v1",
      route: "property",
      status: "completed",
      assistantText: "Broken",
      blocks: [
        {
          type: "actions",
          id: "actions-1",
          actionIds: ["bad-1"],
        },
      ],
      actions: [
        {
          id: "bad-1",
          title: "Bad action",
          name: "open_property",
          payload: { brokerId: "broker-1" },
        },
      ],
      agent: {
        primaryAgent: "property",
        participatingAgents: ["property"],
        handoffs: [],
      },
      motion: {
        preset: "property",
      },
    }));
});

test("extractTurnPropertyIds tolerates malformed persisted turns", () => {
  assert.deepEqual(
    extractTurnPropertyIds({ actions: [] } as any),
    [],
  );
});
