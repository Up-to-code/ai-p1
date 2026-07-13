import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthUser } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { invoiceInputValidator, invoiceValidator } from "./validators";

const present = <T extends { _id: string }>(row: T) => ({ ...row, id: row._id });

export const createFromHono = mutation({
  args: { organizationId: v.string(), input: invoiceInputValidator }, returns: invoiceValidator,
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const now = Date.now();
    const id = await ctx.db.insert("clientInvoices", { organizationId: args.organizationId, ...args.input, createdByUserId: user._id, createdAt: now, updatedAt: now });
    await ctx.db.insert("organizationAuditEvents", { organizationId: args.organizationId, actorUserId: user._id, action: "client.invoice.create", target: id, summary: `Created invoice ${args.input.invoiceNumber}.`, createdAt: now });
    const row = await ctx.db.get(id); if (!row) throw new Error("Invoice could not be created."); return present(row);
  },
});

export const updateFromHono = mutation({
  args: { organizationId: v.string(), invoiceId: v.id("clientInvoices"), input: invoiceInputValidator }, returns: invoiceValidator,
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const existing = await ctx.db.get(args.invoiceId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Invoice was not found.");
    const now = Date.now(); await ctx.db.patch(args.invoiceId, { ...args.input, updatedAt: now });
    await ctx.db.insert("organizationAuditEvents", { organizationId: args.organizationId, actorUserId: user._id, action: "client.invoice.update", target: args.invoiceId, summary: `Updated invoice ${args.input.invoiceNumber}.`, createdAt: now });
    const row = await ctx.db.get(args.invoiceId); if (!row) throw new Error("Invoice was not found."); return present(row);
  },
});

export const deleteFromHono = mutation({
  args: { organizationId: v.string(), invoiceId: v.id("clientInvoices") }, returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const existing = await ctx.db.get(args.invoiceId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Invoice was not found.");
    const now = Date.now(); await ctx.db.patch(args.invoiceId, { deletedAt: now, updatedAt: now });
    await ctx.db.insert("organizationAuditEvents", { organizationId: args.organizationId, actorUserId: user._id, action: "client.invoice.delete", target: args.invoiceId, summary: `Deleted invoice ${existing.invoiceNumber}.`, createdAt: now });
    return { removed: true };
  },
});
