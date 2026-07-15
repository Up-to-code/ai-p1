import type { Context } from "hono";
import type { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/auth-request";
import { readOrganizationId, workspaceReadJsonForOrganization } from "@/server/domains/organization/handlers/workspace-read-surface";
import { financeInvoiceCommandSchema, financePaymentCommandSchema } from "../validation/finance.schema";

export async function handleFinanceOverview(c: Context) {
  const organization = readOrganizationId(c); if (!organization.ok) return organization.response;
  const startAt = Number(c.req.query("startAt")); const endAt = Number(c.req.query("endAt")); if (!Number.isFinite(startAt) || !Number.isFinite(endAt) || endAt <= startAt) return c.json({ error: "A valid startAt and endAt range is required." }, 400);
  return workspaceReadJsonForOrganization(c, "finance overview", organization.data, (organizationId) => fetchAuthQuery(api.finance.read.overview, { organizationId, startAt, endAt }));
}

export async function handleFinanceRecords(c: Context) {
  const organization = readOrganizationId(c); if (!organization.ok) return organization.response; const view = c.req.query("view")?.trim(); if (!view) return c.json({ error: "Finance view is required." }, 400);
  return workspaceReadJsonForOrganization(c, "finance records", organization.data, (organizationId) => fetchAuthQuery(api.finance.read.records, { organizationId, view, limit: 200 }));
}

export async function handleCreateFinanceInvoice(c: Context) {
  const organization = readOrganizationId(c); if (!organization.ok) return organization.response; const parsed = financeInvoiceCommandSchema.safeParse(await c.req.json().catch(() => null)); if (!parsed.success) return c.json({ error: "Invalid finance invoice command.", issues: parsed.error.flatten().fieldErrors }, 400);
  const input = parsed.data; const invoiceId = await fetchAuthMutation(api.finance.commands.createInvoice, { organizationId: organization.data, clientId: input.clientId as Id<"clients">, engagementId: input.engagementId as Id<"engagements"> | undefined, projectId: input.projectId as Id<"projects"> | undefined, issueAt: input.issueAt, dueAt: input.dueAt, currency: input.currency, exchangeRateMicros: input.exchangeRateMicros, lines: input.lines.map((line) => ({ ...line, projectId: line.projectId as Id<"projects"> | undefined, engagementId: line.engagementId as Id<"engagements"> | undefined, taxRuleId: line.taxRuleId as Id<"financeTaxRules"> | undefined })) }); return c.json({ invoiceId }, 201);
}

export async function handlePostFinanceInvoice(c: Context) {
  const organization = readOrganizationId(c); if (!organization.ok) return organization.response; const invoiceId = c.req.param("invoiceId"); if (!invoiceId) return c.json({ error: "Invoice id is required." }, 400); const journalEntryId = await fetchAuthMutation(api.finance.commands.postInvoice, { organizationId: organization.data, invoiceId: invoiceId as Id<"financeInvoices"> }); return c.json({ journalEntryId });
}

export async function handleRecordFinancePayment(c: Context) {
  const organization = readOrganizationId(c); if (!organization.ok) return organization.response; const parsed = financePaymentCommandSchema.safeParse(await c.req.json().catch(() => null)); if (!parsed.success) return c.json({ error: "Invalid finance payment command.", issues: parsed.error.flatten().fieldErrors }, 400); const input = parsed.data; const paymentId = await fetchAuthMutation(api.finance.commands.recordInvoicePayment, { organizationId: organization.data, invoiceId: input.invoiceId as Id<"financeInvoices">, amountMinor: input.amountMinor, exchangeRateMicros: input.exchangeRateMicros, receivedAt: input.receivedAt, method: input.method, reference: input.reference, bankAccountId: input.bankAccountId as Id<"financeBankAccounts"> | undefined }); return c.json({ paymentId }, 201);
}
