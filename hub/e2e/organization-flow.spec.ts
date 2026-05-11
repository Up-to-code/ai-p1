import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;

function uniqueEmail(prefix: string) {
  return `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`;
}

async function authPost<T>(request: APIRequestContext, path: string, data: unknown) {
  const response = await request.post(path, {
    data,
    headers: { origin: baseURL },
  });
  const payload = await response.json().catch(() => ({})) as T & { error?: { message?: string }; message?: string };
  expect(response.ok(), payload.error?.message ?? payload.message).toBeTruthy();
  return payload;
}

async function signUp(request: APIRequestContext, email: string) {
  await authPost(request, "/api/auth/sign-up/email", {
    email,
    password: "Password12345!",
    name: email.split("@")[0],
  });
}

async function createOrganization(request: APIRequestContext, name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const payload = await authPost<{ id?: string; data?: { id?: string } }>(request, "/api/auth/organization/create", {
    name,
    slug,
    metadata: { type: "developer", status: "Workspace ready" },
  });
  const organizationId = payload.id ?? payload.data?.id;
  expect(organizationId).toBeTruthy();
  await authPost(request, "/api/auth/organization/set-active", { organizationId });
  return organizationId as string;
}

async function prepareOwner(page: Page) {
  const email = uniqueEmail("owner");
  await signUp(page.request, email);
  const organizationId = await createOrganization(page.request, `E2E Org ${Date.now()}`);
  return { email, organizationId };
}

test.describe("organization business flow", () => {
  test("owner manages organization, invite links, and custom work roles", async ({ page }) => {
    const { organizationId } = await prepareOwner(page);

    await page.goto("/en/settings/organization");
    await expect(page.getByRole("heading", { name: /E2E Org/i })).toBeVisible();
    await expect(page.getByText("Your access")).toBeVisible();

    await page.getByLabel("Display Name").fill(`Updated Org ${Date.now()}`);
    await page.getByRole("button", { name: /save/i }).click();
    await expect(page.getByText("Organization profile changes were saved.")).toBeVisible();

    await page.getByRole("button", { name: /agent links/i }).click();
    await expect(page.getByRole("heading", { name: /agent links/i })).toBeVisible();
    await page.getByRole("button", { name: /new agent link/i }).click();
    const agentDialog = page.getByRole("dialog", { name: /new agent link/i });
    await expect(agentDialog).toBeVisible();
    await expect(agentDialog.getByLabel("Name")).toHaveValue("Client operator");
    await expect(agentDialog.getByText("Apartments", { exact: true })).toBeVisible();
    await expect(agentDialog.getByText("What should this agent know?")).toBeVisible();
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: /members/i }).click();
    await page.getByRole("button", { name: /^Invite$/i }).click();
    await expect(page.getByRole("dialog", { name: /create invite/i })).toBeVisible();
    await page.getByRole("button", { name: /generate link/i }).click();
    const inviteInput = page.getByLabel("Generated invite link");
    await expect(inviteInput).toBeVisible();
    const inviteUrl = await inviteInput.inputValue();
    expect(inviteUrl).toContain("inviteToken=");
    await page.getByRole("button", { name: "Close" }).first().click();

    await page.getByRole("link", { name: /custom work roles/i }).click();
    await expect(page).toHaveURL(/\/en\/settings\/organization\/custom-permissions/);
    await page.getByLabel("Start from").selectOption("viewer");
    await page.getByLabel("Work role name").fill(`e2e-role-${Date.now()}`);
    await page.getByRole("button", { name: /create work role/i }).click();
    await expect(page.getByText("Action failed")).not.toBeVisible();
    await expect(page.getByText("The work role was saved.")).toBeVisible();

    const unauthenticated = await page.context().request.patch(
      `/api/v1/organizations/${organizationId}/identity`,
      {
        data: { name: "Should fail" },
        headers: { cookie: "" },
      },
    );
    expect([401, 403]).toContain(unauthenticated.status());
  });

  test("Arabic and dark mode render organization settings without missing copy", async ({ page }) => {
    await prepareOwner(page);
    await page.goto("/ar/settings/organization");
    await expect(page.getByText("صلاحياتك الحالية")).toBeVisible();
    await expect(page.getByText(/MISSING_MESSAGE/)).toHaveCount(0);

    await page.evaluate(() => localStorage.setItem("anan-theme", "dark"));
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(page.getByText("صلاحياتك الحالية")).toBeVisible();

    await page.getByRole("button", { name: "روابط الوكلاء" }).click();
    await page.getByRole("button", { name: "رابط وكيل جديد" }).click();
    const agentDialog = page.getByRole("dialog", { name: "رابط وكيل جديد" });
    await expect(agentDialog).toBeVisible();
    await expect(agentDialog.getByLabel("الاسم")).toHaveValue("مشغل العملاء");
    await expect(agentDialog.getByText("العقارات", { exact: true })).toBeVisible();
    await expect(agentDialog.getByText("ماذا يجب أن يعرف هذا الوكيل؟")).toBeVisible();
    for (const englishText of ["New agent link", "Client operator", "Apartments", "Make agent link", "What should this agent know"]) {
      await expect(agentDialog.getByText(englishText, { exact: false })).toHaveCount(0);
    }
  });
});
