import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ensurePartnerDatabaseEnv, loadLocalEnv, parseEnvFile } from "./load-local-env.mjs";

const touchedKeys = new Set();

function rememberEnv(key) {
  touchedKeys.add(key);
  return process.env[key];
}

afterEach(() => {
  for (const key of touchedKeys) delete process.env[key];
  touchedKeys.clear();
});

describe("partners local env loader", () => {
  it("parses common .env syntax without keeping inline comments", () => {
    expect(parseEnvFile(`
      # ignored
      DATABASE_URL=postgresql://postgres:postgres@localhost:5432/partners
      export SITE_URL="http://localhost:3002"
      PASSWORD='hash#fragment'
      COMMENTED=value # comment
    `)).toEqual({
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/partners",
      SITE_URL: "http://localhost:3002",
      PASSWORD: "hash#fragment",
      COMMENTED: "value",
    });
  });

  it("loads later files over earlier files while preserving shell env", () => {
    const dir = mkdtempSync(join(tmpdir(), "anan-partners-env-"));
    const first = join(dir, ".env");
    const second = join(dir, ".env.local");
    writeFileSync(first, "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/first\nSHELL_VALUE=file\n");
    writeFileSync(second, "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/second\n");

    const previousDatabaseUrl = rememberEnv("DATABASE_URL");
    const previousShellValue = rememberEnv("SHELL_VALUE");
    delete process.env.DATABASE_URL;
    process.env.SHELL_VALUE = "from-shell";

    try {
      loadLocalEnv({ files: [first, second] });
      expect(process.env.DATABASE_URL).toBe("postgresql://postgres:postgres@localhost:5432/second");
      expect(process.env.SHELL_VALUE).toBe("from-shell");
    } finally {
      rmSync(dir, { recursive: true, force: true });
      if (previousDatabaseUrl !== undefined) process.env.DATABASE_URL = previousDatabaseUrl;
      if (previousShellValue !== undefined) process.env.SHELL_VALUE = previousShellValue;
    }
  });

  it("provides a local DATABASE_URL fallback for Next and Prisma tooling", () => {
    rememberEnv("DATABASE_URL");
    delete process.env.DATABASE_URL;

    ensurePartnerDatabaseEnv();

    expect(process.env.DATABASE_URL).toBe("postgresql://postgres:postgres@localhost:5432/anan_partners");
  });
});
