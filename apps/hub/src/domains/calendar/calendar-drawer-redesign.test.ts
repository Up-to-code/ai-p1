import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

describe("calendar schedule drawer redesign", () => {
  it("keeps the quick schedule drawer wide, simple, and picker based", () => {
    const source = readFileSync(resolve(root, "src/domains/calendar/components/calendar-screen.tsx"), "utf8");

    expect(source).toContain("data-[side=right]:w-[min(94vw,980px)]");
    expect(source).toContain("ContextActionCard");
    expect(source).toContain("ContextPickerOverlay");
    expect(source).toContain("form.showAdvancedDetails");
    expect(source).toContain("form.titleOptionalLabel");
    expect(source).not.toContain("calendar-client-context");
    expect(source).not.toContain("calendar-unit-context");
  });
});
