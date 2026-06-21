"use client";

import React from "react";
import { type Client } from "../../../store/clients.types";
import { type ClientFormValues } from "../../../validation/client.schema";
import { EditableText } from "@/components/ui/editable-text";
import { DollarSign, Receipt, CreditCard, Landmark } from "lucide-react";

interface BillingTabProps {
  client: Client;
  onUpdate: (values: Partial<ClientFormValues>) => void;
}

export function BillingTab({ client, onUpdate }: BillingTabProps) {
  return (
    <div className="space-y-6 text-start">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed / Budget */}
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Client Budget</p>
            <div className="text-lg font-black text-foreground">
              <EditableText
                value={client.budget || ""}
                onChange={(budget) => onUpdate({ budget })}
                placeholder="0"
                className="font-black text-lg"
              />
            </div>
          </div>
        </div>

        {/* Outstanding */}
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Outstanding</p>
            <p className="text-xl font-black text-foreground">$0.00</p>
          </div>
        </div>

        {/* Paid YTD */}
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Paid YTD</p>
            <p className="text-xl font-black text-foreground">$0.00</p>
          </div>
        </div>

        {/* Retainer balance */}
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Retainer Balance</p>
            <p className="text-xl font-black text-foreground">Not set</p>
          </div>
        </div>
      </div>

      {/* Invoices List Container */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        {/* Table Header */}
        <div className="bg-muted/40 px-4 py-2 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Invoices
        </div>
        <div className="p-8 text-center text-sm text-muted-foreground">
          No invoices have been linked to this client yet.
        </div>
      </div>
    </div>
  );
}
