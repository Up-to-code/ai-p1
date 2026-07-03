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

  it("uses the simplified project detail layout", () => {
    expect(source).toContain("CommandMetric label={td(\"work.status\")}");
    expect(source).toContain("CommandMetric label={t(\"detail.labels.value\")}");
    expect(source).toContain("ResourceMediaBrowser");
    expect(source).not.toContain("MiniMovement");
    expect(source).not.toContain("ReadinessBar");
    expect(source).not.toContain("ProjectAssetCard");
    expect(source).not.toContain("/assets/");
  });

  it("keeps project-specific detail data surfaces", () => {
    expect(source).toContain("projectDocumentAssets(projectMedia)");
    expect(source).toContain("compactProjectDetailRows(optionalCoreDetailRows)");
    expect(source).toContain("projectLocationLabel(project)");
    expect(source).toContain("ProjectMetaPill icon={Layers3}");

  });

  it("aligns project create/edit with media and documents tabs", () => {
    expect(source).toContain("const totalSteps = 5");
    expect(source).toContain('t("form.stepLegal")');
    expect(source).toContain('t("form.stepDocuments")');
    expect(source).toContain("pendingMediaFiles");
    expect(source).toContain("pendingDocumentFiles");
    expect(source).toContain("files: pendingMediaFiles");
    expect(source).toContain("files: pendingDocumentFiles");
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
