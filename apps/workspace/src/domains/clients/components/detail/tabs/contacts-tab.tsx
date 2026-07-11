"use client";

import React, { useEffect, useState } from "react";
import { type Client } from "../../../store/clients.types";
import { type ClientFormValues } from "../../../validation/client.schema";
import { Mail, Phone, Globe, User, Landmark, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ContactsTabProps {
  client: Client;
  onUpdate: (values: Partial<ClientFormValues>) => void;
}

const TYPE_OPTIONS = [
  { label: "Person", value: "person" as const },
  { label: "Organization", value: "organization" as const },
];

function ContactInput({
  value,
  placeholder,
  type = "text",
  onCommit,
}: {
  value?: string;
  placeholder: string;
  type?: React.HTMLInputTypeAttribute;
  onCommit: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value ?? "");

  useEffect(() => setDraft(value ?? ""), [value]);

  const commit = () => {
    const next = draft.trim();
    if (next !== (value ?? "")) onCommit(next);
  };

  return (
    <Input
      type={type}
      value={draft}
      placeholder={placeholder}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          setDraft(value ?? "");
          event.currentTarget.blur();
        }
      }}
      className="h-8 rounded-md border-transparent bg-transparent px-2 text-sm shadow-none hover:border-border focus-visible:border-border focus-visible:ring-0"
    />
  );
}

export function ContactsTab({ client, onUpdate }: ContactsTabProps) {
  return (
    <div className="w-full max-w-3xl space-y-6 text-start">
      {/* Notion style properties block */}
      <div className="overflow-hidden border-y border-border">
        <div className="bg-muted/40 px-4 py-2 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Contact Details
        </div>
        <div className="p-4 space-y-4 divide-y divide-border/50">
          
          {/* Email */}
          <div className="grid gap-2 pt-4 first:pt-0 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center sm:gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Mail className="h-4 w-4" />
              Email
            </div>
            <div className="min-w-0">
              <ContactInput
                value={client.contact}
                placeholder="Add email address..."
                type="email"
                onCommit={(contact) => onUpdate({ contact })}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="grid gap-2 pt-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center sm:gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Phone className="h-4 w-4" />
              Phone
            </div>
            <div className="min-w-0">
              <ContactInput
                value={client.phone || ""}
                placeholder="Add phone number..."
                type="tel"
                onCommit={(phone) => onUpdate({ phone })}
              />
            </div>
          </div>

          {/* Type */}
          <div className="grid gap-2 pt-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center sm:gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Landmark className="h-4 w-4" />
              Type
            </div>
            <div className="max-w-48">
              <Select value={client.type} onValueChange={(type: string | null) => type && onUpdate({ type: type as ClientFormValues["type"] })}>
                <SelectTrigger size="sm" className="h-8 rounded-md border-transparent bg-transparent px-2 text-sm shadow-none hover:border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Source */}
          <div className="grid gap-2 pt-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center sm:gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Globe className="h-4 w-4" />
              Source
            </div>
            <div className="min-w-0">
              <ContactInput value={client.source} placeholder="Add source..." onCommit={(source) => onUpdate({ source })} />
            </div>
          </div>

          <div className="grid gap-2 pt-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center sm:gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <User className="h-4 w-4" />
              Contact
            </div>
            <div className="min-w-0">
              <ContactInput value={client.contactName} placeholder="Add contact name..." onCommit={(contactName) => onUpdate({ contactName })} />
            </div>
          </div>

          <div className="grid gap-2 pt-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center sm:gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Building2 className="h-4 w-4" />
              Company
            </div>
            <div className="min-w-0">
              <ContactInput value={client.company} placeholder="Add company..." onCommit={(company) => onUpdate({ company })} />
            </div>
          </div>

          <div className="grid gap-2 pt-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center sm:gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Globe className="h-4 w-4" />
              Website
            </div>
            <div className="min-w-0">
              <ContactInput value={client.website} placeholder="Add website..." type="url" onCommit={(website) => onUpdate({ website })} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
