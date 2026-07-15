import { Hono } from "hono";
import { handleCreateFinanceInvoice, handleFinanceOverview, handleFinanceRecords, handlePostFinanceInvoice, handleRecordFinancePayment } from "@/server/domains/finance/handlers/finance";

export const financeSubRouter = new Hono();
financeSubRouter.get("/:organizationId/read/finance/overview", handleFinanceOverview);
financeSubRouter.get("/:organizationId/read/finance/records", handleFinanceRecords);
financeSubRouter.post("/:organizationId/finance/invoices", handleCreateFinanceInvoice);
financeSubRouter.post("/:organizationId/finance/invoices/:invoiceId/post", handlePostFinanceInvoice);
financeSubRouter.post("/:organizationId/finance/payments", handleRecordFinancePayment);
