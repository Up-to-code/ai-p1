export type ClientInvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";

export interface ClientInvoicePayload {
  clientId: string;
  invoiceNumber: string;
  title: string;
  amount: number;
  currency: string;
  status: ClientInvoiceStatus;
  issueDate: string;
  dueDate: string;
  notes?: string;
}

export interface ClientInvoice extends ClientInvoicePayload {
  id: string;
  organizationId: string;
  createdByUserId: string;
  createdAt: number;
  updatedAt: number;
}
