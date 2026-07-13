import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "./components/ui/button";
import { AdminInput, SegmentedControl } from "./forms";
import { DocsCallout, ScopeBadge } from "./docs";
import { FilterChipBar } from "./components/ui/filter-chip";
import { Section } from "./public";

describe("@qentrah/ui", () => {
  it("renders migrated UI primitives", () => {
    expect(renderToStaticMarkup(<Button>Save</Button>)).toContain("Save");
    expect(renderToStaticMarkup(<Section>Public</Section>)).toContain("Public");
  });

  it("renders reusable forms, docs, and workspace primitives", () => {
    expect(renderToStaticMarkup(<AdminInput name="name" />)).toContain("name");
    expect(renderToStaticMarkup(<SegmentedControl aria-label="range" activeValue="30d" items={[{ value: "30d", label: "30" }]} />)).toContain("30");
    expect(renderToStaticMarkup(<DocsCallout callout={{ tone: "info", title: "Heads up", body: "Shared docs UI" }} />)).toContain("Heads up");
    expect(renderToStaticMarkup(<ScopeBadge scopeId="assets:read" label="Read assets" />)).toContain("Read assets");
    expect(renderToStaticMarkup(<FilterChipBar chips={[{ key: "all", label: "All" }]} activeKey="all" onChange={() => undefined} />)).toContain("All");
  });
});
