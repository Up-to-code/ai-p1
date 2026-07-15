import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function getValueAtPath(value: unknown, path: string) {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[segment];
  }, value);
}

describe("web apps route aliases", () => {
  it("renders web apps routes while keeping legacy integrations aliases unavailable", () => {
    expect(readSource("src/app/[locale]/(app)/web-apps/page.tsx")).toContain("<IntegrationsScreen />");
    expect(readSource("src/app/[locale]/(app)/web-apps/[id]/page.tsx")).toContain("<IntegrationDetailScreen id={id} />");
    expect(readSource("src/app/[locale]/(app)/integrations/page.tsx")).toContain('redirect(`/${locale}/ws`)');
    expect(readSource("src/app/[locale]/(app)/integrations/[id]/page.tsx")).toContain('redirect(`/${locale}/ws`)');
  });

  it("keeps sidebar integrations route active and labeled by the Work OS module", () => {
    const navigationCatalog = readSource("convex/navigation/catalog.ts");
    const routeCatalog = readSource("src/domains/navigation/route-catalog.ts");
    const searchConfig = readSource("src/components/layout/workspace-global-search/config/search-navigation.config.ts");

    expect(navigationCatalog).toContain('"admin.integrations"');
    expect(routeCatalog).toContain('path: "/web-apps"');
    expect(searchConfig).toContain('{ id: "integrations", label: labels.integrations, href: "/web-apps", icon: Plug }');
    expect(navigationCatalog).not.toContain('disabled: true, badge: "comingSoon"');
    expect(readSource("messages/en.json")).toContain('"integrations": "Integrations"');
    expect(readSource("messages/ar.json")).toContain('"integrations": "تطبيقات الويب"');
  });

  it("keeps literal integration screen message keys available in English and Arabic", () => {
    const componentsDir = resolve(root, "src/domains/integrations/components");
    const componentFiles = readdirSync(componentsDir).filter((file) => file.endsWith(".tsx"));
    const source = componentFiles
      .map((file) => readSource(`src/domains/integrations/components/${file}`))
      .join("\n");
    const enMessages = JSON.parse(readSource("messages/en.json")) as Record<string, unknown>;
    const arMessages = JSON.parse(readSource("messages/ar.json")) as Record<string, unknown>;
    const keys = Array.from(source.matchAll(/\bt(?:\.raw)?\('([^']+)'/g), (match) => match[1])
      .filter((key): key is string => Boolean(key))
      .filter((key) => !key.includes("${"));

    expect(keys.length).toBeGreaterThan(0);

    for (const key of new Set(keys)) {
      expect(getValueAtPath(enMessages, `Integrations.${key}`), key).not.toBeUndefined();
      expect(getValueAtPath(arMessages, `Integrations.${key}`), key).not.toBeUndefined();
    }
  });
});
