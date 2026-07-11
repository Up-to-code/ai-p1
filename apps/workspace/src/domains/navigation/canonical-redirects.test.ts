import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildCanonicalRedirectPath } from "./canonical-redirect";

const aliasPages = [
  ["opportunities/page.tsx", "/deals"],
  ["ws/inbox/page.tsx", "/inbox"],
  ["ws/channels/page.tsx", "/channels"],
  ["inbox/channels/page.tsx", "/channels"],
  ["organization/channels/page.tsx", "/channels"],
  ["ws/spaces/page.tsx", "/spaces"],
  ["inbox/spaces/page.tsx", "/spaces"],
  ["organization/spaces/page.tsx", "/spaces"],
] as const;

function readAliasPage(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), "src/app/[locale]/(app)", relativePath), "utf8");
}

const staleState = {
  project: "project-1",
  space: "space-1",
  mode: "list",
  threadId: "thread-1",
};

describe("canonical workspace alias redirects", () => {
  it("has a concrete canonical Channels page for every alias destination", () => {
    const source = readAliasPage("channels/page.tsx");

    expect(source).toContain("InboxWorkspaceShell");
    expect(source).toContain("InboxChannelScreen");
    expect(source).not.toContain("redirect(");
  });

  it.each(aliasPages)("redirects %s to the intended canonical route", (pagePath, destination) => {
    const source = readAliasPage(pagePath);

    expect(source).toContain('from "@/domains/navigation/canonical-redirect"');
    expect(source).toContain(`buildCanonicalRedirectPath(locale, "${destination}", await searchParams)`);
    expect(source).not.toMatch(/export\s+(?:async\s+)?(?:function|const|let|var|class|type|interface)\s+(?!default)/u);
  });

  it("localizes inbox and spaces and drops unsupported state", () => {
    expect(buildCanonicalRedirectPath("ar", "/inbox", staleState)).toBe("/ar/inbox");
    expect(buildCanonicalRedirectPath("en", "/spaces", staleState)).toBe("/en/spaces");
  });

  it("keeps only project and space for channels", () => {
    expect(buildCanonicalRedirectPath("ar", "/channels", staleState)).toBe(
      "/ar/channels?project=project-1&space=space-1",
    );
  });

  it("preserves supported Deal filters for the legacy Opportunities redirect", () => {
    expect(buildCanonicalRedirectPath("en", "/deals", {
      filter: "won",
      sort: "value",
      project: "stale-project",
    })).toBe("/en/deals?filter=won&sort=value");
  });
});
