import { QentrahPartnerAuthError } from "../errors";

export type QentrahWebhookEventType = "client.created" | "client.updated" | "client.deleted" | string;

export type QentrahWebhookEvent<TType extends QentrahWebhookEventType = QentrahWebhookEventType, TData = unknown> = {
  id: string;
  type: TType;
  organizationId: string;
  createdAt: number;
  data: TData;
  deliveryId: string;
};

export type QentrahClientWebhookEvent =
  | QentrahWebhookEvent<"client.created", Record<string, unknown>>
  | QentrahWebhookEvent<"client.updated", Record<string, unknown>>
  | QentrahWebhookEvent<"client.deleted", { id: string; deletedAt: number }>;

export type QentrahWebhookHandlers = {
  "client.created"?: (event: Extract<QentrahClientWebhookEvent, { type: "client.created" }>) => Promise<Response | void> | Response | void;
  "client.updated"?: (event: Extract<QentrahClientWebhookEvent, { type: "client.updated" }>) => Promise<Response | void> | Response | void;
  "client.deleted"?: (event: Extract<QentrahClientWebhookEvent, { type: "client.deleted" }>) => Promise<Response | void> | Response | void;
};

const DEFAULT_TOLERANCE_MS = 5 * 60 * 1000;
const encoder = new TextEncoder();

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return result === 0;
}

async function hmacSha256Hex(secret: string, value: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bytesToHex(new Uint8Array(signature));
}

function requiredHeader(request: Request, name: string) {
  const value = request.headers.get(name);
  if (!value) throw new QentrahPartnerAuthError("INVALID_SIGNATURE", `Missing ${name} webhook header.`, 400);
  return value;
}

export async function verifyQentrahWebhook(request: Request, options: {
  signingSecret: string;
  toleranceMs?: number;
  nowMs?: number;
}) {
  if (!options.signingSecret.trim()) {
    throw new QentrahPartnerAuthError("CONFIGURATION_ERROR", "Qentrah webhook signingSecret is required.");
  }

  const signatureHeader = requiredHeader(request, "Qentrah-Signature");
  const timestampHeader = requiredHeader(request, "Qentrah-Timestamp");
  const eventId = requiredHeader(request, "Qentrah-Event-Id");
  const eventType = requiredHeader(request, "Qentrah-Event-Type");
  const deliveryId = requiredHeader(request, "Qentrah-Delivery-Id");
  const timestamp = Number(timestampHeader);
  if (!Number.isFinite(timestamp)) throw new QentrahPartnerAuthError("INVALID_SIGNATURE", "Invalid Qentrah webhook timestamp.", 400);
  const age = Math.abs((options.nowMs ?? Date.now()) - timestamp);
  if (age > (options.toleranceMs ?? DEFAULT_TOLERANCE_MS)) {
    throw new QentrahPartnerAuthError("STALE_TIMESTAMP", "Qentrah webhook timestamp is outside the allowed tolerance.", 400);
  }

  const rawBody = await request.text();
  if (!rawBody) throw new QentrahPartnerAuthError("MISSING_RAW_BODY", "Qentrah webhook verification requires the raw request body.", 400);
  const expected = `v1=${await hmacSha256Hex(options.signingSecret, `${timestamp}.${rawBody}`)}`;
  if (!signatureHeader.split(/\s*,\s*/u).some((candidate) => timingSafeEqual(candidate, expected))) {
    throw new QentrahPartnerAuthError("INVALID_SIGNATURE", "Qentrah webhook signature is invalid.", 400);
  }

  const payload = JSON.parse(rawBody) as Omit<QentrahWebhookEvent, "deliveryId">;
  if (payload.id !== eventId || payload.type !== eventType) {
    throw new QentrahPartnerAuthError("INVALID_SIGNATURE", "Qentrah webhook headers do not match the payload.", 400);
  }
  return { ...payload, deliveryId } as QentrahWebhookEvent;
}

export function createQentrahWebhookHandler(options: {
  signingSecret: string;
  toleranceMs?: number;
  handlers: QentrahWebhookHandlers;
  onUnhandledEvent?: (event: QentrahWebhookEvent) => Promise<Response | void> | Response | void;
}) {
  return async function handleQentrahWebhook(request: Request) {
    try {
      const event = await verifyQentrahWebhook(request, {
        signingSecret: options.signingSecret,
        toleranceMs: options.toleranceMs,
      });
      const handler = options.handlers[event.type as keyof QentrahWebhookHandlers] as ((event: QentrahWebhookEvent) => Promise<Response | void> | Response | void) | undefined;
      const response = handler ? await handler(event) : await options.onUnhandledEvent?.(event);
      return response ?? Response.json({ received: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Qentrah webhook failed.";
      const status = error instanceof QentrahPartnerAuthError ? error.status : 400;
      return Response.json({ error: message }, { status });
    }
  };
}
