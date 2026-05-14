import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@qentrah/brand-identity": fileURLToPath(new URL("../brand-identity/src/index.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
  },
});
