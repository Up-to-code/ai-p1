import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

describe("select layering", () => {
  it("keeps portaled select menus above drawer overlays", () => {
    const selectSource = readFileSync(resolve(root, "src/components/ui/select.tsx"), "utf8");
    const calendarSource = readFileSync(resolve(root, "src/domains/calendar/components/calendar-screen.tsx"), "utf8");
    const sheetSource = readFileSync(resolve(root, "src/components/ui/sheet.tsx"), "utf8");

    expect(calendarSource).toContain("z-[100]");
    expect(calendarSource).toContain("z-[101]");
    expect(sheetSource).toContain("z-50");
    expect(selectSource).toContain("z-[260]");
    expect(selectSource).not.toContain("className=\"isolate z-50\"");
  });
});
