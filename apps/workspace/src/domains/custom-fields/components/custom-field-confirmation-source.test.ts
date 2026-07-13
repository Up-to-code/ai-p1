import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const taskPanelSource = readFileSync(
  fileURLToPath(new URL("../../tasks/components/task-table-fields-panel.tsx", import.meta.url)),
  "utf8",
);
const settingsSource = readFileSync(
  fileURLToPath(new URL("./custom-fields-settings.tsx", import.meta.url)),
  "utf8",
);

describe("Custom Field delete confirmations", () => {
  it.each([
    ["Task Fields panel", taskPanelSource],
    ["Custom Fields settings", settingsSource],
  ])("uses an app dialog instead of browser confirmation in %s", (_name, source) => {
    expect(source).toContain("DeleteRecordDialog");
    expect(source).not.toMatch(/(?:window\.)?confirm\(/u);
  });
});
