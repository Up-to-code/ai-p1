import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "./components/ui/button";
import { AdminInput, SegmentedControl } from "./forms";
import { DocsCallout, ScopeBadge } from "./docs";
import { BrokerCard, DeveloperCard, FilterChipBar, WorkspacePropertyCardContent } from "./workspace";
import { PageHeader, StatusBadge } from "./admin";
import { Section } from "./public";

describe("@anan/ui", () => {
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
    expect(renderToStaticMarkup(<ScopeBadge scopeId="properties:read" label="Read properties" />)).toContain("Read properties");
    expect(renderToStaticMarkup(<FilterChipBar chips={[{ key: "all", label: "All" }]} activeKey="all" onChange={() => undefined} />)).toContain("All");
    expect(renderToStaticMarkup(<DeveloperCard developer={{ id: "dev-1", name: "Dev", avatarLabel: "D" }} />)).toContain("Dev");
    expect(renderToStaticMarkup(<BrokerCard broker={{ id: "broker-1", name: "Broker", avatarLabel: "B", avatarImage: "/avatar.png", state: "idle" }} />)).toContain("Broker");
    expect(renderToStaticMarkup(
      <WorkspacePropertyCardContent
        image="/property.png"
        title="Property"
        location="Riyadh"
        priceLabel="1M"
        summary="Summary"
        specs={[{ label: "Beds", value: "3" }]}
      />,
    )).toContain("Property");
  });
});
