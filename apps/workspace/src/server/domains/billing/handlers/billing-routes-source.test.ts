import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("billing routes", () => {
  it("exposes organization checkout and subscription routes", () => {
    const source = readFileSync("src/server/domains/organization/routing/router.ts", "utf8");

    expect(source).toContain("/:organizationId/billing/subscription");
    expect(source).toContain("/:organizationId/billing/usage");
  });

  it("exposes DodoPayments webhook route outside organization routes", () => {
    const source = readFileSync("src/server/routing/v1/router.ts", "utf8");
    const billingRouter = readFileSync("src/server/domains/billing/routing.ts", "utf8");

    expect(source).toContain('v1Router.route("/billing", billingRouter)');
    expect(billingRouter).toContain('billingRouter.post("/dodo/webhook"');
  });
});
