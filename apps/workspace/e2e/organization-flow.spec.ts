import { expect, test, type APIRequestContext, type Browser, type Page } from "@playwright/test";

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

async function createInviteLink(request: APIRequestContext, organizationId: string) {
  const payload = await authPost<{ inviteUrl: string; inviteLink: { organizationId: string; status: string } }>(
    request,
    `/api/v1/organizations/${organizationId}/invite-links`,
    { role: "member", locale: "en" },
  );
  expect(payload.inviteUrl).toContain("inviteToken=");
  expect(payload.inviteLink.organizationId).toBe(organizationId);
  expect(payload.inviteLink.status).toBe("pending");
  return payload.inviteUrl;
}

function inviteTokenFromUrl(inviteUrl: string) {
  const parsed = new URL(inviteUrl);
  const token = parsed.searchParams.get("inviteToken");
  expect(token).toBeTruthy();
  return token as string;
}

async function prepareOwner(page: Page) {
  const email = uniqueEmail("owner");
  await signUp(page.request, email);
  const organizationId = await createOrganization(page.request, `E2E Org ${Date.now()}`);
  return { email, organizationId };
}

async function prepareRecipient(browser: Browser) {
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  const email = uniqueEmail("recipient");
  await signUp(page.request, email);
  const requestState = await page.request.storageState();
  await page.context().addCookies(requestState.cookies);
  return { context, page, email };
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

  test("recipient accepts generated invite link and lands in the joined workspace", async ({ browser, page }) => {
    const { organizationId } = await prepareOwner(page);
    const inviteUrl = await createInviteLink(page.request, organizationId);
    const recipient = await prepareRecipient(browser);

    await recipient.page.goto(inviteUrl);
    await expect(recipient.page.getByText("Invite accepted")).toBeVisible();
    await expect(recipient.page).toHaveURL(/\/en\/dashboard/, { timeout: 10_000 });
    await expect(recipient.page.getByText("Choose how to continue")).toHaveCount(0);

    const dashboardResponse = await recipient.page.request.get(
      `/api/v1/organizations/${organizationId}/read/dashboard`,
    );
    expect(dashboardResponse.ok()).toBeTruthy();

    await recipient.context.close();
  });

  test("signed-out invitee is asked to sign in and keeps the invite callback", async ({ browser, page }) => {
    const { organizationId } = await prepareOwner(page);
    const inviteUrl = await createInviteLink(page.request, organizationId);
    const signedOut = await browser.newContext({ baseURL });
    const signedOutPage = await signedOut.newPage();
    const inviteToken = inviteTokenFromUrl(inviteUrl);

    await signedOutPage.goto(inviteUrl);
    await expect(signedOutPage.getByText("Sign in to continue")).toBeVisible();
    await signedOutPage.getByRole("button", { name: /sign in/i }).click();
    await expect(signedOutPage).toHaveURL((url) => {
      return (
        url.pathname === "/en/sign-in" &&
        url.searchParams.get("callbackURL") === `/en/accept-invite?inviteToken=${inviteToken}`
      );
    });
    const callbackURL = new URL(signedOutPage.url()).searchParams.get("callbackURL");
    expect(callbackURL).toBe(`/en/accept-invite?inviteToken=${inviteToken}`);

    await signUp(signedOutPage.request, uniqueEmail("signedout-recipient"));
    const requestState = await signedOutPage.request.storageState();
    await signedOutPage.context().addCookies(requestState.cookies);
    await signedOutPage.goto(callbackURL!);
    await expect(signedOutPage.getByText("Invite accepted")).toBeVisible();
    await expect(signedOutPage).toHaveURL(/\/en\/dashboard/, { timeout: 10_000 });

    await signedOut.close();
  });

  test("existing member can open invite link without getting stuck on an error", async ({ page }) => {
    const { organizationId } = await prepareOwner(page);
    const inviteUrl = await createInviteLink(page.request, organizationId);

    await page.goto(inviteUrl);
    await expect(page.getByText("Invite accepted")).toBeVisible();
    await expect(page).toHaveURL(/\/en\/dashboard/, { timeout: 10_000 });

    const dashboardResponse = await page.request.get(
      `/api/v1/organizations/${organizationId}/read/dashboard`,
    );
    expect(dashboardResponse.ok()).toBeTruthy();
  });

  test("invite link cannot be reused by another new member after acceptance", async ({ browser, page }) => {
    const { organizationId } = await prepareOwner(page);
    const inviteUrl = await createInviteLink(page.request, organizationId);
    const firstRecipient = await prepareRecipient(browser);

    await firstRecipient.page.goto(inviteUrl);
    await expect(firstRecipient.page.getByText("Invite accepted")).toBeVisible();
    await expect(firstRecipient.page).toHaveURL(/\/en\/dashboard/, { timeout: 10_000 });
    await firstRecipient.context.close();

    const secondRecipient = await prepareRecipient(browser);
    await secondRecipient.page.goto(inviteUrl);
    await expect(secondRecipient.page.getByText("Invite failed")).toBeVisible();
    await expect(secondRecipient.page.getByText("Invite link is no longer active.")).toBeVisible();
    await expect(secondRecipient.page).toHaveURL(/\/en\/accept-invite\?inviteToken=/);
    await secondRecipient.context.close();
  });

  test("Arabic and dark mode render organization settings without missing copy", async ({ page }) => {
    await prepareOwner(page);
    await page.goto("/ar/settings/organization");
    await expect(page.getByText("صلاحياتك الحالية")).toBeVisible();
    await expect(page.getByText(/MISSING_MESSAGE/)).toHaveCount(0);

    await page.evaluate(() => localStorage.setItem("qentrah-theme", "dark"));
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(page.getByText("صلاحياتك الحالية")).toBeVisible();

    await page.getByRole("button", { name: "روابط الوكلاء" }).click();
    await page.getByRole("button", { name: "رابط وكيل جديد" }).click();
    const agentDialog = page.getByRole("dialog", { name: "رابط وكيل جديد" });
    await expect(agentDialog).toBeVisible();
    await expect(agentDialog.getByLabel("الاسم")).toHaveValue("مشغل العملاء");
    await expect(agentDialog.getByText("ماذا يجب أن يعرف هذا الوكيل؟")).toBeVisible();
    for (const englishText of ["New agent link", "Client operator", "Apartments", "Make agent link", "What should this agent know"]) {
      await expect(agentDialog.getByText(englishText, { exact: false })).toHaveCount(0);
    }
  });
});
