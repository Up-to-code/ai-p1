import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
const cloudConvexHost = "pastel-yak-276.convex.cloud";
const localConvexHost = "127.0.0.1:3210";

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
  const email = uniqueEmail("activity-owner");
  await signUp(page.request, email);
  const organizationId = await createOrganization(page.request, `Activity E2E Org ${Date.now()}`);
  return { email, organizationId };
}

test.describe("activity realtime connection", () => {
  test("Arabic activity page uses cloud Convex and loads organization activity", async ({ page }) => {
    const { organizationId } = await prepareOwner(page);
    const websocketUrls: string[] = [];
    const failedRequests: string[] = [];

    page.on("websocket", (socket) => websocketUrls.push(socket.url()));
    page.on("requestfailed", (request) => {
      failedRequests.push(request.url());
    });

    const activityResponse = page.waitForResponse((response) =>
      response.url().includes(`/api/v1/organizations/${organizationId}/read/activity?`) &&
      response.status() === 200,
    );

    await page.goto("/ar/activity");
    await activityResponse;

    await expect(page.getByRole("heading", { name: /النشاط/i })).toBeVisible();
    await expect(page.getByText("اتصال مساحة العمل يحتاج تحديثا")).toHaveCount(0);
    await expect(page.getByText("لا يوجد نشاط بعد").or(page.getByRole("table"))).toBeVisible();

    await expect.poll(() => websocketUrls.some((url) => url.includes(cloudConvexHost))).toBeTruthy();
    expect(websocketUrls.some((url) => url.includes(localConvexHost))).toBe(false);
    expect(failedRequests.some((url) => url.includes(localConvexHost))).toBe(false);
  });
});
