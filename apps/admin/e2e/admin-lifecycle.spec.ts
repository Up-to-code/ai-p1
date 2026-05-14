import { expect, test } from "@playwright/test";

const domains = [
  "security",
  "organizations",
  "users",
  "apps",
  "oauth-clients",
  "partner-connections",
  "api-keys",
  "mcp-connections",
  "webhooks",
  "ai-activity",
  "audit-logs",
  "workspace-data",
];

async function login(page: import("@playwright/test").Page) {
  await page.goto("/sign-in");
  await page.getByLabel(/email|البريد/i).fill("admin@qentrah.local");
  await page.getByLabel(/password|كلمة/i).fill("xeAm-xHdc3!@hdMbDRQtf@dH64uDpUAu");
  await page.getByRole("button", { name: /enter admin|دخول الإدارة/i }).click();
  await expect(page.getByText(/signed in|تم تسجيل الدخول/i)).toBeVisible();
}

test("admin auth rejects invalid credentials", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel(/email|البريد/i).fill("admin@qentrah.local");
  await page.getByLabel(/password|كلمة/i).fill("wrong");
  await page.getByRole("button", { name: /enter admin|دخول الإدارة/i }).click();
  await expect(page.getByText(/invalid admin credentials|غير صحيحة/i)).toBeVisible();
});

test("sidebar collapses, opens mobile drawer, and preserves lifecycle navigation", async ({ page }) => {
  await login(page);
  await page.getByRole("button", { name: /admin navigation|تنقل الإدارة/i }).first().click();
  await expect(page.getByTestId("admin-sidebar").first()).toHaveAttribute("data-collapsed", "true");
  await page.setViewportSize({ width: 390, height: 820 });
  await page.getByRole("button").first().click();
  await expect(page.getByRole("link", { name: /security and access|الأمان والوصول/i }).first()).toBeVisible();
});

for (const domain of domains) {
  test(`admin lifecycle flow for ${domain}`, async ({ page }) => {
    await login(page);
    await page.goto(`/${domain}`);
    await expect(page.getByRole("heading", { name: /records|السجلات|organizations|المؤسسات|partner apps|تطبيقات الشركاء|audit console|سجل التدقيق/i }).first()).toBeVisible();
    const search = page.getByRole("textbox").first();
    if (await search.count()) {
      await search.fill(domain.split("-")[0]);
      await search.fill("");
    }
    const recordLinks = page.locator("main a").filter({ hasText: /details|تفاصيل|open|فتح|review|مراجعة/i });
    if (await recordLinks.count()) {
      await recordLinks.first().click();
      await expect(
        page
          .getByRole("heading", {
            name: /details|التفاصيل|organization profile|ملف المؤسسة|workspace organization|مؤسسة مساحة العمل|review evidence|بيانات المراجعة/i,
          })
          .first(),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: /audit timeline|سجل التدقيق|change log|سجل التغييرات/i }).first(),
      ).toBeVisible();
      const actions = page.getByRole("heading", { name: /control actions|إجراءات التحكم/i });
      if (await actions.count()) await expect(actions.first()).toBeVisible();
    } else {
      await expect(page.getByText(/no records|لا توجد سجلات|not configured|غير مهيأ/i).first()).toBeVisible();
    }
  });
}
