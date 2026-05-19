import test from "node:test";
import assert from "node:assert/strict";

import { findLastIndex } from "../foundation/utils/findLastIndex";

test("findLastIndex returns the last matching index", () => {
  assert.equal(findLastIndex([1, 2, 3, 2], (value) => value === 2), 3);
});

test("findLastIndex returns -1 when no item matches", () => {
  assert.equal(findLastIndex(["a", "b"], (value) => value === "z"), -1);
});
