import { v } from "convex/values";
import { query, type QueryCtx } from "../_generated/server";
import { financeAccess } from "./access";
import { scopeTypeValidator } from "./validators";

const MAX_ROWS = 1_000;
const recordSummary = v.object({ id: v.string(), kind: v.string(), title: v.string(), status: v.string(), amountMinor: v.optional(v.number()), currency: v.optional(v.string()), date: v.optional(v.number()), subtitle: v.optional(v.string()) });

export const overview = query({
  args: { organizationId: v.string(), startAt: v.number(), endAt: v.number() },
  returns: v.object({ configured: v.boolean(), baseCurrency: v.optional(v.string()), accountsReceivableBaseMinor: v.number(), accountsPayableBaseMinor: v.number(), revenueBaseMinor: v.number(), expenseBaseMinor: v.number(), accrualProfitBaseMinor: v.number(), cashNetBaseMinor: v.number(), overdueInvoices: v.number(), unreconciledTransactions: v.number() }),
  handler: async (ctx, args) => {
    await financeAccess(ctx, args.organizationId, "read");
    const settings = await ctx.db.query("financeSettings").withIndex("by_org", (q) => q.eq("organizationId", args.organizationId)).unique();
    if (!settings || settings.deletedAt) return { configured: false, baseCurrency: undefined, accountsReceivableBaseMinor: 0, accountsPayableBaseMinor: 0, revenueBaseMinor: 0, expenseBaseMinor: 0, accrualProfitBaseMinor: 0, cashNetBaseMinor: 0, overdueInvoices: 0, unreconciledTransactions: 0 };
    const [accounts, ledger, inbound, outbound, overdueStatuses, unmatched] = await Promise.all([
      ctx.db.query("financeAccounts").withIndex("by_org_code", (q) => q.eq("organizationId", args.organizationId)).take(MAX_ROWS),
      ctx.db.query("financeLedgerLines").withIndex("by_period_account", (q) => q.eq("organizationId", args.organizationId).gte("accountingDate", args.startAt).lte("accountingDate", args.endAt)).take(MAX_ROWS),
      ctx.db.query("financePayments").withIndex("by_org_direction_date", (q) => q.eq("organizationId", args.organizationId).eq("direction", "inbound").gte("receivedOrPaidAt", args.startAt).lte("receivedOrPaidAt", args.endAt)).take(MAX_ROWS),
      ctx.db.query("financePayments").withIndex("by_org_direction_date", (q) => q.eq("organizationId", args.organizationId).eq("direction", "outbound").gte("receivedOrPaidAt", args.startAt).lte("receivedOrPaidAt", args.endAt)).take(MAX_ROWS),
      Promise.all(["posted", "partially_paid"].map((status) => ctx.db.query("financeInvoices").withIndex("by_org_status_due", (q) => q.eq("organizationId", args.organizationId).eq("status", status as "posted" | "partially_paid").lte("dueAt", Date.now())).take(MAX_ROWS))),
      ctx.db.query("financeBankTransactions").withIndex("by_org_status_date", (q) => q.eq("organizationId", args.organizationId).eq("status", "unmatched")).take(MAX_ROWS),
    ]);
    const accountById = new Map(accounts.map((account) => [String(account._id), account]));
    const signed = (systemKey: string) => ledger.filter((line) => accountById.get(String(line.accountId))?.systemKey === systemKey).reduce((sum, line) => sum + line.debitBaseMinor - line.creditBaseMinor, 0);
    const revenueBaseMinor = -signed("revenue"); const expenseBaseMinor = signed("expense");
    return { configured: true, baseCurrency: settings.baseCurrency, accountsReceivableBaseMinor: signed("accounts_receivable"), accountsPayableBaseMinor: -signed("accounts_payable"), revenueBaseMinor, expenseBaseMinor, accrualProfitBaseMinor: revenueBaseMinor - expenseBaseMinor, cashNetBaseMinor: inbound.filter(activePayment).reduce((sum, item) => sum + item.baseAmountMinor, 0) - outbound.filter(activePayment).reduce((sum, item) => sum + item.baseAmountMinor, 0), overdueInvoices: overdueStatuses.flat().filter((item) => item.dueAt < Date.now() && !item.deletedAt).length, unreconciledTransactions: unmatched.length };
  },
});

export const records = query({
  args: { organizationId: v.string(), view: v.string(), limit: v.optional(v.number()) }, returns: v.array(recordSummary),
  handler: async (ctx, args) => {
    await financeAccess(ctx, args.organizationId, "read"); const limit = Math.min(250, Math.max(1, Math.trunc(args.limit ?? 100)));
    if (args.view === "invoices" || args.view === "receivable") { const rows = await ctx.db.query("financeInvoices").withIndex("by_org_status_due", (q) => q.eq("organizationId", args.organizationId)).order("desc").take(limit); return rows.filter(active).map((item) => ({ id: item._id, kind: "invoice", title: item.number, status: item.status, amountMinor: item.totalMinor - item.paidMinor, currency: item.currency, date: item.dueAt })); }
    if (args.view === "expenses" || args.view === "payable") { const rows = await ctx.db.query("financeExpenses").withIndex("by_org_status_incurred", (q) => q.eq("organizationId", args.organizationId)).order("desc").take(limit); return rows.filter(active).map((item) => ({ id: item._id, kind: "expense", title: item.description, status: item.status, amountMinor: item.amountMinor, currency: item.currency, date: item.incurredAt })); }
    if (args.view === "estimates") { const rows = await ctx.db.query("financeEstimates").withIndex("by_org_status_updated", (q) => q.eq("organizationId", args.organizationId)).order("desc").take(limit); return rows.filter(active).map((item) => ({ id: item._id, kind: "estimate", title: `${item.number} · ${item.title}`, status: item.status, amountMinor: item.totalMinor, currency: item.currency, date: item.updatedAt })); }
    if (args.view === "payments") { const rows = await ctx.db.query("financePayments").withIndex("by_org_direction_date", (q) => q.eq("organizationId", args.organizationId)).order("desc").take(limit); return rows.filter(active).map((item) => ({ id: item._id, kind: "payment", title: item.reference ?? item.method, status: `${item.direction}:${item.status}`, amountMinor: item.amountMinor, currency: item.currency, date: item.receivedOrPaidAt })); }
    if (args.view === "retainers") { const rows = await ctx.db.query("financeRetainers").withIndex("by_client", (q) => q.eq("organizationId", args.organizationId)).order("desc").take(limit); return rows.filter(active).map((item) => ({ id: item._id, kind: "retainer", title: String(item.engagementId), status: item.status, amountMinor: item.receivedMinor - item.appliedMinor, currency: item.currency, date: item.updatedAt })); }
    if (args.view === "vendors") { const rows = await ctx.db.query("financeVendors").withIndex("by_org_active_name", (q) => q.eq("organizationId", args.organizationId).eq("active", true)).take(limit); return rows.filter(active).map((item) => ({ id: item._id, kind: "vendor", title: item.name, status: "active", currency: item.currency })); }
    if (args.view === "tax") { const rows = await ctx.db.query("financeTaxRules").withIndex("by_org_active_effective", (q) => q.eq("organizationId", args.organizationId).eq("active", true)).order("desc").take(limit); return rows.filter(active).map((item) => ({ id: item._id, kind: "tax", title: item.name, status: item.calculation, amountMinor: item.rateBasisPoints, date: item.effectiveFrom, subtitle: item.jurisdiction })); }
    if (args.view === "period-close") { const rows = await ctx.db.query("financeAccountingPeriods").withIndex("by_org_status_start", (q) => q.eq("organizationId", args.organizationId)).order("desc").take(limit); return rows.filter(active).map((item) => ({ id: item._id, kind: "period", title: item.name, status: item.status, date: item.endAt })); }
    if (args.view === "chart-of-accounts" || args.view === "ledger") { const rows = await ctx.db.query("financeAccounts").withIndex("by_org_code", (q) => q.eq("organizationId", args.organizationId)).take(limit); return rows.filter(active).map((item) => ({ id: item._id, kind: "account", title: `${item.code} · ${item.name}`, status: item.type, currency: item.currency })); }
    if (args.view === "journal-entries") { const rows = await ctx.db.query("financeJournalEntries").withIndex("by_org_date", (q) => q.eq("organizationId", args.organizationId)).order("desc").take(limit); return rows.filter(active).map((item) => ({ id: item._id, kind: "journal", title: `${item.number} · ${item.description}`, status: item.status, date: item.accountingDate, subtitle: item.sourceType })); }
    if (args.view === "banking" || args.view === "reconciliation") { const rows = await ctx.db.query("financeBankTransactions").withIndex("by_org_status_date", (q) => q.eq("organizationId", args.organizationId)).order("desc").take(limit); return rows.map((item) => ({ id: item._id, kind: "bank_transaction", title: item.description, status: item.status, amountMinor: item.amountMinor, currency: item.currency, date: item.occurredAt })); }
    if (args.view === "budgets") { const rows = await ctx.db.query("financeBudgets").withIndex("by_org_status_period", (q) => q.eq("organizationId", args.organizationId)).order("desc").take(limit); return rows.filter(active).map((item) => ({ id: item._id, kind: "budget", title: item.name, status: `${item.scopeType}:${item.status}`, amountMinor: item.amountMinor, currency: item.currency, date: item.periodStartAt, subtitle: item.category })); }
    return [];
  },
});

export const profitability = query({
  args: { organizationId: v.string(), scopeType: scopeTypeValidator, scopeId: v.optional(v.string()), startAt: v.number(), endAt: v.number() },
  returns: v.object({ revenueBaseMinor: v.number(), expenseBaseMinor: v.number(), profitBaseMinor: v.number(), marginBasisPoints: v.number() }),
  handler: async (ctx, args) => {
    await financeAccess(ctx, args.organizationId, "read"); const accounts = await ctx.db.query("financeAccounts").withIndex("by_org_code", (q) => q.eq("organizationId", args.organizationId)).take(MAX_ROWS); const accountType = new Map(accounts.map((account) => [String(account._id), account.type]));
    const lines = await scopedLines(ctx, args); const revenueBaseMinor = lines.filter((line) => accountType.get(String(line.accountId)) === "revenue").reduce((sum, line) => sum + line.creditBaseMinor - line.debitBaseMinor, 0); const expenseBaseMinor = lines.filter((line) => accountType.get(String(line.accountId)) === "expense").reduce((sum, line) => sum + line.debitBaseMinor - line.creditBaseMinor, 0); const profitBaseMinor = revenueBaseMinor - expenseBaseMinor;
    return { revenueBaseMinor, expenseBaseMinor, profitBaseMinor, marginBasisPoints: revenueBaseMinor ? Math.round((profitBaseMinor / revenueBaseMinor) * 10_000) : 0 };
  },
});

async function scopedLines(ctx: QueryCtx, args: { organizationId: string; scopeType: string; scopeId?: string; startAt: number; endAt: number }) {
  if (args.scopeType === "project" && args.scopeId) { const id = ctx.db.normalizeId("projects", args.scopeId); if (!id) return []; return ctx.db.query("financeLedgerLines").withIndex("by_project_date", (q) => q.eq("organizationId", args.organizationId).eq("projectId", id).gte("accountingDate", args.startAt).lte("accountingDate", args.endAt)).take(MAX_ROWS); }
  if (args.scopeType === "engagement" && args.scopeId) { const id = ctx.db.normalizeId("engagements", args.scopeId); if (!id) return []; return ctx.db.query("financeLedgerLines").withIndex("by_engagement_date", (q) => q.eq("organizationId", args.organizationId).eq("engagementId", id).gte("accountingDate", args.startAt).lte("accountingDate", args.endAt)).take(MAX_ROWS); }
  if (args.scopeType === "client" && args.scopeId) { const id = ctx.db.normalizeId("clients", args.scopeId); if (!id) return []; return ctx.db.query("financeLedgerLines").withIndex("by_client_date", (q) => q.eq("organizationId", args.organizationId).eq("clientId", id).gte("accountingDate", args.startAt).lte("accountingDate", args.endAt)).take(MAX_ROWS); }
  if (args.scopeType === "space" && args.scopeId) { const id = ctx.db.normalizeId("spaces", args.scopeId); if (!id) return []; return ctx.db.query("financeLedgerLines").withIndex("by_space_date", (q) => q.eq("organizationId", args.organizationId).eq("spaceId", id).gte("accountingDate", args.startAt).lte("accountingDate", args.endAt)).take(MAX_ROWS); }
  return ctx.db.query("financeLedgerLines").withIndex("by_period_account", (q) => q.eq("organizationId", args.organizationId).gte("accountingDate", args.startAt).lte("accountingDate", args.endAt)).take(MAX_ROWS);
}
function active<T extends { deletedAt?: number }>(item: T) { return !item.deletedAt; }
function activePayment<T extends { deletedAt?: number; status: string }>(item: T) { return !item.deletedAt && item.status === "recorded"; }
