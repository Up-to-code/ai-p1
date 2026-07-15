import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { normalizedKeywords } from "../search/adapters/shared";
import { writeSearchProjection } from "../search/projection";

export function invoiceSearchProjection(ctx: MutationCtx, invoice: Doc<"financeInvoices">) { return writeSearchProjection(ctx, projection(invoice, "invoice", `/finance?view=invoices&invoice=${invoice._id}`, invoice.number, `Invoice ${invoice.status}`, invoice.status, invoice.totalMinor, invoice.currency, invoice.projectId, invoice.engagementId, invoice.clientId)); }
export function expenseSearchProjection(ctx: MutationCtx, expense: Doc<"financeExpenses">) { return writeSearchProjection(ctx, projection(expense, "expense", `/finance?view=expenses&expense=${expense._id}`, expense.description, `Expense ${expense.status}`, expense.status, expense.amountMinor, expense.currency, expense.projectId, expense.engagementId, expense.clientId)); }
export function paymentSearchProjection(ctx: MutationCtx, payment: Doc<"financePayments">) { return writeSearchProjection(ctx, projection(payment, "payment", `/finance?view=payments&payment=${payment._id}`, payment.reference ?? payment.method, `${payment.direction} payment`, payment.status, payment.amountMinor, payment.currency, undefined, undefined, payment.clientId)); }

function projection(record: { organizationId: string; _id: string; updatedAt: number; deletedAt?: number }, resourceType: "invoice" | "expense" | "payment", route: string, title: string, subtitle: string, status: string, amountMinor: number, currency: string, projectId?: string, engagementId?: string, clientId?: string) {
  return { organizationId: record.organizationId, resourceType, resourceId: String(record._id), route, title, subtitle: `${subtitle} · ${amountMinor} ${currency} minor units`, searchText: `${title}\n${subtitle}\n${currency}`, keywords: normalizedKeywords([title, subtitle, status, currency]), locale: "en" as const, scopeType: projectId ? "project" as const : "organization" as const, spaceIds: [], projectIds: projectId ? [String(projectId)] : [], principalKeys: [`org:${record.organizationId}:member`], clientIds: clientId ? [String(clientId)] : [], statuses: [status], dateValue: record.updatedAt, sensitivity: "confidential" as const, sourceUpdatedAt: record.updatedAt, version: 1, deletedAt: record.deletedAt };
}
