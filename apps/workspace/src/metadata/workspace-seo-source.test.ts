import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const appRoot = process.cwd();

describe("workspace SEO boundaries", () => {
  it("keeps the private workspace out of search indexing", () => {
    const metadata = readFileSync(
      resolve(appRoot, "src/metadata/workspace.ts"),
      "utf8",
    );
    const robots = readFileSync(resolve(appRoot, "src/app/robots.ts"), "utf8");

    expect(metadata.match(/index: false/g)).toHaveLength(4);
    expect(metadata.match(/follow: false/g)).toHaveLength(4);
    expect(robots).toContain('disallow: "/"');
    expect(existsSync(resolve(appRoot, "src/app/sitemap.ts"))).toBe(false);
  });
});
