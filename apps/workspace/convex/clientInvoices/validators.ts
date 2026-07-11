import { v } from "convex/values";

export const invoiceStatusValidator = v.union(
  v.literal("draft"), v.literal("sent"), v.literal("paid"), v.literal("overdue"), v.literal("void"),
);

export const invoiceInputValidator = v.object({
  clientId: v.string(),
  invoiceNumber: v.string(),
  title: v.string(),
  amount: v.number(),
  currency: v.string(),
  status: invoiceStatusValidator,
  issueDate: v.string(),
  dueDate: v.string(),
  notes: v.optional(v.string()),
});

export const invoiceValidator = v.object({
  _id: v.id("clientInvoices"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  clientId: v.string(),
  invoiceNumber: v.string(),
  title: v.string(),
  amount: v.number(),
  currency: v.string(),
  status: invoiceStatusValidator,
  issueDate: v.string(),
  dueDate: v.string(),
  notes: v.optional(v.string()),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});
