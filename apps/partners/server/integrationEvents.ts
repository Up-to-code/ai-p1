import { prisma } from "@/lib/prisma";

function jsonInput(value: unknown): never {
  return value as never;
}

export async function recordIntegrationEvent(input: {
  direction: "outbound" | "inbound";
  contract: string;
  idempotencyKey: string;
  payload: unknown;
}) {
  const existing = await prisma.qentrahIntegrationEvent.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });
  if (existing) return { eventId: existing.id, deduped: true };

  const event = await prisma.qentrahIntegrationEvent.create({
    data: {
      direction: input.direction,
      contract: input.contract,
      idempotencyKey: input.idempotencyKey,
      status: "pending",
      attempts: 0,
      payload: jsonInput(input.payload),
    },
  });
  return { eventId: event.id, deduped: false };
}
