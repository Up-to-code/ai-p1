import { z } from "zod";

export const financeCurrencySchema = z.string().trim().regex(/^[A-Z]{3}$/u);
export const financeAmountSchema = z.number().int();
export const financePositiveAmountSchema = z.number().int().positive();
export const financeAccountTypeSchema = z.enum(["asset", "liability", "equity", "revenue", "expense"]);
export const financeScopeTypeSchema = z.enum(["organization", "space", "project", "engagement", "client"]);
export const taxCalculationSchema = z.enum(["exclusive", "inclusive"]);

export const invoiceLineInputSchema = z.object({
  description: z.string().trim().min(1),
  quantity: z.number().int().positive(),
  unitAmountMinor: financeAmountSchema.nonnegative(),
  taxRuleId: z.string().optional(),
  projectId: z.string().optional(),
  engagementId: z.string().optional(),
});

export type FinanceAccountType = z.infer<typeof financeAccountTypeSchema>;
export type FinanceScopeType = z.infer<typeof financeScopeTypeSchema>;
export type InvoiceLineInput = z.infer<typeof invoiceLineInputSchema>;
