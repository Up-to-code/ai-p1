import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("asset detail redesign source", () => {
  const source = readSource("src/domains/assets/components/assets-screens.tsx");

  it("keeps existing asset detail data and action hooks", () => {
    expect(source).toContain("useAssetQuery(workspaceOrganizationId, id)");
    expect(source).toContain("useAssetClientLinksQuery(workspaceOrganizationId, asset?.id)");
    expect(source).toContain('useResourceMediaQuery(workspaceOrganizationId, "asset", asset?.id)');
    expect(source).toContain("useClientsPagedQuery(isClientLinkOpen ? workspaceOrganizationId : undefined, { search: clientSearch })");
    expect(source).toContain("assetMediaAssets(mediaAssets)");
    expect(source).toContain("assetGalleryPreview(galleryAssets)");
    expect(source).toContain("availableAssetClientCandidates(clientCandidates, assetClientLinks)");
    expect(source).toContain("selectedAssetClientName(clientCandidates, clientToLink)");
    expect(source).toContain("linkClientAssetRequest(workspaceOrganizationId, clientToLink, asset.id");
    expect(source).toContain("unlinkClientAssetRequest(workspaceOrganizationId, link.clientId, asset.id)");
  });

  it("keeps the four asset detail tabs", () => {
    for (const value of ['value: "overview"', 'value: "media"', 'value: "files"', 'value: "clients"']) {
      expect(source).toContain(value);
    }
    expect(source).toContain("<Tabs defaultValue=\"overview\"");
    expect(source).toContain("<AppTabsList");
    expect(source).toContain("className=\"min-w-0 space-y-3\"");
    expect(source).toContain("<div className=\"mt-6\">");
    expect(source).not.toContain("rounded-[18px] border border-zinc-200/70 bg-zinc-50/70 p-1");
  });

  it("renders linked clients as a table/list instead of the old card grid", () => {
    expect(source).toContain("data-asset-linked-clients-table");
    expect(source).toContain("<table");
    expect(source).toContain("<tbody");
    expect(source).toContain("md:hidden");
    expect(source).toContain("<Unlink className=\"h-3.5 w-3.5\" />");
    expect(source).toContain("data-client-link-quick-edit");
    expect(source).not.toContain('className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3"');
  });

  it("moves gallery, options, description, and legal summary into the overview tab", () => {
    expect(source).toContain("data-asset-overview-gallery");
    expect(source).toContain("data-asset-option-chips");
    expect(source).toContain("data-asset-description-section");
    expect(source).toContain("data-asset-legal-summary");
    expect(source).toContain("hiddenGalleryCount");
    expect(source).toContain("<table className=\"w-full text-[11px]\"");
    expect(source).toContain("<th className=\"pb-2 text-start\">Field</th>");
  });

  it("uses browse-first media/files tabs with upload modals and a media viewer", () => {
    expect(source).toContain("data-asset-media-tab");
    expect(source).toContain("data-asset-files-tab");
    expect(source).toContain("setIsMediaUploadOpen(true)");
    expect(source).toContain("setIsDocumentUploadOpen(true)");
    expect(source).toContain("hideHeader: true");
    expect(source).toContain("hideDropDescription: true");
    expect(source).toContain("data-asset-media-viewer");
    expect(source).toContain("moveMediaViewer(-1)");
    expect(source).toContain("moveMediaViewer(1)");
  });

  it("keeps create and edit aligned with asset media, documents, and selectable types", () => {
    expect(source).toContain("const totalSteps = 4");
    expect(source).toContain('t("form.stepDocuments")');
    expect(source).toContain("pendingMediaFiles");
    expect(source).toContain("pendingDocumentFiles");
    expect(source).toContain("files: pendingMediaFiles");
    expect(source).toContain("files: pendingDocumentFiles");
    expect(source).toContain("allowedKinds={[\"document\"]}");
    expect(source).toContain("translatedAssetTypes.map((type)");
  });

  it("uses paged client candidates and status chips without rendering client ids as UI text", () => {
    expect(source).toContain("data-client-candidate-paged-list");
    expect(source).toContain("data-client-link-status-chips");
    expect(source).toContain("<InfiniteScrollSentinel");
    expect(source).toContain("setClientLinkStatus(status)");
    expect(source).not.toContain("{client.id}</span>");
  });

  it("keeps loading and empty linked-client states available", () => {
    expect(source).toContain("data-asset-linked-clients-loading");
    expect(source).toContain("assetClientLinksQuery === undefined");
    expect(source).toContain("assetClientLinks.length === 0");
    expect(source).toContain("setIsClientLinkOpen(true)");
    expect(source).toContain("router.push(`/clients/${client.id}`)");
  });
});
