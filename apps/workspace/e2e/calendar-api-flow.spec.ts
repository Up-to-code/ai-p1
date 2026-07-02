import { expect, test } from "@playwright/test";
import {
  createCalendarEvent,
  createClient,
  createClientTask,
  createProject,
  createAsset,
  prepareOwner,
  projectPayload,
  assetPayload,
  uniqueName,
} from "./helpers";

test.describe("calendar and API error flows", () => {
  test("creates, edits, verifies, and deletes a calendar event through the browser", async ({ page }) => {
    await prepareOwner(page, "calendar-flow");
    const eventTitle = uniqueName("E2E Visit");
    const updatedTitle = `${eventTitle} Updated`;

    await page.goto("/en/calendar");
    await expect(page.getByRole("heading", { name: "Calendar." })).toBeVisible();
    await page.getByRole("button", { name: "Add Event" }).click();

    const drawer = page.getByRole("dialog", { name: /Schedule Business/i });
    await expect(drawer).toBeVisible();
    await drawer.getByLabel("Event name (optional)").fill(eventTitle);
    await drawer.getByLabel("Date").fill("2026-05-15");
    await drawer.getByLabel("Time").fill("11:30");
    await drawer.getByRole("button", { name: "Create" }).click();
    await expect(drawer).toHaveCount(0);

    await page.reload();
    await expect(page.getByText(eventTitle)).toBeVisible();
    await page.getByText(eventTitle).click();
    await expect(page.getByRole("heading", { name: eventTitle })).toBeVisible();
    await page.getByRole("button", { name: "Edit" }).click();

    const editDrawer = page.getByRole("dialog", { name: /Edit Schedule/i });
    await expect(editDrawer).toBeVisible();
    await editDrawer.getByLabel("Event name (optional)").fill(updatedTitle);
    await editDrawer.getByRole("button", { name: "Save" }).click();
    await expect(editDrawer).toHaveCount(0);

    await page.reload();
    await expect(page.getByText(updatedTitle)).toBeVisible();
    await page.getByText(updatedTitle).click();
    await page.getByRole("button", { name: "Delete event?" }).click();
    await page.reload();
    await expect(page.getByText(updatedTitle)).toHaveCount(0);
  });

  test("covers authenticated invalid payloads, unauthenticated mutations, and not-found reads", async ({ page }) => {
    const { organizationId } = await prepareOwner(page, "api-negative");
    const projectName = uniqueName("API Project");
    const project = await createProject(page.request, organizationId, projectPayload(projectName));
    const assetName = uniqueName("API Asset");
    const asset = await createAsset(
      page.request,
      organizationId,
      { id: project.project.id, name: projectName },
      assetPayload({ id: project.project.id, name: projectName }, assetName),
    );
    const clientName = uniqueName("API Client");
    const client = await createClient(page.request, organizationId, {
      name: clientName,
      type: "Buyer",
      contact: "api.client@example.com",
      phone: "+20100000000",
      age: 34,
      nationality: "Egyptian",
      generation: "Millennial",
      budget: "150K - 300K EGP",
      assetInterest: "2BR apartment in Cairo",
      status: "active",
      visibility: "private",
      pipelineStage: "new",
      priority: "normal",
      nextAction: "Schedule viewing",
    });
    const task = await createClientTask(page.request, organizationId, client.client.id, uniqueName("API Task"));
    const event = await createCalendarEvent(page.request, organizationId, {
      title: uniqueName("API Event"),
      clientId: client.client.id,
      assetId: asset.asset.id,
      taskId: task.task.id,
    });

    const invalidProject = await page.request.post(`/api/v1/organizations/${organizationId}/projects`, {
      data: { name: "" },
      headers: { "content-type": "application/json" },
    });
    expect(invalidProject.status()).toBe(400);
    await expect(invalidProject.json()).resolves.toMatchObject({ error: "Invalid project payload." });

    const invalidClientLink = await page.request.post(`/api/v1/organizations/${organizationId}/clients/${client.client.id}/assets`, {
      data: { assetId: "", status: "not-a-status" },
      headers: { "content-type": "application/json" },
    });
    expect(invalidClientLink.status()).toBe(400);
    await expect(invalidClientLink.json()).resolves.toMatchObject({ error: "Invalid asset link payload." });

    const unauthenticatedDelete = await page.context().request.delete(
      `/api/v1/organizations/${organizationId}/calendar-events/${event.event.id}`,
      { headers: { cookie: "" } },
    );
    expect([401, 403]).toContain(unauthenticatedDelete.status());

    const deleteProject = await page.request.delete(`/api/v1/organizations/${organizationId}/projects/${project.project.id}`);
    expect(deleteProject.ok()).toBeTruthy();

    const deletedProjectRead = await page.request.get(`/api/v1/organizations/${organizationId}/read/projects/${project.project.id}`);
    expect(deletedProjectRead.ok()).toBeTruthy();
    await expect(deletedProjectRead.json()).resolves.toBeNull();
  });
});
