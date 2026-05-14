import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function recordIntegrationEvent(input: {
  direction: "outbound" | "inbound";
  contract: string;
  idempotencyKey: string;
  payload: unknown;
}) {
  const existing = await prisma.ananIntegrationEvent.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });
  if (existing) return { eventId: existing.id, deduped: true };

  const event = await prisma.ananIntegrationEvent.create({
    data: {
      direction: input.direction,
      contract: input.contract,
      idempotencyKey: input.idempotencyKey,
      status: "pending",
      attempts: 0,
      payload: input.payload as Prisma.InputJsonValue,
    },
  });
  return { eventId: event.id, deduped: false };
}

