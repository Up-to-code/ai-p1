import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

function jsonInput(value: unknown): never {
  return value as never;
}

export type PartnerIdentity = {
  subject: string;
  name?: string | null;
  email?: string | null;
};

export function randomToken(prefix: string, bytes = 18) {
  return `${prefix}_${randomBytes(bytes).toString("base64url")}`;
}

export async function ensurePartnerProfile(identity: PartnerIdentity) {
  const user = await prisma.user.findUnique({
    where: { id: identity.subject },
    select: { name: true, email: true },
  });
  const name = identity.name ?? user?.name ?? null;
  const email = identity.email ?? user?.email ?? null;

  return prisma.partnerProfile.upsert({
    where: { authSubject: identity.subject },
    create: {
      authSubject: identity.subject,
      name,
      email,
    },
    update: {
      name,
      email,
    },
  });
}

export async function auditPartnerEvent(input: {
  actorAuthSubject?: string | null;
  appId?: string | null;
  eventType: string;
  payload?: unknown;
}) {
  await prisma.partnerEvent.create({
    data: {
      actorAuthSubject: input.actorAuthSubject ?? undefined,
      appId: input.appId ?? undefined,
      eventType: input.eventType,
      payload: input.payload === undefined ? undefined : jsonInput(input.payload),
    },
  });
}
