import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("workspace dashboard localization", () => {
  it("keeps normal-mode dashboard labels in message files", () => {
    const source = readSource("domains/dashboard/components/dashboard-screen.tsx");

    for (const hardcodedLabel of [
      '"New properties"',
      '"Latest clients"',
      '"Upcoming meeting"',
      '"View all"',
      '"view all"',
      '"Area"',
      '"Layout"',
      '"Beds"',
      '"coming from"',
    ]) {
      expect(source).not.toContain(hardcodedLabel);
    }

    expect(source).toContain('t("normal.newProperties")');
    expect(source).toContain('t("normal.clientsTable.comingFrom")');
    expect(source).toContain('tc(`stages.${client.pipelineStage}`)');
    expect(source).toContain('text-[#0B5CFF]');
  });
});
