import { z } from "zod";
import { financeCurrencySchema, invoiceLineInputSchema } from "@qentrah/domain-contracts";

const timestamp = z.number().int().nonnegative();
export const financeInvoiceCommandSchema = z.object({ clientId: z.string().min(1), engagementId: z.string().optional(), projectId: z.string().optional(), issueAt: timestamp, dueAt: timestamp, currency: financeCurrencySchema, exchangeRateMicros: z.number().int().positive(), lines: z.array(invoiceLineInputSchema).min(1).max(250) });
export const financePaymentCommandSchema = z.object({ invoiceId: z.string().min(1), amountMinor: z.number().int().positive(), exchangeRateMicros: z.number().int().positive(), receivedAt: timestamp, method: z.string().trim().min(1), reference: z.string().trim().optional(), bankAccountId: z.string().optional() });
