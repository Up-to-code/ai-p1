import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("billing routes", () => {
  it("exposes organization checkout and subscription routes", () => {
    const source = readFileSync("src/server/domains/organization/routing/domains/billing.ts", "utf8");

    expect(source).toContain("/:organizationId/billing/subscription");
    expect(source).toContain("/:organizationId/billing/usage");
  });

  it("uses the signed Convex DodoPayments webhook as the only provider ingress", () => {
    const source = readFileSync("convex/http.ts", "utf8");
    const billingRouter = readFileSync("src/server/domains/billing/routing.ts", "utf8");

    expect(source).toContain('path: "/dodopayments-webhook"');
    expect(source).toContain("createDodoWebhookHandler");
    expect(billingRouter).not.toContain("/dodo/webhook");
  });
});
