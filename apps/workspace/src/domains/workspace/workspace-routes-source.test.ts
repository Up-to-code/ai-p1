import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  fileURLToPath(
    new URL("../../app/[locale]/(app)/ws/table/page.tsx", import.meta.url),
  ),
  "utf8",
);

describe("workspace route aliases", () => {
  it("redirects the obsolete table route to the canonical workspace home", () => {
    expect(source).toContain('redirect(`/${locale}/ws`)');
    expect(source).not.toContain("WorkspaceHomeScreen");
  });
});
