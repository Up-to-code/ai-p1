"use client";

import React, { useMemo, useState } from "react";
import { type Client } from "../../../store/clients.types";
import { type ClientFormValues } from "../../../validation/client.schema";
import { type ClientInvoice, type ClientInvoicePayload, type ClientInvoiceStatus } from "../../../store/client-invoices.types";
import { createInvoiceRequest, deleteInvoiceRequest, updateInvoiceRequest, useClientInvoicesQuery } from "../../../api/client-invoices";
import { DollarSign, Receipt, CreditCard, Landmark, Plus, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DeleteRecordDialog } from "@/components/shared/crud-ui";
import { Skeleton } from "@/components/ui/skeleton";
import { useOperationState } from "@/lib/utils/operation-state";

interface BillingTabProps { client: Client; organizationId: string; onUpdate: (values: Partial<ClientFormValues>) => void; }

const STATUS_OPTIONS: Array<{ value: ClientInvoiceStatus; label: string }> = [
  { value: "draft", label: "Draft" }, { value: "sent", label: "Sent" }, { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" }, { value: "void", label: "Void" },
];
const isoDate = (date?: Date) => date ? date.toISOString().slice(0, 10) : "";
const fromIsoDate = (value: string) => value ? new Date(`${value}T12:00:00`) : undefined;
const today = () => new Date().toISOString().slice(0, 10);

export function BillingTab({ client, organizationId, onUpdate }: BillingTabProps) {
  const invoicesQuery = useClientInvoicesQuery(organizationId, client.id);
  const invoices = invoicesQuery ?? [];
  const operation = useOperationState({ errorMessage: "Invoice action failed." });
  const [editing, setEditing] = useState<ClientInvoice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClientInvoice | null>(null);
  const [form, setForm] = useState<ClientInvoicePayload>({ clientId: client.id, invoiceNumber: "", title: "", amount: 0, currency: "USD", status: "draft", issueDate: today(), dueDate: today(), notes: "" });

  const totals = useMemo(() => ({
    outstanding: invoices.filter((invoice) => invoice.status === "sent" || invoice.status === "overdue").reduce((sum, invoice) => sum + invoice.amount, 0),
    paid: invoices.filter((invoice) => invoice.status === "paid").reduce((sum, invoice) => sum + invoice.amount, 0),
  }), [invoices]);

  const openCreate = () => {
    setEditing(null);
    setForm({ clientId: client.id, invoiceNumber: `INV-${String(invoices.length + 1).padStart(3, "0")}`, title: "", amount: 0, currency: "USD", status: "draft", issueDate: today(), dueDate: today(), notes: "" });
    setDialogOpen(true);
  };
  const openEdit = (invoice: ClientInvoice) => { setEditing(invoice); setForm({ clientId: invoice.clientId, invoiceNumber: invoice.invoiceNumber, title: invoice.title, amount: invoice.amount, currency: invoice.currency, status: invoice.status, issueDate: invoice.issueDate, dueDate: invoice.dueDate, notes: invoice.notes }); setDialogOpen(true); };
  const save = () => operation.run(async () => { if (editing) await updateInvoiceRequest(organizationId, editing.id, form); else await createInvoiceRequest(organizationId, form); setDialogOpen(false); });
  const remove = () => deleteTarget && operation.run(async () => { await deleteInvoiceRequest(organizationId, deleteTarget.id); setDeleteTarget(null); });
  const money = (amount: number, currency = "USD") => new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);

  if (invoicesQuery === undefined) return <div className="space-y-5"><Skeleton className="h-16 w-full" /><Skeleton className="h-40 w-full" /></div>;

  return (
    <div className="space-y-6 text-start">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={DollarSign} label="Client budget"><Input value={client.budget || ""} placeholder="0" onChange={(event) => onUpdate({ budget: event.target.value })} className="h-8 max-w-32 rounded-md border-transparent bg-transparent px-0 text-lg font-semibold shadow-none focus-visible:ring-0" /></Metric>
        <Metric icon={Receipt} label="Outstanding" value={money(totals.outstanding)} />
        <Metric icon={CreditCard} label="Paid YTD" value={money(totals.paid)} />
        <Metric icon={Landmark} label="Invoices" value={String(invoices.length)} />
      </div>

      <div className="border-y border-border">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Invoices</span>
          <Button size="sm" variant="ghost" className="h-8 rounded-md px-2 text-xs shadow-none" onClick={openCreate}><Plus className="mr-1 h-3.5 w-3.5" />Add invoice</Button>
        </div>
        {invoices.length === 0 ? <div className="py-10 text-center text-sm text-muted-foreground">No invoices yet. Add the first invoice to start tracking billing.</div> : (
          <div className="divide-y divide-border/70">
            {invoices.map((invoice) => <div key={invoice.id} className="grid grid-cols-[1fr_120px_110px_110px_36px] items-center gap-3 px-3 py-3 text-sm hover:bg-muted/20">
              <div className="min-w-0"><p className="truncate font-medium">{invoice.title}</p><p className="text-xs text-muted-foreground">{invoice.invoiceNumber} · Due {invoice.dueDate}</p></div>
              <span className="font-medium">{money(invoice.amount, invoice.currency)}</span>
              <span className="capitalize text-muted-foreground">{invoice.status}</span>
              <span className="text-xs text-muted-foreground">{invoice.issueDate}</span>
              <DropdownMenu><DropdownMenuTrigger render={<Button size="icon" variant="ghost" className="h-8 w-8 rounded-md shadow-none" aria-label={`Actions for ${invoice.invoiceNumber}`} />}><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => openEdit(invoice)}><Pencil className="h-4 w-4" />Edit</DropdownMenuItem><DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(invoice)}><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
            </div>)}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-w-2xl gap-0 p-0 shadow-none"><DialogHeader className="border-b border-border px-6 py-5"><DialogTitle>{editing ? "Edit invoice" : "New invoice"}</DialogTitle><DialogDescription>Record the invoice details for this client.</DialogDescription></DialogHeader><div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
        <Field label="Invoice number"><Input value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} className="h-9 rounded-md shadow-none" /></Field>
        <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-9 rounded-md shadow-none" /></Field>
        <Field label="Amount"><Input type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="h-9 rounded-md shadow-none" /></Field>
        <Field label="Currency"><Input value={form.currency} maxLength={3} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} className="h-9 rounded-md shadow-none" /></Field>
        <Field label="Status"><Select value={form.status} onValueChange={(value: string | null) => value && setForm({ ...form, status: value as ClientInvoiceStatus })}><SelectTrigger size="sm" className="h-9 rounded-md shadow-none"><SelectValue /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></Field>
        <div />
        <Field label="Issue date"><DatePicker date={fromIsoDate(form.issueDate)} setDate={(date) => setForm({ ...form, issueDate: isoDate(date) })} className="h-9 w-full rounded-md shadow-none" contentClassName="rounded-md shadow-none" /></Field>
        <Field label="Due date"><DatePicker date={fromIsoDate(form.dueDate)} setDate={(date) => setForm({ ...form, dueDate: isoDate(date) })} className="h-9 w-full rounded-md shadow-none" contentClassName="rounded-md shadow-none" /></Field>
        <Field label="Notes" className="sm:col-span-2"><Textarea value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="min-h-24 rounded-md shadow-none" /></Field>
      </div><DialogFooter className="border-t border-border bg-muted/20 px-6 py-4"><Button variant="outline" className="rounded-md shadow-none" onClick={() => setDialogOpen(false)}>Cancel</Button><Button className="rounded-md shadow-none" disabled={!form.title.trim() || !form.invoiceNumber.trim() || operation.isRunning} onClick={save}>{operation.isRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editing ? "Save changes" : "Create invoice"}</Button></DialogFooter></DialogContent></Dialog>
      <DeleteRecordDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)} title="Delete invoice?" description={`Delete ${deleteTarget?.invoiceNumber ?? "this invoice"}. This cannot be undone.`} onConfirm={remove} isDeleting={operation.isRunning} error={operation.error} />
    </div>
  );
}

function Metric({ icon: Icon, label, value, children }: { icon: typeof DollarSign; label: string; value?: string; children?: React.ReactNode }) { return <div className="flex items-center gap-3 border-l border-border py-2 pl-3"><Icon className="h-4 w-4 text-muted-foreground" /><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>{children ?? <p className="text-lg font-semibold">{value}</p>}</div></div>; }
function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) { return <label className={className}><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>{children}</label>; }
