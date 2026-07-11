"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bot, Check, Copy, KeyRound, Loader2, Plus, ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useAuthSession } from "@/domains/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  createOrganizationMcpConnection,
  getOrganizationCapabilities,
  listOrganizationMcpConnections,
  type McpConnectionPermission,
  type McpPermissionAction,
  type McpPermissionResource,
  type OrganizationCapabilities,
  type OrganizationMcpConnection,
} from "@/domains/organization/api";
import {
  agentPermissionActions,
  grantableAgentPermissions,
  toggleAgentPermission,
} from "@/domains/organization/agent-permissions";

const resources: Array<{ resource: McpPermissionResource; label: string }> = [
  { resource: "organization", label: "Organization" },
  { resource: "space", label: "Spaces" },
  { resource: "project", label: "Projects" },
  { resource: "task", label: "Tasks" },
  { resource: "client", label: "Clients" },
  { resource: "deal", label: "Deals" },
  { resource: "calendar", label: "Calendar" },
  { resource: "media", label: "Media" },
];

const actions: McpPermissionAction[] = ["read", "create", "update", "delete"];

function permissionActions(permissions: McpConnectionPermission[], resource: McpPermissionResource) {
  return agentPermissionActions(permissions, resource);
}

function clampPermissions(
  permissions: McpConnectionPermission[],
  grantable: McpConnectionPermission[],
) {
  return grantable
    .map((permission) => ({
      resource: permission.resource,
      actions: permission.actions.filter((action) => permissionActions(permissions, permission.resource).includes(action)),
    }))
    .filter((permission) => permission.actions.length > 0);
}

function readOnlyPermissions(grantable: McpConnectionPermission[]) {
  return grantable
    .filter((permission) => permission.actions.includes("read"))
    .map((permission) => ({ resource: permission.resource, actions: ["read" as const] }));
}

function workPermissions(grantable: McpConnectionPermission[]) {
  return clampPermissions(
    grantable.map((permission) => ({
      resource: permission.resource,
      actions: ["read", "create", "update"] as McpPermissionAction[],
    })),
    grantable,
  );
}

function crmPermissions(grantable: McpConnectionPermission[]) {
  const crm = new Set<McpPermissionResource>(["client", "deal"]);
  return clampPermissions(
    grantable.map((permission) => ({
      resource: permission.resource,
      actions: crm.has(permission.resource) ? ["read", "create", "update"] : [],
    })),
    grantable,
  );
}

function connectionStatus(connection: OrganizationMcpConnection) {
  return connection.status === "active" && connection.usageCount === 0
    ? "Pending"
    : connection.status.charAt(0).toUpperCase() + connection.status.slice(1);
}

export function PersonalMcpScreen() {
  const session = useAuthSession();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const organizationId = session.organization.id ?? "";
  const [createOpen, setCreateOpen] = useState(searchParams.get("create") === "1");
  const [name, setName] = useState("My Assistant");
  const [permissions, setPermissions] = useState<McpConnectionPermission[]>([]);
  const [approved, setApproved] = useState(false);
  const [agentLink, setAgentLink] = useState("");

  const capabilitiesQuery = useQuery({
    queryKey: ["mcp", "personal", "capabilities", organizationId],
    queryFn: () => getOrganizationCapabilities(organizationId),
    enabled: Boolean(organizationId),
  });
  const connectionsQuery = useQuery({
    queryKey: ["mcp", "personal", "connections", organizationId],
    queryFn: () => listOrganizationMcpConnections(organizationId),
    enabled: Boolean(organizationId),
  });

  const grantable = useMemo(
    () => grantableAgentPermissions(capabilitiesQuery.data as OrganizationCapabilities | undefined),
    [capabilitiesQuery.data],
  );
  const selectedPermissions = useMemo(() => clampPermissions(permissions, grantable), [grantable, permissions]);

  const createMutation = useMutation({
    mutationFn: () => createOrganizationMcpConnection(organizationId, {
      name: name.trim(),
      principalType: "user",
      permissions: selectedPermissions,
      scope: { type: "organization" },
    }),
    onSuccess: async (result) => {
      setAgentLink(result.agentLink);
      await connectionsQuery.refetch();
      await navigator.clipboard?.writeText(result.agentLink).catch(() => undefined);
      toast({ title: "MCP created", description: "The one-time link was copied.", type: "success" });
    },
    onError: (error) => toast({ title: "MCP could not be created", description: error.message, type: "error" }),
  });

  function openCreate() {
    setAgentLink("");
    setApproved(false);
    setName("My Assistant");
    setPermissions(readOnlyPermissions(grantable));
    setCreateOpen(true);
  }

  function chooseQuickAction(kind: "full" | "read" | "work" | "crm") {
    setAgentLink("");
    setApproved(false);
    if (kind === "full") setPermissions(grantable);
    if (kind === "read") setPermissions(readOnlyPermissions(grantable));
    if (kind === "work") setPermissions(workPermissions(grantable));
    if (kind === "crm") setPermissions(crmPermissions(grantable));
  }

  function toggle(resource: McpPermissionResource, action: McpPermissionAction) {
    setPermissions((current) => toggleAgentPermission(current, grantable, resource, action));
  }

  const connections = (connectionsQuery.data ?? []).filter(
    (connection) => connection.principalType === "user" && connection.principalUserId === session.user.id,
  );
  const canCreate = Boolean(capabilitiesQuery.data?.canReadOrganization) && Boolean(name.trim()) && selectedPermissions.length > 0 && approved;

  return (
    <main className="h-[calc(100dvh-4rem)] min-h-0 overflow-y-auto bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6 pb-10">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Personal</p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {createOpen ? "MCP for your agent" : "MCPs"}
            </h1>
          </div>
          {!createOpen && <Button onClick={openCreate} className="rounded-lg"><Plus className="me-2 h-4 w-4" />Create MCP</Button>}
        </header>

        {createOpen ? (
          <section className="rounded-xl border border-border bg-card p-4 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setCreateOpen(false)} aria-label="Back"><ArrowLeft className="h-4 w-4" /></Button>
              <div><h2 className="text-lg font-bold text-foreground">Create MCP</h2><p className="text-xs text-muted-foreground">Choose a quick action or customize access.</p></div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["full", "Full control"],
                ["read", "Read only"],
                ["work", "Work"],
                ["crm", "Clients & deals"],
              ].map(([kind, label]) => (
                <button key={kind} type="button" onClick={() => chooseQuickAction(kind as "full" | "read" | "work" | "crm")} className="rounded-lg border border-border bg-background px-3 py-3 text-start text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary/5">
                  <KeyRound className="mb-2 h-4 w-4 text-primary" />{label}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <label className="text-sm font-medium text-foreground">Name<Input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-10 rounded-lg" /></label>
              <div className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">Personal connection</div>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg border border-border">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-sm">
                  <thead className="bg-muted/60 text-xs text-muted-foreground"><tr><th className="px-3 py-2 text-start font-semibold">Custom authorization</th>{actions.map((action) => <th key={action} className="px-3 py-2 text-center font-semibold capitalize">{action}</th>)}</tr></thead>
                  <tbody className="divide-y divide-border">
                    {resources.map(({ resource, label }) => {
                      const allowed = grantable.find((permission) => permission.resource === resource)?.actions ?? [];
                      const selected = permissionActions(permissions, resource);
                      return <tr key={resource}><td className="px-3 py-2.5 font-medium text-foreground">{label}</td>{actions.map((action) => <td key={action} className="px-3 py-2.5 text-center"><input aria-label={`${label} ${action}`} type="checkbox" checked={selected.includes(action)} disabled={!allowed.includes(action)} onChange={() => toggle(resource, action)} className="h-4 w-4 rounded border-border accent-primary disabled:opacity-30" /></td>)}</tr>;
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <label className="mt-5 flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={approved} onChange={(event) => setApproved(event.target.checked)} className="h-4 w-4 accent-primary" />I approve these permissions.</label>

            {agentLink && <div className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-300/50 bg-emerald-50/60 p-3 dark:bg-emerald-950/20"><Check className="h-4 w-4 shrink-0 text-emerald-600" /><Input readOnly value={agentLink} className="min-w-0 bg-background font-mono text-xs" /><Button variant="outline" size="icon" onClick={() => navigator.clipboard?.writeText(agentLink)} aria-label="Copy link"><Copy className="h-4 w-4" /></Button></div>}

            <div className="mt-5 flex justify-end gap-2"><Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button><Button disabled={!canCreate || createMutation.isPending} onClick={() => createMutation.mutate()}>{createMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="me-2 h-4 w-4" />}Approve & create</Button></div>
          </section>
        ) : (
          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="bg-muted/60 text-xs text-muted-foreground"><tr><th className="px-4 py-3 text-start font-semibold">Name</th><th className="px-4 py-3 text-start font-semibold">Permissions</th><th className="px-4 py-3 text-start font-semibold">Status</th><th className="px-4 py-3 text-end font-semibold">Usage</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {connections.map((connection) => <tr key={connection.id} className="hover:bg-muted/30"><td className="px-4 py-3"><div className="flex items-center gap-2 font-medium text-foreground"><Bot className="h-4 w-4 text-muted-foreground" />{connection.name}</div></td><td className="px-4 py-3 text-muted-foreground">{connection.permissions.reduce((total, permission) => total + permission.actions.length, 0)}</td><td className="px-4 py-3 text-muted-foreground">{connectionStatus(connection)}</td><td className="px-4 py-3 text-end text-muted-foreground">{connection.usageCount}</td></tr>)}
                  {!connectionsQuery.isLoading && connections.length === 0 && <tr><td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">No personal MCPs</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
