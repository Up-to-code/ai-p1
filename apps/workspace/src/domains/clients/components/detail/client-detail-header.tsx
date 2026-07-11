"use client";

import React from "react";
import { type Client } from "../../store/clients.types";
import { type ClientFormValues } from "../../validation/client.schema";
import { EntityDetailHeader, type EntityDetailHeaderAction, type EntityDetailHeaderField } from "@/components/shared/entity-detail-header";
import { PhoneCall, Mail, Calendar, Trash2 } from "lucide-react";

interface ClientDetailHeaderProps {
  client: Client;
  onUpdate: (values: Partial<ClientFormValues>) => void;
  onSchedule: () => void;
  onDelete: () => void;
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

export function ClientDetailHeader({ client, onUpdate, onSchedule, onDelete }: ClientDetailHeaderProps) {
  const fields: EntityDetailHeaderField[] = [
    {
      type: "tags",
      value: client.tags || [],
      onChange: (tags) => onUpdate({ tags }),
      availableTags: ["VIP", "Agency", "Startup", "Enterprise", "Retail"],
    },
    {
      type: "select",
      value: client.status || "active",
      onChange: (status) => onUpdate({ status }),
      options: statusOptions,
      colorMapType: "client_status",
      defaultColors: defaultStatusColors,
    },
  ];

  const actions: EntityDetailHeaderAction[] = [
    {
      label: "Call",
      icon: PhoneCall,
      onClick: () => { if (client.phone) window.location.href = `tel:${client.phone}`; },
      disabled: !client.phone,
    },
    {
      label: "Email",
      icon: Mail,
      onClick: () => { if (client.contact) window.location.href = `mailto:${client.contact}`; },
      disabled: !client.contact,
    },
    {
      label: "Meeting",
      icon: Calendar,
      onClick: onSchedule,
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: onDelete,
      destructive: true,
    },
  ];

  return (
    <EntityDetailHeader
      name={client.name}
      title={client.name}
      onTitleChange={(name) => onUpdate({ name })}
      fields={fields}
      actions={actions}
    />
  );
}
