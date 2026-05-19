import test from "node:test";
import assert from "node:assert/strict";

import { buildSummary } from "../conversation/utils/buildSummary";
import { createPropertyCards } from "./factories/propertyFactory";

const properties = createPropertyCards();

test("summary keeps top property as lead option", () => {
  const summary = buildSummary("Need a premium move-in-ready home", properties);

  assert.ok(summary.includes(properties[0].title));
  assert.ok(summary.includes("Best fit"));
});

test("summary shifts tone for investment prompts", () => {
  const summary = buildSummary("Need an investment property with yield upside", properties);

  assert.ok(summary.includes("Best yield path"));
});
