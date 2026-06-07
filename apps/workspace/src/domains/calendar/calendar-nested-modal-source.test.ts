import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("calendar nested detail modal source", () => {
  const source = readSource("src/domains/calendar/components/calendar-screen.tsx");
  const dialogSource = readSource("src/components/ui/dialog.tsx");

  it("keeps the event dialog mounted while nested quick view is active", () => {
    expect(source).toContain("quickViewEntity && (");
    expect(source).toContain("<EntityQuickViewDialog");
    expect(source).toContain("setQuickViewEntity(null)");
  });

  it("renders nested quick view above the parent modal with a darker overlay", () => {
    expect(dialogSource).toContain("overlayClassName");
    expect(dialogSource).toContain("containerClassName");
    expect(source).toContain('overlayClassName="z-[70] bg-black/55 supports-backdrop-filter:backdrop-blur-sm"');
    expect(source).toContain('containerClassName="z-[80] p-3 sm:p-4"');
    expect(source).toContain('className="z-[80] flex max-h-[min(86vh,720px)]');
  });

  it("dims and disables parent event detail actions behind the child modal", () => {
    expect(source).toContain('quickViewEntity && "pointer-events-none select-none opacity-35 blur-[1px]"');
    expect(source).toContain("disabled={Boolean(quickViewEntity)}");
    expect(source).toContain("aria-hidden={Boolean(quickViewEntity)}");
  });

  it("keeps full navigation actions for client and asset quick views", () => {
    expect(source).toContain("router.push(`/${locale}/clients/${clientId}`)");
    expect(source).toContain("router.push(`/${locale}/assets/${asset.reference || assetId}`)");
    expect(source).toContain("Open Full Profile");
    expect(source).toContain("Open Full Asset");
  });
});
