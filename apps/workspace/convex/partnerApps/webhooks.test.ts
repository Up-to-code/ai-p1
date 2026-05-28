import { describe, expect, it, vi } from "vitest";
import { buildWebhookSignature } from "./webhookSecrets";
import { assertSafeWebhookUrl } from "./webhookUrlSafety";
import {
  findDuplicateInboundEvent,
  markWebhookDeliveryAttempt,
  presentEndpoint,
} from "./webhookDelivery";

function queryResult<T>(result: T) {
  return {
    withIndex: vi.fn(() => ({
      unique: vi.fn(async () => result),
    })),
  };
}

describe("partner webhook delivery modules", () => {
  it("rejects local and private webhook endpoint URLs", () => {
    expect(() => assertSafeWebhookUrl("https://example.com/webhook")).not.toThrow();
    expect(() => assertSafeWebhookUrl("http://example.com/webhook")).toThrow("Webhook URL must be HTTPS");
    expect(() => assertSafeWebhookUrl("https://localhost/webhook")).toThrow("Webhook URL must be HTTPS");
    expect(() => assertSafeWebhookUrl("https://10.0.0.5/webhook")).toThrow("Webhook URL must be HTTPS");
  });

  it("builds stable v1 HMAC signatures", async () => {
    await expect(buildWebhookSignature("secret", 123, "{\"ok\":true}")).resolves.toMatch(/^v1=[a-f0-9]{64}$/u);
    await expect(buildWebhookSignature("secret", 123, "{\"ok\":true}")).resolves.toBe(
      await buildWebhookSignature("secret", 123, "{\"ok\":true}"),
    );
  });

  it("redacts signing secrets when presenting endpoints", () => {
    expect(presentEndpoint({
      _id: "endpoint_1",
      signingSecret: "whsec_secret",
      status: "active",
    } as never)).toMatchObject({
      id: "endpoint_1",
      status: "active",
    });
    expect(presentEndpoint({
      _id: "endpoint_1",
      signingSecret: "whsec_secret",
    } as never)).not.toHaveProperty("signingSecret");
  });

  it("detects inbound duplicate events before idempotency keys", async () => {
    const event = { _id: "event_1" };
    const query = vi
      .fn()
      .mockReturnValueOnce(queryResult(event))
      .mockReturnValueOnce(queryResult(null));

    await expect(findDuplicateInboundEvent({
      db: { query },
    } as never, {
      partnerAppId: "app_1",
      eventId: "evt_1",
      idempotencyKey: "idem_1",
    })).resolves.toBe(event);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it("schedules retry attempts with the existing retry delay table", async () => {
    const patch = vi.fn(async () => undefined);
    const runAfter = vi.fn(async () => undefined);
    const delivery = {
      _id: "delivery_1",
      attemptCount: 0,
    };

    await expect(markWebhookDeliveryAttempt({
      db: {
        get: vi.fn(async () => delivery),
        patch,
      },
      scheduler: { runAfter },
    } as never, {
      deliveryId: "delivery_1" as never,
      ok: false,
      status: 500,
      error: "failed",
    })).resolves.toEqual({ retry: true });

    expect(patch).toHaveBeenCalledWith("delivery_1", expect.objectContaining({
      status: "pending",
      attemptCount: 1,
      lastStatus: 500,
      lastError: "failed",
    }));
    expect(runAfter).toHaveBeenCalledWith(60_000, expect.anything(), { deliveryId: "delivery_1" });
  });
});
