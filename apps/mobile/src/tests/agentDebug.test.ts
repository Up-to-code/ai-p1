import test from "node:test";
import assert from "node:assert/strict";

import {
  extractProviderRequestId,
  isAgentDebugEnabled,
  normalizeAgentFailureMessage,
} from "@/conversation/lib/agentDebug";
import { getCuratedAssistantSurfaceCopy } from "@/conversation/assistantProtocol";

test("agent failure normalization keeps provider request id but hides raw server error wording", () => {
  const copy = getCuratedAssistantSurfaceCopy("en");
  assert.equal(
    normalizeAgentFailureMessage("Server Error [Request ID: 0015025d0daaf9e1]", copy),
    "The assistant is unavailable right now. Request ID: 0015025d0daaf9e1",
  );
});

test("agent failure normalization localizes generic request failures", () => {
  const copy = getCuratedAssistantSurfaceCopy("ar");
  assert.equal(
    normalizeAgentFailureMessage("Agent request failed.", copy),
    "المساعد غير متاح الآن.",
  );
});

test("provider request id extraction handles missing ids", () => {
  assert.equal(extractProviderRequestId("Server Error [Request ID: abc_123-xyz]"), "abc_123-xyz");
  assert.equal(extractProviderRequestId("timeout"), null);
});

test("agent debug logging can be enabled from mobile env", () => {
  const previous = process.env.EXPO_PUBLIC_AGENT_DEBUG;
  process.env.EXPO_PUBLIC_AGENT_DEBUG = "1";
  try {
    assert.equal(isAgentDebugEnabled(), true);
  } finally {
    if (previous === undefined) {
      delete process.env.EXPO_PUBLIC_AGENT_DEBUG;
    } else {
      process.env.EXPO_PUBLIC_AGENT_DEBUG = previous;
    }
  }
});
