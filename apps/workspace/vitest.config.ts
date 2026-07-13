import path from "node:path";
import { defineConfig } from "vitest/config";
import { workspaceAliases } from "../../vitest.workspace-aliases.mjs";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}", "convex/**/*.test.ts", "agent/**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [
      ...workspaceAliases,
      { find: "@", replacement: path.resolve(__dirname, "src") },
      { find: "@convex", replacement: path.resolve(__dirname, "convex") },
    ],
  },
});
