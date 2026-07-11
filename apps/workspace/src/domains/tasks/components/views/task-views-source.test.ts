import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const boardSource = readFileSync(fileURLToPath(new URL("./task-board-view.tsx", import.meta.url)), "utf8");
const listSource = readFileSync(fileURLToPath(new URL("./task-list-view.tsx", import.meta.url)), "utf8");

describe("task view design-system seams", () => {
  it("keeps board drag/drop while using shared shadcn primitives and theme tokens", () => {
    expect(boardSource).toContain('from "@/components/ui/badge"');
    expect(boardSource).toContain('from "@/components/ui/button"');
    expect(boardSource).toContain('from "@/components/ui/card"');
    expect(boardSource).toContain("draggable");
    expect(boardSource).toContain("onDrop");
    expect(boardSource).not.toContain("bg-[#171717]");
    expect(boardSource).not.toContain("bg-[#151617]");
  });

  it("exposes safe card actions for claim, assignment, status, and delete", () => {
    expect(boardSource).toContain("Actions for ${task.title}");
    expect(boardSource).toContain("Claim task");
    expect(boardSource).toContain("Assign to");
    expect(boardSource).toContain("Delete task");
    expect(boardSource).toContain("AlertDialog");
    expect(boardSource).toContain('status: statusOption.key');
  });

  it("uses the shared table primitives for grouped list rows", () => {
    expect(listSource).toContain('from "@/components/ui/table"');
    expect(listSource).toContain("<TableHeader>");
    expect(listSource).toContain("<TableBody>");
    expect(listSource).toContain("<TableRow");
  });
});
