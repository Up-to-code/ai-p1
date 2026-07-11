import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { invoiceValidator } from "./validators";

export const listByClient = query({
  args: { organizationId: v.string(), clientId: v.string() },
  returns: v.array(invoiceValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const rows = await ctx.db.query("clientInvoices")
      .withIndex("by_organization_client", (q) => q.eq("organizationId", args.organizationId).eq("clientId", args.clientId))
      .take(200);
    return rows.filter((row) => !row.deletedAt).sort((a, b) => b.updatedAt - a.updatedAt).map((row) => ({ ...row, id: row._id }));
  },
});
