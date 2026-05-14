import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: "http://localhost:3003",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3003/sign-in",
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      ADMIN_AUTH_SECRET: "admin-e2e-secret-that-is-long-enough-123",
      ADMIN_AUTH_EMAIL: "admin@qentrah.local",
      ADMIN_AUTH_PASSWORD_SHA256: "e5a57dac74bc42a109be46137183e06f7355796c55453ad4035079627ace1ea0",
      PLATFORM_ADMIN_EMAILS: "admin@qentrah.local",
      WORKSPACE_ADMIN_SERVICE_TOKEN: "local-partner-review-token",
      ADMIN_CONVEX_SERVICE_TOKEN: "local-partner-review-token",
      CONVEX_URL: "https://pastel-yak-276.convex.cloud",
      NEXT_PUBLIC_CONVEX_URL: "https://pastel-yak-276.convex.cloud",
    },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
