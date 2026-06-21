"use client";

import React from "react";
import { type Client } from "../../../store/clients.types";
import { type ClientFormValues } from "../../../validation/client.schema";
import { EditableText } from "@/components/ui/editable-text";
import { EditableSelect } from "@/components/ui/editable-select";
import { Mail, Phone, Globe, User, Landmark, Tag } from "lucide-react";

interface ContactsTabProps {
  client: Client;
  onUpdate: (values: Partial<ClientFormValues>) => void;
}

const TYPE_OPTIONS = [
  { label: "Person", value: "person" as const },
  { label: "Organization", value: "organization" as const },
];

export function ContactsTab({ client, onUpdate }: ContactsTabProps) {
  return (
    <div className="space-y-6 text-start max-w-2xl">
      {/* Notion style properties block */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="bg-muted/40 px-4 py-2 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Contact Details
        </div>
        <div className="p-4 space-y-4 divide-y divide-border/50">
          
          {/* Email */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-4 pt-4 first:pt-0">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Mail className="h-4 w-4" />
              Email
            </div>
            <div className="text-sm font-medium text-foreground">
              <EditableText
                value={client.contact}
                onChange={(contact) => onUpdate({ contact })}
                placeholder="Add email address..."
                className="text-sm"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Phone className="h-4 w-4" />
              Phone
            </div>
            <div className="text-sm font-medium text-foreground">
              <EditableText
                value={client.phone || ""}
                onChange={(phone) => onUpdate({ phone })}
                placeholder="Add phone number..."
                className="text-sm"
              />
            </div>
          </div>

          {/* Type */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Landmark className="h-4 w-4" />
              Type
            </div>
            <div className="text-sm font-medium text-foreground">
              <EditableSelect
                value={client.type}
                options={TYPE_OPTIONS}
                onChange={(type) => onUpdate({ type })}
              />
            </div>
          </div>

          {/* Nationality */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Globe className="h-4 w-4" />
              Nationality
            </div>
            <div className="text-sm font-medium text-foreground">
              <EditableText
                value={client.nationality || ""}
                onChange={(nationality) => onUpdate({ nationality })}
                placeholder="Add nationality..."
                className="text-sm"
              />
            </div>
          </div>

          {/* Age */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <User className="h-4 w-4" />
              Age
            </div>
            <div className="text-sm font-medium text-foreground">
              <EditableText
                value={client.age ? String(client.age) : ""}
                onChange={(age) => onUpdate({ age })}
                placeholder="Add age..."
                className="text-sm"
              />
            </div>
          </div>

          {/* Generation */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Tag className="h-4 w-4" />
              Generation
            </div>
            <div className="text-sm font-medium text-foreground">
              <EditableText
                value={client.generation || ""}
                onChange={(generation) => onUpdate({ generation })}
                placeholder="Add generation..."
                className="text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
