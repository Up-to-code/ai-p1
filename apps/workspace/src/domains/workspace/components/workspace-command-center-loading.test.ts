import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  fileURLToPath(new URL("./workspace-command-center.tsx", import.meta.url)),
  "utf8",
);

describe("Workspace command-center loading", () => {
  it("uses the shared background loader while Workspace authentication is pending", () => {
    expect(source).toContain('from "@/components/shared/loading/ViewLoading"');
    expect(source).toContain('session.workspace.status === "loadingSession"');
    expect(source).toContain('session.workspace.status === "convexAuthLoading"');
    expect(source).toContain("<PageLoading showLogo={false} showMessage={false} />");
  });

  it("retains generic recovery UI for non-ready states after authentication", () => {
    expect(source).toContain("<WorkspaceQueryState");
  });
});
