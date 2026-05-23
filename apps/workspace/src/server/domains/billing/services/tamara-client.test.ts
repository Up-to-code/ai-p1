import { describe, expect, it } from "vitest";
import {
  buildTamaraCheckoutPayload,
  cancelTamaraOrder,
  refundTamaraOrder,
} from "./tamara-client";

describe("Tamara checkout payload", () => {
  it("builds the Saudi monthly checkout request with merchant return URLs", () => {
    const payload = buildTamaraCheckoutPayload(
      {
        locale: "en",
        plan: {
          id: "saudi_monthly",
          name: "Qentrah Saudi Arabia",
          amount: 499,
          currency: "SAR",
        },
        payment: {
          id: "payment_1",
          orderReferenceId: "qentrah-test",
          orderNumber: "qentrah-test",
        },
        organization: {
          name: "Qentrah Realty",
          legalName: "Qentrah Realty LLC",
          email: "ops@example.com",
          phone: "+966500000000",
          address: "Riyadh",
        },
      },
      {
        siteUrl: "https://app.qentrah.com",
        webhookUrl: "https://app.qentrah.com/api/v1/billing/tamara/webhook",
      },
    );

    expect(payload.country_code).toBe("SA");
    expect(payload.total_amount).toEqual({ amount: 499, currency: "SAR" });
    expect(payload.items[0]).toMatchObject({
      reference_id: "saudi_monthly",
      sku: "qentrah-saudi-monthly",
      type: "Digital",
      total_amount: { amount: 499, currency: "SAR" },
    });
    expect(payload.merchant_url.success).toBe("https://app.qentrah.com/en/billing/tamara/success?paymentId=payment_1&reference=qentrah-test");
    expect(payload.merchant_url.cancel).toContain("/en/billing/tamara/cancel");
    expect(payload.merchant_url.failure).toContain("/en/billing/tamara/failure");
    expect(payload.merchant_url.notification).toBe("https://app.qentrah.com/api/v1/billing/tamara/webhook");
  });

  it("includes optional promo discount details when provided", () => {
    const payload = buildTamaraCheckoutPayload(
      {
        locale: "en",
        plan: {
          id: "saudi_monthly",
          name: "Qentrah Saudi Arabia",
          amount: 499,
          currency: "SAR",
        },
        payment: {
          id: "payment_1",
          orderReferenceId: "qentrah-test",
          orderNumber: "qentrah-test",
        },
        organization: {
          name: "Qentrah Realty",
          legalName: "Qentrah Realty LLC",
          email: "ops@example.com",
          phone: "+966500000000",
          address: "Riyadh",
        },
        discount: {
          name: "UAT10",
          amount: 10,
          currency: "SAR",
        },
      },
      {
        siteUrl: "https://app.qentrah.com",
        webhookUrl: "https://app.qentrah.com/api/v1/billing/tamara/webhook",
      },
    );

    expect(payload.discount).toEqual({ name: "UAT10", amount: { amount: 10, currency: "SAR" } });
    expect(payload.discount_amount).toEqual({ amount: 10, currency: "SAR" });
    expect(payload.items[0].discount_amount).toEqual({ amount: 10, currency: "SAR" });
  });

  it("builds Tamara cancel and refund operations for UAT", async () => {
    const calls: Array<{ url: string; body: unknown }> = [];
    const fetcher = (async (url, init) => {
      calls.push({ url: String(url), body: JSON.parse(String(init?.body)) });
      return Response.json({ ok: true });
    }) satisfies typeof fetch;

    process.env.TAMARA_API_BASE_URL = "https://api-sandbox.tamara.co";
    process.env.TAMARA_API_TOKEN = "token";

    await cancelTamaraOrder(
      {
        orderId: "order_1",
        amount: { amount: 499, currency: "SAR" },
        itemName: "Qentrah Saudi Arabia",
      },
      { fetcher },
    );
    await refundTamaraOrder(
      {
        orderId: "order_1",
        amount: { amount: 499, currency: "SAR" },
        comment: "UAT refund",
        merchantRefundId: "refund_1",
      },
      { fetcher },
    );

    expect(calls[0]).toMatchObject({
      url: "https://api-sandbox.tamara.co/orders/order_1/cancel",
      body: {
        total_amount: { amount: 499, currency: "SAR" },
      },
    });
    expect(calls[1]).toMatchObject({
      url: "https://api-sandbox.tamara.co/payments/simplified-refund/order_1",
      body: {
        total_amount: { amount: 499, currency: "SAR" },
        comment: "UAT refund",
        merchant_refund_id: "refund_1",
      },
    });
  });
});
