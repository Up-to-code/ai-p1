import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "./components/ui/button";
import { AdminInput, SegmentedControl } from "./forms";
import { DocsCallout, ScopeBadge } from "./docs";
import { BrokerCard, DeveloperCard, FilterChipBar, WorkspaceAssetCardContent } from "./workspace";
import { PageHeader, StatusBadge } from "./admin";
import { Section } from "./public";

describe("@qentrah/ui", () => {
  it("renders migrated UI primitives", () => {
    expect(renderToStaticMarkup(<Button>Save</Button>)).toContain("Save");
    expect(renderToStaticMarkup(<PageHeader eyebrow="Ops" title="Overview" />)).toContain("Overview");
    expect(renderToStaticMarkup(<Section>Public</Section>)).toContain("Public");
  });

  it("formats status labels without app-local label imports", () => {
    expect(renderToStaticMarkup(<StatusBadge value="pending_review" formatLabel={(value) => value.toUpperCase()} />)).toContain("PENDING_REVIEW");
  });

  it("renders reusable forms, docs, and workspace primitives", () => {
    expect(renderToStaticMarkup(<AdminInput name="name" />)).toContain("name");
    expect(renderToStaticMarkup(<SegmentedControl aria-label="range" activeValue="30d" items={[{ value: "30d", label: "30" }]} />)).toContain("30");
    expect(renderToStaticMarkup(<DocsCallout callout={{ tone: "info", title: "Heads up", body: "Shared docs UI" }} />)).toContain("Heads up");
    expect(renderToStaticMarkup(<ScopeBadge scopeId="assets:read" label="Read assets" />)).toContain("Read assets");
    expect(renderToStaticMarkup(<FilterChipBar chips={[{ key: "all", label: "All" }]} activeKey="all" onChange={() => undefined} />)).toContain("All");
    expect(renderToStaticMarkup(<DeveloperCard developer={{ id: "dev-1", name: "Dev", avatarLabel: "D" }} />)).toContain("Dev");
    expect(renderToStaticMarkup(<BrokerCard broker={{ id: "broker-1", name: "Broker", avatarLabel: "B", avatarImage: "/avatar.png", state: "idle" }} />)).toContain("Broker");
    expect(renderToStaticMarkup(
      <WorkspaceAssetCardContent
        image="/asset.png"
        title="Asset"
        location="Remote"
        priceLabel="1M"
        summary="Summary"
        specs={[{ label: "Owner", value: "Ops" }]}
      />,
    )).toContain("Asset");
  });
});
