import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_MISSING_LLM_MESSAGE,
  DEFAULT_WORKER_OFFLINE_MESSAGE,
  deriveAgentRuntimeHealth,
  getRuntimeDisabledReason,
} from "../persistence/convex/runtimeHealth";

test("deriveAgentRuntimeHealth keeps healthy runtime message undefined when web search is disabled", () => {
  const health = deriveAgentRuntimeHealth({
    auth: { anonymousEnabled: true, emailPasswordEnabled: true },
    llm: { configured: true, provider: "openrouter" },
    webSearch: { configured: false },
    featureVersion: "guest-ready-v1",
    capabilities: {
      sendMessage: true,
      threadMessages: true,
      stageFeed: true,
      runStatus: true,
      workflowRuns: true,
    },
    workflow: { configured: true, provider: "convex-orchestrator" },
    worker: { configured: true, available: true, lastHeartbeatAt: 123, staleAfterMs: 456 },
    message: undefined,
  });

  assert.equal(health.status, "ready");
  assert.equal(health.message, undefined);
  assert.equal(getRuntimeDisabledReason(health), undefined);
});

test("deriveAgentRuntimeHealth uses missing LLM fallback only when runtime unusable", () => {
  const health = deriveAgentRuntimeHealth({
    llm: { configured: false, provider: null },
    worker: { configured: false, available: false },
  });

  assert.equal(health.status, "unavailable");
  assert.equal(health.message, DEFAULT_MISSING_LLM_MESSAGE);
});

test("deriveAgentRuntimeHealth uses worker offline fallback only when worker is unavailable", () => {
  const health = deriveAgentRuntimeHealth({
    llm: { configured: true, provider: "openrouter" },
    worker: { configured: true, available: false },
  });

  assert.equal(health.status, "unavailable");
  assert.equal(health.message, DEFAULT_WORKER_OFFLINE_MESSAGE);
  assert.equal(getRuntimeDisabledReason(health), DEFAULT_WORKER_OFFLINE_MESSAGE);
});
