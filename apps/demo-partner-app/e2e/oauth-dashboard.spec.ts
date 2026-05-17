import { expect, test } from "@playwright/test";

test("dashboard explains the OAuth 2.1 authorization flow", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page.getByRole("button", { name: /Overview/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Clients/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Test Results/i })).toBeVisible();

  await page.getByRole("button", { name: /OAuth Flow/i }).click();
  await expect(page.getByText("Authorization code plus PKCE lifecycle and endpoints.")).toBeVisible();
  await expect(page.getByText("/oauth/authorize")).toBeVisible();
  await expect(page.getByText("/oauth/token")).toBeVisible();

  await page.getByRole("button", { name: /Credentials/i }).click();
  await expect(page.getByText("Sanitized runtime credentials and granted scope state.")).toBeVisible();
  await expect(page.getByText("CLIENT:DELETE")).toBeVisible();

  await page.getByRole("button", { name: /Clients/i }).click();
  await expect(page.getByText("Create client")).toBeVisible();
  await expect(page.getByText("Update client")).toBeVisible();
  await expect(page.getByText("Delete client")).toBeVisible();
});
