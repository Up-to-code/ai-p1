"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { requestOrganizationAction, organizationApiPath } from "@/domains/organization/api/organization-request";
import type { ClientInvoice, ClientInvoicePayload } from "../store/client-invoices.types";

export function useClientInvoicesQuery(organizationId: string | undefined, clientId: string) {
  return useQuery(api.clientInvoices.read.listByClient, organizationId && clientId ? { organizationId, clientId } : "skip");
}

export function createInvoiceRequest(organizationId: string, input: ClientInvoicePayload) {
  return requestOrganizationAction<{ invoice: ClientInvoice }>(organizationApiPath(organizationId, "client-invoices"), "POST", input, "Invoice request failed.");
}

export function updateInvoiceRequest(organizationId: string, invoiceId: string, input: ClientInvoicePayload) {
  return requestOrganizationAction<{ invoice: ClientInvoice }>(organizationApiPath(organizationId, "client-invoices", invoiceId), "PATCH", input, "Invoice request failed.");
}

export function deleteInvoiceRequest(organizationId: string, invoiceId: string) {
  return requestOrganizationAction(organizationApiPath(organizationId, "client-invoices", invoiceId), "DELETE", undefined, "Invoice request failed.");
}
