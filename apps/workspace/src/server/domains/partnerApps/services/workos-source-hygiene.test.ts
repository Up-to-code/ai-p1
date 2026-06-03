import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const workspaceRoot = process.cwd();

const activePartnerAuthFiles = [
  "package.json",
  "src/server/domains/partnerApps/services/access-token.ts",
  "src/server/domains/partnerApps/services/partner-apps.ts",
  "src/server/domains/partnerApps/services/partner-resource-access.ts",
  "src/server/domains/partnerApps/services/workos-partner-api-key-access.ts",
  "src/server/domains/partnerApps/handlers/partner-apps.ts",
  "src/server/domains/partnerApps/handlers/resources.ts",
  "src/server/domains/partnerApps/routing/router.ts",
  "src/domains/integrations/integrations-runtime.ts",
  "convex/partnerApps/apps.ts",
  "convex/workosPartnerApiKeys.ts",
  "convex/partnerResourceGateway.ts",
];

const forbiddenActiveRuntimeReferences = [
  "@better-auth/",
  "better-auth",
  "@/server/auth/better-auth",
  "verifyAccessToken",
  "/oauth/authorize",
  "/oauth/token",
  "/oauth/consent",
  "components.betterAuth",
];

describe("WorkOS partner auth source hygiene", () => {
  it("keeps active Workspace partner auth paths off Better Auth runtime", () => {
    for (const relativePath of activePartnerAuthFiles) {
      const source = readFileSync(join(workspaceRoot, relativePath), "utf8");

      for (const forbidden of forbiddenActiveRuntimeReferences) {
        expect(source, `${relativePath} must not contain ${forbidden}`).not.toContain(forbidden);
      }
    }
  });
});
