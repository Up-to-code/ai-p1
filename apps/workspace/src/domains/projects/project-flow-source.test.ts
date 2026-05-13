import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("project flow source", () => {
  const source = readSource("src/domains/projects/components/projects-screens.tsx");

  it("uses the shared unit-style detail header and tab spacing pattern", () => {
    expect(source).toContain("<Tabs defaultValue=\"details\" className=\"space-y-6\"");
    expect(source).toContain("className=\"min-w-0 space-y-3\"");
    expect(source).toContain("<AppTabsList");
    expect(source).toContain("<div className=\"mt-6\">");
    expect(source).not.toContain("<TabsList");
    expect(source).not.toContain("<TabsTrigger");
  });

  it("keeps project-specific detail tabs and data surfaces", () => {
    for (const value of ['value: "details"', 'value: "inventory"', 'value: "documents"', 'value: "sales"', 'value: "activity"']) {
      expect(source).toContain(value);
    }
    expect(source).toContain("ProjectSignal label={t('detail.labels.units')}");
    expect(source).toContain("ReadinessBar label={td('metrics.launchReadiness')}");
    expect(source).toContain("ResourceMediaBrowser");
    expect(source).not.toContain("REGA-8829-01");
    expect(source).not.toContain("42.8M SAR");
  });

  it("aligns project create/edit with media and documents tabs", () => {
    expect(source).toContain("const totalSteps = 5");
    expect(source).toContain('t("form.stepLegal")');
    expect(source).toContain('t("form.stepDocuments")');
    expect(source).toContain("pendingMediaFiles");
    expect(source).toContain("pendingDocumentFiles");
    expect(source).toContain("files: pendingMediaFiles");
    expect(source).toContain("files: pendingDocumentFiles");
    expect(source).toContain("regaAuthorizationNo");
    expect(source).toContain("allowedKinds={[\"document\"]}");
    expect(source).toContain("previewDocuments");
  });
});
