import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@qentrah/auth-sdk/partner/harness": fileURLToPath(new URL("../../packages/auth-sdk/src/partner/harness/index.ts", import.meta.url)),
      "@qentrah/auth-sdk/partner/service-app": fileURLToPath(new URL("../../packages/auth-sdk/src/partner/service-app/index.ts", import.meta.url)),
      "@qentrah/auth-sdk/partner": fileURLToPath(new URL("../../packages/auth-sdk/src/partner/index.ts", import.meta.url)),
      "@qentrah/auth-sdk": fileURLToPath(new URL("../../packages/auth-sdk/src/index.ts", import.meta.url)),
      "@qentrah/brand-identity": fileURLToPath(new URL("../../packages/brand-identity/src/index.ts", import.meta.url)),
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "test/**/*.test.ts"],
  },
});
