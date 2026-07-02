import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("project workspace card source", () => {
  const source = readSource("src/domains/projects/components/projects-screens.tsx");
  const cardSource = source.slice(source.indexOf("function ProjectTile"), source.indexOf("function ProjectPortfolioStrip"));

  it("renders dense work card metadata instead of visual hierarchy", () => {
    expect(cardSource).toContain("ProjectCardFact");
    expect(cardSource).toContain('t("card.owner")');
    expect(cardSource).toContain('t("card.resources")');
    expect(cardSource).toContain('t("card.openTasks")');
    expect(cardSource).toContain('t("card.due")');
    expect(cardSource).toContain('t("card.progress")');
    expect(cardSource).not.toContain("project.priceRange");
    expect(cardSource).not.toContain("project.city");
  });

  it("uses a safe project type fallback instead of raw translation keys", () => {
    expect(source).toContain("function projectTypeLabel");
    expect(source).toContain('type === "undefined"');
    expect(cardSource).toContain("projectTypeLabel(t, project.type)");
    expect(source).toContain("projectTypeLabel(t, project.type)");
    expect(source).not.toContain("t(`types.${project.type}`)");
  });

  it("surfaces project-management detail signals and linked tasks", () => {
    expect(source).toContain("useTasksQuery(workspaceOrganizationId");
    expect(source).toContain("projectTasks.filter((task)");
    expect(source).toContain('task.status !== "done"');
    expect(source).toContain("openTaskCountByProjectId");
    expect(source).toContain("ProjectCardFact");
    expect(source).not.toContain("ProjectTaskRow");
    expect(source).not.toContain('td("narrative.title")');
  });
});
