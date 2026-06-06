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

  it("uses the project command detail header and tab spacing pattern", () => {
    expect(source).toContain("<Tabs defaultValue=\"overview\" className=\"space-y-6\"");
    expect(source).toContain("MiniMovement label={td('sales.status.available')}");
    expect(source).toContain("<AppTabsList");
    expect(source).toContain("className=\"gap-8\"");
    expect(source).not.toContain("<TabsList");
    expect(source).not.toContain("<TabsTrigger");
  });

  it("keeps project-specific detail tabs and data surfaces", () => {
    for (const value of ['value: "overview"', 'value: "inventory"', 'value: "documents"', 'value: "sales"', 'value: "activity"']) {
      expect(source).toContain(value);
    }
    expect(source).toContain("projectInventoryMetrics(units, project?.units ?? 0)");
    expect(source).toContain("projectDocumentAssets(projectMedia)");
    expect(source).toContain("compactProjectDetailRows(optionalCoreDetailRows)");
    expect(source).toContain("projectLocationLabel(project)");
    expect(source).toContain("ProjectMetaPill icon={Layers3}");
    expect(source).toContain("ReadinessBar label={td('metrics.inventoryCoverage')}");
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
    expect(source).not.toContain("previewChecklist");
    expect(source).toContain("ProjectPricingSection");
    expect(source).toContain("ProjectDatePicker");
  });

  it("does not render the project form side preview", () => {
    expect(source).not.toContain("ProjectFormPreview");
    expect(source).not.toContain("pendingCoverPreviewUrl");
    expect(source).not.toContain("previewImageUrl");
  });
});
