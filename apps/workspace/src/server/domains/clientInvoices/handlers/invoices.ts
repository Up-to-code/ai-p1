import { createDomainRouter } from "@/server/utils/create-domain-router";
import { invoicePayloadSchema } from "../validation/invoice.schema";
import { api } from "@convex/_generated/api";

export const { handleCreate: handleCreateInvoice, handleUpdate: handleUpdateInvoice, handleDelete: handleDeleteInvoice } = createDomainRouter({
  resourceName: "invoice",
  createSchema: invoicePayloadSchema,
  updateSchema: invoicePayloadSchema,
  resourceIdParam: "invoiceId",
  convex: { create: api.clientInvoices.write.createFromHono, update: api.clientInvoices.write.updateFromHono, delete: api.clientInvoices.write.deleteFromHono },
});
