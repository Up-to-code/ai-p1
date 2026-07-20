import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Alert, AlertTitle } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import { Card, CardTitle } from "./components/ui/card";
import { Checkbox } from "./components/ui/checkbox";
import { Input } from "./components/ui/input";
import { Progress } from "./components/ui/progress";
import { Separator } from "./components/ui/separator";
import { Skeleton } from "./components/ui/skeleton";
import { Spinner } from "./components/ui/spinner";
import { Textarea } from "./components/ui/textarea";
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

  it("renders DUI-migrated primitives with a11y and states", () => {
    expect(renderToStaticMarkup(<Input label="Email" error="Required" />)).toContain("aria-invalid");
    expect(renderToStaticMarkup(<Textarea placeholder="Notes" />)).toContain("Notes");
    expect(renderToStaticMarkup(<Skeleton className="h-4 w-20" />)).toContain("data-slot=\"skeleton\"");
    expect(renderToStaticMarkup(<Card><CardTitle>Title</CardTitle></Card>)).toContain("Title");
    expect(renderToStaticMarkup(<Alert variant="destructive"><AlertTitle>Fail</AlertTitle></Alert>)).toContain("role=\"alert\"");
    expect(renderToStaticMarkup(<Checkbox checked disabled />)).toContain("disabled");
    expect(renderToStaticMarkup(<Progress value={40} max={100} />)).toContain("aria-valuenow=\"40\"");
    expect(renderToStaticMarkup(<Separator orientation="vertical" />)).toContain("aria-orientation=\"vertical\"");
    expect(renderToStaticMarkup(<Spinner />)).toContain("Loading");
  });
});
