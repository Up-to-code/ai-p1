"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { McpConnectionPermission, OrganizationMember } from "../../api";

export function AgentLinksPanel({
  organizationId: _organizationId,
  canRead,
  canCreate: _canCreate,
  canDelete: _canDelete,
  grantablePermissions: _grantablePermissions,
  members: _members,
}: {
  organizationId: string;
  canRead: boolean;
  canCreate: boolean;
  canDelete: boolean;
  grantablePermissions: McpConnectionPermission[];
  members: OrganizationMember[];
}) {
  if (!canRead) return null;

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><ShieldCheck className="h-4 w-4" /></span>
          <div>
            <h2 className="font-semibold text-foreground">OAuth agent access</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Secret agent links have been retired. Each agent now requires browser sign-in, organization selection, an explicit permission matrix, and an expiry.</p>
          </div>
        </div>
        <Button render={<Link href="/mcp?create=1" />}>Create MCP link</Button>
      </div>
    </section>
  );
}
