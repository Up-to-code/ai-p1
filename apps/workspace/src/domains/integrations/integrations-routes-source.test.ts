import { readFileSync } from "node:fs";
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
  it("keeps web apps and legacy integrations routes unavailable while the surface is coming soon", () => {
    expect(readSource("src/app/[locale]/(app)/web-apps/page.tsx")).toContain('redirect(`/${locale}/dashboard`)');
    expect(readSource("src/app/[locale]/(app)/web-apps/[id]/page.tsx")).toContain('redirect(`/${locale}/dashboard`)');
    expect(readSource("src/app/[locale]/(app)/integrations/page.tsx")).toContain('redirect(`/${locale}/dashboard`)');
    expect(readSource("src/app/[locale]/(app)/integrations/[id]/page.tsx")).toContain('redirect(`/${locale}/dashboard`)');
  });

  it("keeps sidebar copy for web apps but marks the item as coming soon", () => {
    expect(readSource("src/components/layout/sidebar.tsx")).toContain('{ name: "integrations", href: "/web-apps", icon: Plug, disabled: true, badge: "comingSoon" }');
    expect(readSource("messages/en.json")).toContain('"integrations": "Web Apps"');
    expect(readSource("messages/ar.json")).toContain('"integrations": "تطبيقات الويب"');
    expect(readSource("messages/en.json")).toContain('"comingSoon": "Coming soon"');
    expect(readSource("messages/ar.json")).toContain('"comingSoon": "قريباً"');
  });

  it("keeps literal integration screen message keys available in English and Arabic", () => {
    const source = readSource("src/domains/integrations/components/integrations-screen.tsx");
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
