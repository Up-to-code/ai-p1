import { expect, test } from "@playwright/test";
import axe from "axe-core";

test("create app flow keeps fields, mode controls, and validation accessible", async ({ context, page }) => {
  const runId = Date.now();
  const email = `partners-e2e-${runId}@example.com`;
  const password = `PartnersE2E-${runId}!`;

  const signup = await context.request.post("/api/partner-signup", {
    data: {
      name: "Partners E2E",
      email,
      password,
      confirmPassword: password,
      organizationName: `Partners E2E ${runId}`,
      countryCode: "SA",
    },
  });
  expect(signup.ok()).toBeTruthy();

  const organization = await context.request.post("/api/partner-organization", {
    data: {
      name: `Partners E2E ${runId}`,
      countryCode: "SA",
    },
  });
  expect(organization.ok()).toBeTruthy();

  await page.goto("/dashboard/apps/new");
  await expect(page.getByRole("heading", { name: "Create integration app" })).toBeVisible();

  await page.addScriptTag({ content: axe.source });
  const accessibilityResults = await page.evaluate(async () => {
    return await (window as typeof window & { axe: typeof axe }).axe.run(document.querySelector("main") ?? document.body, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });
  });
  expect(accessibilityResults.violations).toEqual([]);

  await page.getByRole("button", { name: /Integrate & debug/u }).click();
  await expect(page.getByRole("heading", { name: "OAuth path" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Integrate", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Debug", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sandbox", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Workspace", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Production", exact: true })).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();

  await page.getByRole("button", { name: "Debug", exact: true }).click();
  await expect(page.getByText("Debug callbacks: Use this while checking redirect URIs")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByRole("heading", { name: "OAuth path" })).toBeVisible();

  await page.getByRole("button", { name: /App profile/u }).click();
  await page.getByLabel("App name").fill(`Accessible Partner App ${runId}`);
  await page.getByLabel("Publisher").fill("Qentrah E2E");
  await page.getByLabel("Support email").fill("support@partner.example.com");
  await page.getByLabel("Partner app URL").fill("https://partner.example.com");
  await page.getByLabel("Description").fill("Sync sandbox buyer and asset records into Qentrah Workspace with scoped OAuth.");
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel("Redirect URIs").fill("http://localhost:3003/api/qentrah/oauth/callback");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Scopes and events" })).toBeVisible();
  await expect(page.getByLabel("Read organization profile")).toBeChecked();
  await expect(page.getByLabel("Read clients")).toBeChecked();
  await expect(page.getByLabel("Read assets")).toBeChecked();

  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Review package" })).toBeVisible();
  await expect(page.getByLabel("Privacy policy URL")).toBeVisible();
  await expect(page.getByLabel("Terms of service URL")).toBeVisible();
});
