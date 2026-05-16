import path from "node:path";
import { defineConfig } from "vitest/config";
import { workspaceAliases } from "../../vitest.workspace-aliases.mjs";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts", "convex/**/*.test.ts"],
  },
  resolve: {
    alias: [
      ...workspaceAliases,
      { find: "@", replacement: path.resolve(__dirname, "src") },
      { find: "@convex", replacement: path.resolve(__dirname, "convex") },
    ],
  },
});
