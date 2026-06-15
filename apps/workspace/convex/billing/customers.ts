import { internalQuery, mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Internal query to fetch customer by auth ID
 * Used by DodoPayments component for customer identification
 */
export const getByAuthId = internalQuery({
  args: { authId: v.string() },
  handler: async (ctx, { authId }) => {
    return await ctx.db
      .query("dodoCustomers")
      .withIndex("by_auth_id", (q) => q.eq("authId", authId))
      .first();
  },
});

/**
 * Get current user's customer record
 */
export const getCurrentUserCustomer = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("dodoCustomers")
      .withIndex("by_auth_id", (q) => q.eq("authId", identity.subject))
      .first();
  },
});

/**
 * Create or update customer record
 */
export const upsertCustomer = mutation({
  args: {
    authId: v.string(),
    email: v.string(),
    dodoCustomerId: v.optional(v.string()),
  },
  handler: async (ctx, { authId, email, dodoCustomerId }) => {
    const existing = await ctx.db
      .query("dodoCustomers")
      .withIndex("by_auth_id", (q) => q.eq("authId", authId))
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        email,
        dodoCustomerId: dodoCustomerId || existing.dodoCustomerId,
        updatedAt: Date.now(),
      });
    }

    return await ctx.db.insert("dodoCustomers", {
      authId,
      email,
      dodoCustomerId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Get customer by Dodo Payments customer ID
 */
export const getByDodoCustomerId = internalQuery({
  args: { dodoCustomerId: v.string() },
  handler: async (ctx, { dodoCustomerId }) => {
    return await ctx.db
      .query("dodoCustomers")
      .withIndex("by_dodo_customer_id", (q) =>
        q.eq("dodoCustomerId", dodoCustomerId)
      )
      .first();
  },
});
