import { v } from "convex/values";

export const accountTypeValidator = v.union(v.literal("asset"), v.literal("liability"), v.literal("equity"), v.literal("revenue"), v.literal("expense"));
export const accountSystemKeyValidator = v.union(v.literal("cash"), v.literal("accounts_receivable"), v.literal("accounts_payable"), v.literal("revenue"), v.literal("tax_payable"), v.literal("tax_receivable"), v.literal("expense"), v.literal("retainer_liability"), v.literal("fx_gain_loss"));
export const accountingPeriodStatusValidator = v.union(v.literal("open"), v.literal("closed"));
export const documentStatusValidator = v.union(v.literal("draft"), v.literal("approved"), v.literal("posted"), v.literal("partially_paid"), v.literal("paid"), v.literal("void"));
export const estimateStatusValidator = v.union(v.literal("draft"), v.literal("sent"), v.literal("accepted"), v.literal("rejected"), v.literal("expired"));
export const paymentStatusValidator = v.union(v.literal("recorded"), v.literal("reversed"));
export const journalStatusValidator = v.union(v.literal("posted"), v.literal("reversed"));
export const taxCalculationValidator = v.union(v.literal("exclusive"), v.literal("inclusive"));
export const scopeTypeValidator = v.union(v.literal("organization"), v.literal("space"), v.literal("project"), v.literal("engagement"), v.literal("client"));
export const bankTransactionStatusValidator = v.union(v.literal("unmatched"), v.literal("matched"), v.literal("ignored"));
