import { expect, test } from "@playwright/test";

const appDetailUrl = process.env.E2E_PARTNERS_APP_DETAIL_URL;

test.skip(!appDetailUrl, "Set E2E_PARTNERS_APP_DETAIL_URL to an authenticated app detail URL.");

test("app detail keeps lifecycle topics split across focused tabs", async ({ page }) => {
  await page.goto(appDetailUrl!);

  await expect(page.getByRole("button", { name: /Flow/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Sandbox/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /API explorer/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Logs/i })).toBeVisible();

  await page.getByRole("button", { name: /Flow/i }).click();
  await expect(page.getByRole("heading", { name: "OAuth 2.1 authorization lifecycle" })).toBeVisible();
  await expect(page.getByText("Workspace resource APIs verify every call")).toBeVisible();

  await page.getByRole("button", { name: /Sandbox/i }).click();
  await expect(page.getByRole("heading", { name: "Sandbox configuration" })).toBeVisible();

  await page.getByRole("button", { name: /API explorer/i }).click();
  await expect(page.getByRole("heading", { name: "Run one sandbox request" })).toBeVisible();

  await page.getByRole("button", { name: /Logs/i }).click();
  await expect(page.getByRole("heading", { name: "Recent sandbox requests" })).toBeVisible();
});
