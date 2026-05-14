import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      "@qentrah/brand-identity": fileURLToPath(new URL("../../packages/brand-identity/src/index.ts", import.meta.url)),
      "@qentrah/platform-core/classnames": fileURLToPath(new URL("../../packages/platform-core/src/classnames.ts", import.meta.url)),
      "@qentrah/platform-core/errors": fileURLToPath(new URL("../../packages/platform-core/src/errors.ts", import.meta.url)),
      "@qentrah/platform-core": fileURLToPath(new URL("../../packages/platform-core/src/index.ts", import.meta.url)),
      "@qentrah/ui/button": fileURLToPath(new URL("../../packages/ui/src/components/ui/button.tsx", import.meta.url)),
      "@qentrah/web-foundation/api": fileURLToPath(new URL("../../packages/web-foundation/src/api.ts", import.meta.url)),
      "@qentrah/web-foundation/fonts": fileURLToPath(new URL("../../packages/web-foundation/src/fonts.ts", import.meta.url)),
    },
  },
  test: {
    include: ["scripts/*.test.mjs", "app/**/*.test.ts", "examples/**/*.test.ts", "lib/**/*.test.ts", "server/**/*.test.ts", "utilities/**/*.test.ts", "validation/**/*.test.ts"],
    environment: "node",
  },
});
