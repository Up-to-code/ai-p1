import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("web apps route aliases", () => {
  it("keeps web apps as the rendered route and integrations as compatibility redirects", () => {
    expect(readSource("src/app/[locale]/(app)/web-apps/page.tsx")).toContain("IntegrationsScreen");
    expect(readSource("src/app/[locale]/(app)/web-apps/[id]/page.tsx")).toContain("IntegrationDetailScreen");
    expect(readSource("src/app/[locale]/(app)/integrations/page.tsx")).toContain('redirect(`/${locale}/web-apps`)');
    expect(readSource("src/app/[locale]/(app)/integrations/[id]/page.tsx")).toContain('redirect(`/${locale}/web-apps/${id}`)');
  });

  it("points sidebar navigation and copy at web apps", () => {
    expect(readSource("src/components/layout/sidebar.tsx")).toContain('{ name: "integrations", href: "/web-apps", icon: Plug }');
    expect(readSource("messages/en.json")).toContain('"integrations": "Web Apps"');
    expect(readSource("messages/ar.json")).toContain('"integrations": "تطبيقات الويب"');
  });
});
