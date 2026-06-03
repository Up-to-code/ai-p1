import { expect, test } from "@playwright/test";

test("dashboard explains the WorkOS partner key authorization flow", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page.getByRole("button", { name: /Overview/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Clients/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Test Results/i })).toBeVisible();

  await page.getByRole("button", { name: /Auth Flow/i }).click();
  await expect(page.getByText("Workspace grant")).toBeVisible();
  await expect(page.getByText("WorkOS key issue")).toBeVisible();
  await expect(page.getByText("/api/v1/partner")).toBeVisible();

  await page.getByRole("button", { name: /Credentials/i }).click();
  await expect(page.getByText("Sanitized runtime credentials and granted scope state.")).toBeVisible();
  await expect(page.getByText("CLIENT:DELETE")).toBeVisible();

  await page.getByRole("button", { name: /Clients/i }).click();
  await expect(page.getByText("Create client")).toBeVisible();
  await expect(page.getByText("Update client")).toBeVisible();
  await expect(page.getByText("Delete client")).toBeVisible();
});
