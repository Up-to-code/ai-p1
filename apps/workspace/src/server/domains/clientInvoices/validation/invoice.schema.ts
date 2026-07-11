import { z } from "zod";

export const invoicePayloadSchema = z.object({
  clientId: z.string().trim().min(1),
  invoiceNumber: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(200),
  amount: z.number().finite().nonnegative(),
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  status: z.enum(["draft", "sent", "paid", "overdue", "void"]),
  issueDate: z.string().date(),
  dueDate: z.string().date(),
  notes: z.string().trim().max(2000).optional().transform((value) => value || undefined),
});
