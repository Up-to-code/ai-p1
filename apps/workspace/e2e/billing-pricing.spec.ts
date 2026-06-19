import { expect, test } from "@playwright/test";

test("landing shows ready website templates before pricing", async ({ page }) => {
  await page.goto("/en");

  const websites = page.locator("#websites");
  const pricing = page.locator("#pricing");
  await expect(websites.getByRole("heading", { name: "Pick a real estate website style before you subscribe." })).toBeVisible();
  await expect(websites.getByText("One website included with the first subscription")).toBeVisible();

  const visibleTemplateLinks = websites.locator("a:not([aria-hidden='true'])");
  await expect(visibleTemplateLinks).toHaveCount(4);
  await expect(visibleTemplateLinks.first()).toHaveAttribute("href", /\/en\/contact\?template=waterfront-launch$/u);
  await expect(websites.getByAltText("Waterfront launch").first()).toBeVisible();

  const positions = await page.evaluate(() => {
    const websitesSection = document.querySelector("#websites")?.getBoundingClientRect();
    const pricingSection = document.querySelector("#pricing")?.getBoundingClientRect();
    return {
      websitesBottom: websitesSection?.bottom ?? 0,
      pricingTop: pricingSection?.top ?? 0,
    };
  });

  expect(positions.websitesBottom).toBeLessThanOrEqual(positions.pricingTop + 1);
  await expect(pricing).toBeVisible();
});

test("pricing start setup routes unauthenticated users toward billing checkout", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("tab", { name: "Monthly" }).click();

  await expect(page.getByTestId("pricing-card-good_monthly")).toBeVisible();
  await expect(page.getByTestId("pricing-card-custom")).toBeVisible();

  const startSetup = page.getByRole("link", { name: "Start setup" });
  await expect(startSetup).toHaveAttribute("href", /\/en\/billing\?plan=good_monthly$/u);

  await startSetup.click();
  await expect(page).toHaveURL(/\/en\/sign-in\?callbackURL=%2Fen%2Fbilling%3Fplan%3Dgood_monthly$/u);
  await expect(page.getByRole("button", { name: "Sign in with Google" })).toBeVisible();
});
