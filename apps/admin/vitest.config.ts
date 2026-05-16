import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { workspaceAliases } from "../../vitest.workspace-aliases.mjs";

export default defineConfig({
  resolve: {
    alias: [
      ...workspaceAliases,
      { find: "@", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
    ],
  },
  test: {
    include: ["src/lib/**/*.test.ts", "src/app/**/*.test.ts"],
    environment: "node"
  }
});
