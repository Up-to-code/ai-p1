import { ConvexError } from "convex/values";

type PartnerIdentity = {
  subject: string;
  name?: string;
  email?: string;
};

export async function requirePartnerIdentity(ctx: any): Promise<PartnerIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.subject) {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Authentication required" });
  }
  return {
    subject: identity.subject,
    name: typeof identity.name === "string" ? identity.name : undefined,
    email: typeof identity.email === "string" ? identity.email : undefined,
  };
}

export async function ensurePartnerProfile(ctx: any, now = Date.now()) {
  const identity = await requirePartnerIdentity(ctx);
  const existing = await ctx.db
    .query("partnerProfiles")
    .withIndex("by_authSubject", (q: any) => q.eq("authSubject", identity.subject))
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, {
      name: existing.name ?? identity.name,
      email: identity.email ?? existing.email,
      updatedAt: now,
    });
    return { identity, profileId: existing._id };
  }

  const profileId = await ctx.db.insert("partnerProfiles", {
    authSubject: identity.subject,
    name: identity.name,
    email: identity.email,
    createdAt: now,
    updatedAt: now,
  });
  return { identity, profileId };
}

export function assertPartnerAppEditable(status: string) {
  if (!["draft", "rejected"].includes(status)) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Only draft or rejected apps can be edited" });
  }
}

export function randomToken(prefix: string, bytes = 18) {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  const body = Array.from(array, (byte) => byte.toString(36).padStart(2, "0")).join("");
  return `${prefix}_${body}`;
}

export async function auditPartnerEvent(
  ctx: any,
  input: {
    actorAuthSubject?: string;
    appId?: unknown;
    eventType: string;
    payload?: unknown;
    now?: number;
  },
) {
  await ctx.db.insert("partnerEvents", {
    actorAuthSubject: input.actorAuthSubject,
    appId: input.appId,
    eventType: input.eventType,
    payload: input.payload,
    createdAt: input.now ?? Date.now(),
  });
}
