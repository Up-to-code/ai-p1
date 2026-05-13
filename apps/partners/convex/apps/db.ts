import { assertPartnerOwnsApp } from "../shared/appPolicies";

export async function requireOwnedApp(ctx: any, appId: string, authSubject: string) {
  const normalizedId = ctx.db.normalizeId("partnerApps", appId);
  const app = normalizedId ? await ctx.db.get(normalizedId) : null;
  assertPartnerOwnsApp(app, authSubject);
  return app;
}
