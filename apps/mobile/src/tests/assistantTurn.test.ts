import test from "node:test";
import assert from "node:assert/strict";

import {
  assistantTurnSchema,
  extractTurnAssetIds,
} from "@/conversation/assistantProtocol";

test("assistant turn schema accepts an asset response", () => {
  const turn = assistantTurnSchema.parse({
    version: "assistant_turn.v1",
    route: "asset",
    status: "completed",
    assistantText: "I shortlisted the strongest matches for you.",
    blocks: [
      {
        type: "asset_list",
        id: "shortlist-1",
        title: "Best matches",
        assetIds: ["prop-1", "prop-2"],
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
        title: "Open asset",
        name: "open_asset",
        payload: { assetId: "prop-1" },
      },
    ],
    agent: {
      primaryAgent: "asset",
      participatingAgents: ["orchestrator", "asset", "summary"],
      handoffs: [],
    },
    motion: {
      preset: "asset",
    },
  });

  assert.deepEqual(extractTurnAssetIds(turn), ["prop-1", "prop-2"]);
});

test("assistant turn schema rejects invalid action payloads", () => {
  assert.throws(() =>
    assistantTurnSchema.parse({
      version: "assistant_turn.v1",
      route: "asset",
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
          name: "open_asset",
          payload: { brokerId: "broker-1" },
        },
      ],
      agent: {
        primaryAgent: "asset",
        participatingAgents: ["asset"],
        handoffs: [],
      },
      motion: {
        preset: "asset",
      },
    }));
});

test("extractTurnAssetIds tolerates malformed persisted turns", () => {
  assert.deepEqual(
    extractTurnAssetIds({ actions: [] } as any),
    [],
  );
});
