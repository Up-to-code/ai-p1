import path from "node:path";
import { defineConfig } from "vitest/config";
import { workspaceAliases } from "../../vitest.workspace-aliases.mjs";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts", "convex/**/*.test.ts"],
    env: {
      CONVEX_URL: "https://test.convex.cloud",
      NEXT_PUBLIC_CONVEX_URL: "https://test.convex.cloud",
      WORKOS_API_KEY: "sk_test_vitest",
      WORKOS_CLIENT_ID: "client_test_vitest",
      WORKOS_WEBHOOK_SECRET: "whsec_test_vitest",
    },
  },
  resolve: {
    alias: [
      ...workspaceAliases,
      { find: "@", replacement: path.resolve(__dirname, "src") },
      { find: "@convex", replacement: path.resolve(__dirname, "convex") },
    ],
  },
});
