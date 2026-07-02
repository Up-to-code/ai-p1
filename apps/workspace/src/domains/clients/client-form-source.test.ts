import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("client form workspace source", () => {
  const formSource = readSource("src/domains/clients/components/client-form.tsx");
  const enMessages = readSource("messages/en.json");
  const arMessages = readSource("messages/ar.json");

  it("uses workspace-neutral placeholders instead of domain-specific examples", () => {
    expect(formSource).toContain('placeholder={t("form.namePlaceholder")}');
    expect(formSource).toContain('placeholder={t("form.emailPlaceholder")}');
    expect(formSource).toContain('placeholder={t("form.phonePlaceholder")}');
    expect(formSource).not.toContain('placeholder={t("form.actionPlaceholder")}');
    expect(formSource).not.toContain("Schedule viewing");
    expect(formSource).not.toContain("900K - 1.2M SAR");
    expect(formSource).not.toContain("priority asset, Cairo");
  });

  it("does not describe saved clients as mock Zustand records", () => {
    expect(enMessages).not.toContain("mock Zustand store");
    expect(arMessages).not.toContain("Zustand الوهمي");
    expect(enMessages).toContain("Create or update a workspace client record.");
  });
});
