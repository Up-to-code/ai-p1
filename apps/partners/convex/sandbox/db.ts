import { ConvexError } from "convex/values";
import { assertPartnerOwnsApp } from "../partnerAppPolicies";
import { randomToken } from "../partnerRuntime";
import type { SandboxResourceType } from "./types";

export async function requireOwnedAppById(ctx: any, appId: string, authSubject: string) {
  const normalizedId = ctx.db.normalizeId("partnerApps", appId);
  const app = normalizedId ? await ctx.db.get(normalizedId) : null;
  assertPartnerOwnsApp(app, authSubject);
  return app;
}

export async function findOwnedAppByClientId(ctx: any, clientId: string, authSubject: string) {
  const app = await ctx.db
    .query("partnerApps")
    .withIndex("by_clientId", (q: any) => q.eq("clientId", clientId))
    .first();
  assertPartnerOwnsApp(app, authSubject);
  return app;
}

export async function requireSandboxOrganization(ctx: any, organizationId: string, partnerAppId?: string) {
  const organization = await ctx.db
    .query("sandboxOrganizations")
    .withIndex("by_organizationId", (q: any) => q.eq("organizationId", organizationId))
    .first();
  if (!organization) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Sandbox organization was not found." });
  }
  if (partnerAppId) {
    const appId = ctx.db.normalizeId("partnerApps", partnerAppId);
    if (!appId || organization.partnerAppId !== appId) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Sandbox organization does not belong to this app." });
    }
  }
  return organization;
}

export async function ensureSandboxOrganization(ctx: any, app: any) {
  const existing = await ctx.db
    .query("sandboxOrganizations")
    .withIndex("by_partnerAppId", (q: any) => q.eq("partnerAppId", app._id))
    .first();
  if (existing) return existing;

  const now = Date.now();
  const organizationId = randomToken("sandbox_org", 12);
  const id = await ctx.db.insert("sandboxOrganizations", {
    partnerAuthSubject: app.partnerAuthSubject,
    partnerAppId: app._id,
    organizationId,
    name: `${app.name} Sandbox`,
    createdAt: now,
    updatedAt: now,
  });
  const organization = await ctx.db.get(id);
  await seedSandbox(ctx, app, organization);
  return organization;
}

async function seedSandbox(ctx: any, app: any, organization: any) {
  const now = Date.now();
  const seeds: Array<{ resourceType: SandboxResourceType; data: Record<string, unknown> }> = [
    { resourceType: "client", data: { name: "Sandbox Buyer", email: "buyer@sandbox.local", status: "active" } },
    { resourceType: "property", data: { title: "Sandbox Property", city: "Riyadh", price: "850000" } },
    { resourceType: "project", data: { name: "Sandbox Project", stage: "planning" } },
    { resourceType: "task", data: { title: "Follow up with sandbox lead", status: "open" } },
    { resourceType: "calendar", data: { title: "Sandbox showing", startsAt: new Date(now + 86_400_000).toISOString() } },
    { resourceType: "media", data: { name: "sandbox-brochure.pdf", resourceType: "property", url: "https://partners.anan.local/sandbox/media/demo.pdf" } },
  ];

  for (const seed of seeds) {
    await ctx.db.insert("sandboxResources", {
      partnerAuthSubject: app.partnerAuthSubject,
      partnerAppId: app._id,
      organizationId: organization.organizationId,
      resourceType: seed.resourceType,
      data: seed.data,
      createdAt: now,
      updatedAt: now,
    });
  }
}
