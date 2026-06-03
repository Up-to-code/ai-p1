import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("property detail redesign source", () => {
  const source = readSource("src/domains/properties/components/properties-screens.tsx");

  it("keeps existing property detail data and action hooks", () => {
    expect(source).toContain("usePropertyQuery(workspaceOrganizationId, id)");
    expect(source).toContain("usePropertyClientLinksQuery(workspaceOrganizationId, unit?.id)");
    expect(source).toContain('useResourceMediaQuery(workspaceOrganizationId, "property", unit?.id)');
    expect(source).toContain("useClientsPagedQuery(isClientLinkOpen ? workspaceOrganizationId : undefined, { search: clientSearch })");
    expect(source).toContain("propertyMediaAssets(mediaAssets)");
    expect(source).toContain("propertyGalleryPreview(galleryAssets)");
    expect(source).toContain("availablePropertyClientCandidates(clientCandidates, propertyClientLinks)");
    expect(source).toContain("selectedPropertyClientName(clientCandidates, clientToLink)");
    expect(source).toContain("linkClientUnitRequest(workspaceOrganizationId, clientToLink, unit.id");
    expect(source).toContain("unlinkClientUnitRequest(workspaceOrganizationId, link.clientId, unit.id)");
  });

  it("keeps the four property detail tabs", () => {
    for (const value of ['value: "overview"', 'value: "media"', 'value: "files"', 'value: "clients"']) {
      expect(source).toContain(value);
    }
    expect(source).toContain("<Tabs defaultValue=\"overview\"");
    expect(source).toContain("<AppTabsList");
    expect(source).toContain("className=\"gap-8\"");
    expect(source).toContain("<div className=\"mt-6\">");
    expect(source).not.toContain("rounded-[18px] border border-zinc-200/70 bg-zinc-50/70 p-1");
  });

  it("renders linked clients as a table/list instead of the old card grid", () => {
    expect(source).toContain("data-property-linked-clients-table");
    expect(source).toContain("<table");
    expect(source).toContain("<tbody");
    expect(source).toContain("md:hidden");
    expect(source).toContain("<Unlink className=\"h-3.5 w-3.5\" />");
    expect(source).toContain("data-client-link-quick-edit");
    expect(source).not.toContain('className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3"');
  });

  it("moves gallery, options, description, and legal summary into the overview tab", () => {
    expect(source).toContain("data-property-overview-gallery");
    expect(source).toContain("data-property-option-chips");
    expect(source).toContain("data-property-description-section");
    expect(source).toContain("data-property-legal-summary");
    expect(source).toContain("hiddenGalleryCount");
    expect(source).toContain("<table className=\"w-full text-[11px]\"");
    expect(source).toContain("<th className=\"pb-2 text-start\">Field</th>");
  });

  it("uses browse-first media/files tabs with upload modals and a media viewer", () => {
    expect(source).toContain("data-property-media-tab");
    expect(source).toContain("data-property-files-tab");
    expect(source).toContain("setIsMediaUploadOpen(true)");
    expect(source).toContain("setIsDocumentUploadOpen(true)");
    expect(source).toContain("hideHeader: true");
    expect(source).toContain("hideDropDescription: true");
    expect(source).toContain("data-property-media-viewer");
    expect(source).toContain("moveMediaViewer(-1)");
    expect(source).toContain("moveMediaViewer(1)");
  });

  it("keeps create and edit aligned with unit media, documents, and selectable types", () => {
    expect(source).toContain("const totalSteps = 4");
    expect(source).toContain('t("form.stepDocuments")');
    expect(source).toContain("pendingMediaFiles");
    expect(source).toContain("pendingDocumentFiles");
    expect(source).toContain("files: pendingMediaFiles");
    expect(source).toContain("files: pendingDocumentFiles");
    expect(source).toContain("allowedKinds={[\"document\"]}");
    expect(source).toContain("translatedPropertyTypes.map((type)");
  });

  it("uses paged client candidates and status chips without rendering client ids as UI text", () => {
    expect(source).toContain("data-client-candidate-paged-list");
    expect(source).toContain("data-client-link-status-chips");
    expect(source).toContain("<InfiniteScrollSentinel");
    expect(source).toContain("setClientLinkStatus(status)");
    expect(source).not.toContain("{client.id}</span>");
  });

  it("keeps loading and empty linked-client states available", () => {
    expect(source).toContain("data-property-linked-clients-loading");
    expect(source).toContain("propertyClientLinksQuery === undefined");
    expect(source).toContain("propertyClientLinks.length === 0");
    expect(source).toContain("setIsClientLinkOpen(true)");
    expect(source).toContain("router.push(`/clients/${client.id}`)");
  });
});
