import { expect, test, type Page } from "@playwright/test";
import {
  createCalendarEvent,
  createClient,
  createClientTask,
  createProject,
  createProperty,
  prepareOwner,
  projectPayload,
  propertyPayload,
  uniqueName,
} from "./helpers";

async function expectWorkspaceRouteReady(page: Page, path: string) {
  await page.goto(path);
  await expect(page).toHaveURL(new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  await expect(page.getByText("Sign in to continue")).toHaveCount(0);
  await expect(page.getByText("Choose how to continue")).toHaveCount(0);
  await expect(page.getByText(/MISSING_MESSAGE/)).toHaveCount(0);
}

test.describe("workspace all-flow smoke coverage", () => {
  test("opens every primary workspace flow for a ready organization", async ({ page }) => {
    const { organizationId } = await prepareOwner(page, "all-flows");
    const projectName = uniqueName("All Flows Project");
    const project = await createProject(page.request, organizationId, projectPayload(projectName));
    const unitTitle = uniqueName("All Flows Unit");
    const property = await createProperty(
      page.request,
      organizationId,
      { id: project.project.id, name: projectName },
      propertyPayload({ id: project.project.id, name: projectName }, unitTitle),
    );
    const clientName = uniqueName("All Flows Client");
    const client = await createClient(page.request, organizationId, {
      name: clientName,
      type: "Buyer",
      contact: `${clientName.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@example.com`,
      phone: "+966555000111",
      age: 34,
      nationality: "Saudi",
      generation: "Millennial",
      budget: "900K - 1.2M SAR",
      propertyInterest: "2BR apartment in Riyadh",
      status: "active",
      visibility: "private",
      pipelineStage: "new",
      priority: "normal",
      nextAction: "Schedule viewing",
    });
    const task = await createClientTask(page.request, organizationId, client.client.id, uniqueName("All Flows Task"));
    const event = await createCalendarEvent(page.request, organizationId, {
      title: uniqueName("All Flows Event"),
      clientId: client.client.id,
      unitId: property.property.id,
      taskId: task.task.id,
    });

    for (const path of [
      "/en/dashboard",
      "/en/projects",
      `/en/projects/${project.project.id}`,
      "/en/properties",
      `/en/properties/${property.property.id}`,
      "/en/clients",
      `/en/clients/${client.client.id}`,
      "/en/calendar",
      "/en/activity",
      "/en/integrations",
      "/en/settings/organization",
    ]) {
      await expectWorkspaceRouteReady(page, path);
    }

    await page.goto("/en/projects");
    await expect(page.getByText(projectName)).toBeVisible();
    await page.goto("/en/properties");
    await expect(page.getByText(unitTitle)).toBeVisible();
    await page.goto("/en/clients");
    await expect(page.getByText(clientName)).toBeVisible();
    await page.goto("/en/calendar");
    await expect(page.getByText(event.event.id).or(page.getByText(/All Flows Event/))).toBeVisible();
  });
});
