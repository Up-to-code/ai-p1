import test from "node:test";
import assert from "node:assert/strict";

import {
  getMarkdownTableMinWidth,
  normalizeTableRow,
  parseMarkdownTableRows,
} from "../foundation/primitives/markdownTable";

test("mobile markdown parser detects pipe tables", () => {
  const table = parseMarkdownTableRows([
    "| Area | What I can do |",
    "|---|---|",
    "| Clients | View and update client records |",
    "| Tasks | Manage action items |",
    "",
  ]);

  assert.deepEqual(table, {
    headers: ["Area", "What I can do"],
    rows: [
      ["Clients", "View and update client records"],
      ["Tasks", "Manage action items"],
    ],
    columnCount: 2,
    minWidth: 440,
    nextIndex: 4,
  });
});

test("mobile markdown parser ignores ordinary pipe text without separator", () => {
  assert.equal(parseMarkdownTableRows(["Area | What I can do"]), null);
});

test("mobile markdown parser preserves empty cells and normalizes row width", () => {
  const table = parseMarkdownTableRows([
    "| Area | Owner | Status |",
    "|---|---|---|",
    "| Clients || Ready |",
  ]);

  assert.deepEqual(table?.rows, [["Clients", "", "Ready"]]);
  assert.deepEqual(normalizeTableRow(["A"], 3), ["A", "", ""]);
});

test("mobile markdown table width scales with columns for horizontal scroll", () => {
  assert.equal(getMarkdownTableMinWidth(2), 440);
  assert.equal(getMarkdownTableMinWidth(5), 1100);
});
