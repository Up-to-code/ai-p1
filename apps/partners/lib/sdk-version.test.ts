import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import authSdkPackage from "../../../packages/auth-sdk/package.json";
import {
  qentrahAuthSdkJsdelivrUrl,
  qentrahAuthSdkUnpkgUrl,
  qentrahAuthSdkVersion,
} from "./sdk-version";

const partnersRoot = new URL("..", import.meta.url);

function read(relativePath: string) {
  return readFileSync(new URL(relativePath, partnersRoot), "utf8");
}

const docsAndSnippets = [
  "content/docs/sdk-installation.mdx",
  "content/docs/quickstart.mdx",
  "content/docs/oauth-flow.mdx",
  "content/docs/developer-mode.mdx",
  "content/docs/ai-agent-implementation.mdx",
  "components/docs/AgentPromptCopyCard.tsx",
  "components/portal/AppDetailsTabs.tsx",
] as const;

describe("partner SDK documentation version", () => {
  it("uses the auth SDK package version as the single TypeScript source", () => {
    expect(qentrahAuthSdkVersion).toBe(authSdkPackage.version);
    expect(qentrahAuthSdkJsdelivrUrl).toBe(`https://cdn.jsdelivr.net/npm/@qentrah/auth-sdk@${authSdkPackage.version}/dist/qentrah-auth.js`);
    expect(qentrahAuthSdkUnpkgUrl).toBe(`https://unpkg.com/@qentrah/auth-sdk@${authSdkPackage.version}/dist/qentrah-auth.js`);
  });

  it("keeps public docs and portal snippets pinned to the current SDK version", () => {
    const versionPattern = /@qentrah\/auth-sdk@([0-9]+\.[0-9]+\.[0-9]+)/g;
    const oldClientPatterns = [
      /@qentrah\/sdk/u,
      /QentrahClient/u,
      /createOidcClient/u,
      /qentrahAuth\.GET/u,
      /qentrah\.mcp\.connect/u,
    ];

    for (const relativePath of docsAndSnippets) {
      const source = read(relativePath);
      const versions = [...source.matchAll(versionPattern)].map((match) => match[1]);
      for (const version of versions) {
        expect(version, `${relativePath} has stale @qentrah/auth-sdk pin`).toBe(authSdkPackage.version);
      }
      for (const pattern of oldClientPatterns) {
        expect(source, `${relativePath} still contains ${pattern}`).not.toMatch(pattern);
      }
    }
  });
});
