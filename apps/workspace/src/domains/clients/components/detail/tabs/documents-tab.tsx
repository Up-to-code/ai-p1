"use client";

import React from "react";
import { type Client } from "../../../store/clients.types";
import { ClientDocumentsManager } from "@/domains/media/components/client-documents-manager";

interface DocumentsTabProps {
  client: Client;
  organizationId: string;
}

export function DocumentsTab({ client, organizationId }: DocumentsTabProps) {
  return (
    <div className="text-start">
      <ClientDocumentsManager
        organizationId={organizationId}
        clientId={client.id}
      />
    </div>
  );
}
