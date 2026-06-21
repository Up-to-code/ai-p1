"use client";

import React from "react";
import { type Client } from "../../store/clients.types";
import { type ClientFormValues } from "../../validation/client.schema";
import { EditableText } from "@/components/ui/editable-text";
import { EditableTags } from "@/components/ui/editable-tags";
import { EditableSelect } from "@/components/ui/editable-select";
import { Button } from "@/components/ui/button";
import { PhoneCall, Mail, Calendar, Edit, Trash2 } from "lucide-react";

interface ClientDetailHeaderProps {
  client: Client;
  onUpdate: (values: Partial<ClientFormValues>) => void;
}

const statusOptions = [
  { label: "New", value: "new" as const },
  { label: "Active", value: "active" as const },
  { label: "Nurture", value: "nurture" as const },
  { label: "Inactive", value: "inactive" as const },
  { label: "Archived", value: "archived" as const },
];

const defaultStatusColors = {
  new: "blue" as const,
  active: "green" as const,
  nurture: "purple" as const,
  inactive: "gray" as const,
  archived: "red" as const,
};

export function ClientDetailHeader({ client, onUpdate }: ClientDetailHeaderProps) {
  return (
    <section className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-8">
      <div className="flex min-w-0 items-start gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-foreground text-2xl font-black uppercase text-background shadow-sm">
          {client.name.charAt(0)}
        </div>
        <div className="min-w-0 space-y-1.5 mt-1">
          <EditableText
            value={client.name}
            onChange={(name) => onUpdate({ name })}
            as="h1"
            className="max-w-3xl text-3xl font-black leading-tight text-foreground tracking-tight"
          />
          
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <EditableTags
              tags={client.tags || []}
              onChange={(tags) => onUpdate({ tags })}
              availableTags={["VIP", "Agency", "Startup", "Enterprise", "Retail"]}
            />
            
            <div className="h-4 w-px bg-border shrink-0" />
            
            <EditableSelect
              value={client.status || "active"}
              options={statusOptions}
              onChange={(status) => onUpdate({ status })}
              colorMapType="client_status"
              defaultColors={defaultStatusColors}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={() => window.location.href = `tel:${client.phone}`}
        >
          <PhoneCall className="mr-2 h-3.5 w-3.5" />
          Call
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={() => window.location.href = `mailto:${client.contact}`}
        >
          <Mail className="mr-2 h-3.5 w-3.5" />
          Email
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <Calendar className="mr-2 h-3.5 w-3.5" />
          Meeting
        </Button>
        
        <div className="h-4 w-px bg-border mx-1 shrink-0" />
        
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          title="Delete Client"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
