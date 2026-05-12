import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ensurePartnerConvexEnv, loadLocalEnv, parseEnvFile } from "./load-local-env.mjs";

const touchedKeys = new Set();

function rememberEnv(key) {
  touchedKeys.add(key);
  return process.env[key];
}

afterEach(() => {
  for (const key of touchedKeys) {
    delete process.env[key];
  }
  touchedKeys.clear();
});

describe("partners local env loader", () => {
  it("parses common .env syntax without keeping inline comments", () => {
    expect(parseEnvFile(`
      # ignored
      CONVEX_SITE_URL=https://example.convex.site
      export NEXT_PUBLIC_CONVEX_URL="https://example.convex.cloud"
      PASSWORD='hash#fragment'
      COMMENTED=value # comment
    `)).toEqual({
      CONVEX_SITE_URL: "https://example.convex.site",
      NEXT_PUBLIC_CONVEX_URL: "https://example.convex.cloud",
      PASSWORD: "hash#fragment",
      COMMENTED: "value",
    });
  });

  it("loads later files over earlier files while preserving shell env", () => {
    const dir = mkdtempSync(join(tmpdir(), "anan-partners-env-"));
    const first = join(dir, ".env");
    const second = join(dir, ".env.local");
    writeFileSync(first, "CONVEX_SITE_URL=http://localhost:3211\nSHELL_VALUE=file\n");
    writeFileSync(second, "CONVEX_SITE_URL=https://remote.convex.site\n");

    const previousConvexSite = rememberEnv("CONVEX_SITE_URL");
    const previousShellValue = rememberEnv("SHELL_VALUE");
    delete process.env.CONVEX_SITE_URL;
    process.env.SHELL_VALUE = "from-shell";

    try {
      loadLocalEnv({ files: [first, second] });
      expect(process.env.CONVEX_SITE_URL).toBe("https://remote.convex.site");
      expect(process.env.SHELL_VALUE).toBe("from-shell");
    } finally {
      rmSync(dir, { recursive: true, force: true });
      if (previousConvexSite !== undefined) process.env.CONVEX_SITE_URL = previousConvexSite;
      if (previousShellValue !== undefined) process.env.SHELL_VALUE = previousShellValue;
    }
  });

  it("derives public Convex env values required by Next and convex/nextjs", () => {
    rememberEnv("CONVEX_URL");
    rememberEnv("CONVEX_SITE_URL");
    rememberEnv("NEXT_PUBLIC_CONVEX_URL");
    rememberEnv("NEXT_PUBLIC_CONVEX_SITE_URL");
    process.env.CONVEX_URL = "https://example.convex.cloud";
    process.env.CONVEX_SITE_URL = "https://example.convex.site";
    delete process.env.NEXT_PUBLIC_CONVEX_URL;
    delete process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

    ensurePartnerConvexEnv();

    expect(process.env.NEXT_PUBLIC_CONVEX_URL).toBe("https://example.convex.cloud");
    expect(process.env.NEXT_PUBLIC_CONVEX_SITE_URL).toBe("https://example.convex.site");
  });
});
