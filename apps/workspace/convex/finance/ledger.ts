import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { assertBalanced } from "./calculation";

export type LedgerLineInput = Readonly<{
  accountId: Id<"financeAccounts">; currency: string; debitMinor: number; creditMinor: number; debitBaseMinor: number; creditBaseMinor: number; description?: string;
  clientId?: Id<"clients">; engagementId?: Id<"engagements">; projectId?: Id<"projects">; spaceId?: Id<"spaces">; serviceKey?: string;
}>;

export async function requireFinanceSettings(ctx: MutationCtx, organizationId: string) {
  const settings = await ctx.db.query("financeSettings").withIndex("by_org", (q) => q.eq("organizationId", organizationId)).unique();
  if (!settings || settings.deletedAt) throw financeError("FINANCE_NOT_CONFIGURED", "Configure Finance before posting transactions.");
  return settings;
}

export async function systemAccount(ctx: MutationCtx, organizationId: string, key: Doc<"financeAccounts">["systemKey"]) {
  const account = await ctx.db.query("financeAccounts").withIndex("by_org_system", (q) => q.eq("organizationId", organizationId).eq("systemKey", key)).unique();
  if (!account || !account.active || account.deletedAt) throw financeError("FINANCE_ACCOUNT_MISSING", `Required ${key} account is unavailable.`);
  return account;
}

export async function assertAccountingDateOpen(ctx: MutationCtx, organizationId: string, accountingDate: number) {
  const settings = await requireFinanceSettings(ctx, organizationId);
  if (settings.lockDate !== undefined && accountingDate <= settings.lockDate) throw financeError("ACCOUNTING_DATE_LOCKED", "The accounting date is in a locked period.");
  const periods = await ctx.db.query("financeAccountingPeriods").withIndex("by_org_end", (q) => q.eq("organizationId", organizationId).gte("endAt", accountingDate)).take(24);
  const period = periods.find((item) => !item.deletedAt && item.startAt <= accountingDate && item.endAt >= accountingDate);
  if (!period) throw financeError("ACCOUNTING_PERIOD_REQUIRED", "No accounting period covers this date.");
  if (period.status !== "open") throw financeError("ACCOUNTING_PERIOD_CLOSED", "The accounting period is closed.");
  return { settings, period };
}

export async function postJournal(ctx: MutationCtx, input: { organizationId: string; accountingDate: number; description: string; sourceType: string; sourceId: string; actorUserId: string; lines: LedgerLineInput[]; reversalOfId?: Id<"financeJournalEntries"> }) {
  const { settings } = await assertAccountingDateOpen(ctx, input.organizationId, input.accountingDate);
  assertBalanced(input.lines.map((line) => ({ debitBaseMinor: line.debitBaseMinor, creditBaseMinor: line.creditBaseMinor })));
  const transactionDebits = input.lines.reduce((sum, line) => sum + line.debitMinor, 0); const transactionCredits = input.lines.reduce((sum, line) => sum + line.creditMinor, 0);
  if (transactionDebits !== transactionCredits) throw financeError("JOURNAL_TRANSACTION_UNBALANCED", "Journal transaction-currency debits and credits must balance.");
  const now = Date.now();
  const id = await ctx.db.insert("financeJournalEntries", { organizationId: input.organizationId, number: `JE-${now}`, accountingDate: input.accountingDate, description: input.description, status: "posted", sourceType: input.sourceType, sourceId: input.sourceId, reversalOfId: input.reversalOfId, postedByUserId: input.actorUserId, postedAt: now, createdByUserId: input.actorUserId, createdAt: now, updatedAt: now });
  await Promise.all(input.lines.map((line) => ctx.db.insert("financeLedgerLines", { organizationId: input.organizationId, journalEntryId: id, accountId: line.accountId, accountingDate: input.accountingDate, currency: line.currency, debitMinor: line.debitMinor, creditMinor: line.creditMinor, baseCurrency: settings.baseCurrency, debitBaseMinor: line.debitBaseMinor, creditBaseMinor: line.creditBaseMinor, description: line.description, clientId: line.clientId, engagementId: line.engagementId, projectId: line.projectId, spaceId: line.spaceId, serviceKey: line.serviceKey, createdAt: now })));
  return id;
}

export function financeError(code: string, message: string) { return new ConvexError({ code, message }); }
