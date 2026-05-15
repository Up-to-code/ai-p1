import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("project and unit save flow source", () => {
  it("submits the project wizard through a real form with loading feedback", () => {
    const source = readSource("src/domains/projects/components/projects-screens.tsx");

    expect(source).toContain("<form");
    expect(source).toContain("onSubmit={(event) =>");
    expect(source).toContain("await saveOperation.run(async () =>");
    expect(source).toContain("onInvalidSubmit");
    expect(source).toContain("setStep(stepForProjectError(firstError))");
    expect(source).toContain('type="submit"');
    expect(source).toContain("aria-busy={isSubmitting}");
    expect(source).toContain('<Loader2 className="me-2 h-4 w-4 animate-spin" />');
  });

  it("keeps the unit wizard save flow aligned with project loading and invalid-step behavior", () => {
    const source = readSource("src/domains/properties/components/properties-screens.tsx");

    expect(source).toContain("await saveOperation.run(async () =>");
    expect(source).toContain("onInvalidSubmit");
    expect(source).toContain("setStep(stepForPropertyError(firstError))");
    expect(source).toContain('type="submit"');
    expect(source).toContain("aria-busy={isSubmitting}");
    expect(source).toContain('<Loader2 className="me-2 h-4 w-4 animate-spin" />');
  });

  it("shows single validation errors instead of hiding them until multiple fields fail", () => {
    const source = readSource("src/components/shared/crud-ui.tsx");

    expect(source).toContain("if (messages.length === 0) return null;");
    expect(source).not.toContain("if (messages.length <= 1) return null;");
  });
});
