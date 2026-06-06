import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("property form source", () => {
  const source = readSource("src/domains/properties/components/properties-screens.tsx");
  const createPage = readSource("src/app/[locale]/(app)/properties/create/page.tsx");
  const editPage = readSource("src/app/[locale]/(app)/properties/[id]/edit/page.tsx");

  it("uses one shared form component for create and edit", () => {
    expect(createPage).toContain("<PropertyFormScreen />");
    expect(editPage).toContain("<PropertyFormScreen id={id} />");
  });

  it("uses a custom searchable project picker instead of a native select", () => {
    expect(source).toContain("function UnitProjectPicker");
    expect(source).toContain("<Dialog open={isOpen} onOpenChange={setIsOpen}>");
    expect(source).toContain('role="listbox"');
    expect(source).toContain("UtilityLipsUtility");
    expect(source).toContain("projectSearchLabel");
    expect(source).toContain("projectPickerNoResults");
    expect(source).toContain("projectPickerStandalone");
    expect(source).toContain("projectPickerLoading");
    expect(source).toContain("projectPickerError");
    expect(source).toContain("const selectedName = selectedProject?.name ?? (value ? projectName : undefined)");
    expect(source).not.toContain("document.addEventListener(\"pointerdown\", onPointerDown)");
    expect(source).not.toContain("<select");
    expect(source).not.toContain("<option");
  });

  it("writes the selected project id and name into the unit form state", () => {
    expect(source).toContain('setField("projectId", project?.id ?? "")');
    expect(source).toContain('setField("project", project?.name ?? "")');
    expect(source).toContain("projectId: selectedProject?.id ?? data.projectId");
    expect(source).toContain("project: selectedProject?.name ?? data.project");
  });

  it("does not render the unit form side preview", () => {
    expect(source).not.toContain("PropertyFormPreview");
    expect(source).not.toContain("pendingCoverPreviewUrl");
    expect(source).not.toContain("previewImageUrl");
    expect(source).toContain('cover: t("gallery.cover")');
    expect(source).not.toContain("previewChecklist");
  });

  it("keeps unit form controls inline instead of nested card grids", () => {
    expect(source).toContain("function PropertyInlineChoice");
    expect(source).toContain("PropertyHelpLabel");
    expect(source).not.toContain("ChoiceGrid");
  });
});
