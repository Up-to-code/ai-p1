import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function TypeScriptFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = resolve(directory, entry);
    return statSync(path).isDirectory()
      ? TypeScriptFiles(path)
      : path.endsWith(".ts")
        ? [path]
        : [];
  });
}

const agentRoot = resolve(__dirname, "..");
const files = TypeScriptFiles(agentRoot).filter(
  (file) => !file.endsWith("workspace-actor-wiring.test.ts"),
);

describe("Eve Workspace Actor wiring", () => {
  it("keeps raw session parsing local to the actor Module", () => {
    const offenders = files
      .filter((file) => !file.endsWith("workspace-actor.ts"))
      .filter((file) => readFileSync(file, "utf8").includes("session.auth.current"));

    expect(offenders).toEqual([]);
  });

  it("does not retain the weaker Organization and tenant helpers", () => {
    const source = files.map((file) => readFileSync(file, "utf8")).join("\n");
    expect(source).not.toContain("requireOrgId");
    expect(source).not.toContain("requireTenantCaller");
  });
});
