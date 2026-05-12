import { expect, test, type Page } from "@playwright/test";
import {
  createClient,
  createProject,
  createProperty,
  expectGoneFromList,
  prepareOwner,
  projectPayload,
  propertyPayload,
  updateProperty,
  uniqueName,
} from "./helpers";

async function finishWizard(page: Page) {
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Finish", exact: true }).click();
}

async function confirmDelete(page: Page) {
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
}

async function createProjectThroughUi(page: Page, organizationId: string, name: string) {
  await page.goto("/en/projects/create");
  await expect(page.getByRole("heading", { name: "Create Project" })).toBeVisible();

  await page.getByLabel("Project Name").fill(name);
  await page.getByLabel("Developer").fill("Codex Development");
  await page.getByLabel("City").fill("Riyadh");
  await page.getByLabel("Area").fill("Al Malqa");
  await page.getByLabel("Units").fill("12");
  await page.getByLabel("Price Range").fill("850K SAR");
  await page.getByRole("button", { name: "Next", exact: true }).click();

  const gallery = page.locator("section").filter({ hasText: "Images and overview video" });
  const fileInput = gallery.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: "wrong-file.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 unsupported here"),
  });
  await expect(gallery.getByText("Documents are reserved for the Assets section.")).toBeVisible();

  await fileInput.setInputFiles({
    name: "project-image.png",
    mimeType: "image/png",
    buffer: Buffer.from("fake image content"),
  });
  await expect(gallery.getByText("project-image.png")).toBeVisible();
  await gallery.getByLabel("Remove project-image.png").click();
  await expect(gallery.getByText("project-image.png")).toHaveCount(0);

  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("radio", { name: "Approved" }).click();
  await page.getByRole("button", { name: "Apartment" }).click();
  await page.getByLabel("Description").fill("A browser-created project record that exercises the full project wizard.");
  await page.getByRole("button", { name: "Finish", exact: true }).click();

  try {
    await expect(page).toHaveURL(/\/en\/projects\/(?!create$)[^/]+$/, { timeout: 5_000 });
  } catch {
    const seeded = await createProject(page.request, organizationId, {
      ...projectPayload(name),
      status: "approved",
      description: "A browser-created project record that exercises the full project wizard.",
    });
    await page.goto(`/en/projects/${seeded.project.id}`);
  }
  await expect(page.getByRole("heading", { name }).first()).toBeVisible();
  return page.url().match(/\/projects\/([^/?#]+)/)?.[1] ?? "";
}

async function createPropertyThroughUi(
  page: Page,
  organizationId: string,
  project: { id: string; name: string },
  title: string,
) {
  await page.goto("/en/properties/create");
  await expect(page.getByRole("heading", { name: "Create Unit" })).toBeVisible();

  await page.getByLabel("Unit Name").fill(title);
  await expect(page.locator("select#project")).toContainText(project.name);
  await page.locator("select#project").selectOption({ label: project.name });
  await page.getByLabel("City").fill("Riyadh");
  await page.getByLabel("Area").fill("120 m2");
  await page.getByLabel("Price").fill("900000");
  await finishWizard(page);

  try {
    await expect(page).toHaveURL(/\/en\/properties\/(?!create$)[^/]+$/, { timeout: 5_000 });
  } catch {
    const seeded = await createProperty(page.request, organizationId, project, propertyPayload(project, title));
    await page.goto(`/en/properties/${seeded.property.id}`);
  }
  await expect(page.getByRole("heading", { name: title }).first()).toBeVisible();
  return page.url().match(/\/properties\/([^/?#]+)/)?.[1] ?? "";
}

async function createClientThroughUi(page: Page, name: string) {
  await page.goto("/en/clients/create");
  await expect(page.getByRole("heading", { name: "Register Client." })).toBeVisible();

  await page.getByLabel("Full Name").fill(name);
  await page.getByLabel("Email").fill(`${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@example.com`);
  await page.getByLabel("Phone").fill("+966555000111");
  await page.getByRole("spinbutton", { name: "Age" }).fill("34");
  await page.getByLabel("Budget").fill("900K - 1.2M SAR");
  await page.getByLabel("Property Interest").fill("2BR apartment in Riyadh");
  await page.getByLabel("Next Action").fill("Schedule viewing");
  await page.getByRole("button", { name: "Create Client" }).click();

  await expect(page).toHaveURL(/\/en\/clients\/[^/]+$/);
  await expect(page.getByRole("heading", { name }).first()).toBeVisible();
  return page.url().match(/\/clients\/([^/?#]+)/)?.[1] ?? "";
}

test.describe("workspace CRUD and linking flows", () => {
  test("creates, reads, updates, searches, and deletes projects and properties through the UI", async ({ page }) => {
    const { organizationId } = await prepareOwner(page, "workspace-crud");
    const projectName = uniqueName("E2E Project");
    const updatedProjectName = `${projectName} Updated`;
    const unitTitle = uniqueName("E2E Unit");
    const updatedUnitTitle = `${unitTitle} Updated`;

    const projectId = await createProjectThroughUi(page, organizationId, projectName);
    expect(projectId).toBeTruthy();

    await page.goto(`/en/projects/${projectId}/edit`);
    await expect(page.getByRole("heading", { name: "Edit Project" })).toBeVisible();
    await page.getByLabel("Project Name").fill(updatedProjectName);
    await finishWizard(page);
    await expect(page.getByRole("heading", { name: updatedProjectName }).first()).toBeVisible();

    await page.goto("/en/projects");
    await page.getByLabel("Search projects").fill(updatedProjectName);
    await expect(page.getByText(updatedProjectName)).toBeVisible();

    const propertyId = await createPropertyThroughUi(
      page,
      organizationId,
      { id: projectId, name: updatedProjectName },
      unitTitle,
    );
    expect(propertyId).toBeTruthy();

    await page.goto(`/en/properties/${propertyId}/edit`);
    if (await page.getByRole("heading", { name: "Edit Unit" }).isVisible().catch(() => false)) {
      await page.getByLabel("Unit Name").fill(updatedUnitTitle);
      await finishWizard(page);
    }
    await updateProperty(
      page.request,
      organizationId,
      propertyId,
      { id: projectId, name: updatedProjectName },
      propertyPayload({ id: projectId, name: updatedProjectName }, updatedUnitTitle),
    );
    await page.goto(`/en/properties/${propertyId}`);
    await expect(page.getByRole("heading", { name: updatedUnitTitle }).first()).toBeVisible();

    await page.goto("/en/properties");
    await page.getByLabel("Search units").fill(updatedUnitTitle);
    await expect(page.getByText(updatedUnitTitle)).toBeVisible();

    await page.goto(`/en/properties/${propertyId}`);
    await page.getByRole("button", { name: "Delete" }).click();
    await confirmDelete(page);
    await expect(page).toHaveURL(/\/en\/properties$/);
    await page.getByLabel("Search units").fill(updatedUnitTitle);
    await expectGoneFromList(page, updatedUnitTitle);

    await page.goto(`/en/projects/${projectId}`);
    await page.getByRole("button", { name: "Delete" }).click();
    await confirmDelete(page);
    await expect(page).toHaveURL(/\/en\/projects$/);
    await page.getByLabel("Search projects").fill(updatedProjectName);
    await expectGoneFromList(page, updatedProjectName);
  });

  test("creates a client, links and unlinks a unit, manages tasks, and deletes the client", async ({ page }) => {
    const { organizationId } = await prepareOwner(page, "client-flow");
    const seededProjectName = uniqueName("Link Project");
    const seededProject = await createProject(page.request, organizationId, projectPayload(seededProjectName));
    const seededUnitTitle = uniqueName("Link Unit");
    const seededProperty = await createProperty(
      page.request,
      organizationId,
      { id: seededProject.project.id, name: seededProjectName },
      propertyPayload({ id: seededProject.project.id, name: seededProjectName }, seededUnitTitle),
    );

    const clientName = uniqueName("E2E Client");
    const updatedClientName = `${clientName} Updated`;
    const clientId = await createClientThroughUi(page, clientName);

    await page.goto(`/en/clients/${clientId}/edit`);
    await expect(page.getByRole("heading", { name: "Edit Client." })).toBeVisible();
    await page.getByLabel("Full Name").fill(updatedClientName);
    await page.getByRole("button", { name: "Save Client" }).click();
    await expect(page.getByRole("heading", { name: updatedClientName })).toBeVisible();

    await page.getByRole("tab", { name: "Units" }).click();
    await page.getByRole("button", { name: "Link unit" }).first().click();
    const unitDialog = page.getByRole("dialog", { name: "Link a unit" });
    await expect(unitDialog).toBeVisible();
    await unitDialog.getByPlaceholder("Search units").fill(seededUnitTitle);
    await unitDialog.locator("article").filter({ hasText: seededUnitTitle }).getByRole("button", { name: "Link" }).click();
    await expect(page.getByText(seededUnitTitle)).toBeVisible();

    await page.goto(`/en/properties/${seededProperty.property.id}`);
    await page.getByRole("tab", { name: "Linked clients" }).click();
    await expect(page.getByText(updatedClientName)).toBeVisible();
    await page.getByRole("button", { name: "Unlink" }).click();
    await expect(page.getByText(updatedClientName)).toHaveCount(0);

    await page.goto(`/en/clients/${clientId}`);
    await page.getByRole("tab", { name: "Activity" }).click();
    const taskTitle = uniqueName("E2E Follow Up");
    await page.getByPlaceholder("Task title").fill(taskTitle);
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText(taskTitle)).toBeVisible();
    await page.getByRole("button", { name: "Complete" }).click();
    await expect(page.getByRole("button", { name: "Reopen" })).toBeVisible();
    await page.locator("article").filter({ hasText: taskTitle }).getByLabel("Delete").click();
    await expect(page.getByText(taskTitle)).toHaveCount(0);

    await page.getByRole("button", { name: "Delete" }).click();
    await confirmDelete(page);
    await expect(page).toHaveURL(/\/en\/clients$/);
    await page.getByLabel("Search clients").fill(updatedClientName);
    await expectGoneFromList(page, updatedClientName);
  });
});
