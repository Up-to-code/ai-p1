"use client";

import { useMemo, useState, useTransition } from "react";
import { Copy, Plus, RefreshCcw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Permission = {
  resource: "partner_apps" | "sandbox" | "guidance";
  actions: string[];
};

type Connection = {
  id: string;
  publicId: string;
  keyLast4: string;
  name: string;
  instructions?: string;
  permissions: Permission[];
  status: "active" | "paused" | "revoked";
  usageCount: number;
  lastUsedAt?: number;
  expiresAt?: number;
  createdAt: number;
  updatedAt: number;
};

const permissionOptions: Array<{
  id: string;
  label: string;
  helper: string;
  permission: Permission;
}> = [
  {
    id: "apps-read",
    label: "Read apps",
    helper: "List apps, inspect lifecycle status, review state, sync health, and next steps.",
    permission: { resource: "partner_apps", actions: ["read"] },
  },
  {
    id: "apps-write",
    label: "Create and update apps",
    helper: "Create drafts and update editable app metadata, redirect URIs, and scopes.",
    permission: { resource: "partner_apps", actions: ["create", "update"] },
  },
  {
    id: "apps-delete",
    label: "Delete apps",
    helper: "Allow the AI to delete owned partner apps when explicitly requested.",
    permission: { resource: "partner_apps", actions: ["delete"] },
  },
  {
    id: "apps-submit",
    label: "Submit for review",
    helper: "Allow the AI to submit editable apps into the review queue.",
    permission: { resource: "partner_apps", actions: ["submit"] },
  },
  {
    id: "sandbox-read",
    label: "Read sandbox status",
    helper: "Inspect sandbox setup and helper context for owned apps.",
    permission: { resource: "sandbox", actions: ["read"] },
  },
  {
    id: "guidance-read",
    label: "Read operator guidance",
    helper: "Explain what the AI can and cannot do inside Partners.",
    permission: { resource: "guidance", actions: ["read"] },
  },
];

async function readJson(response: Response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload.message === "string"
      ? payload.message
      : typeof payload.error === "string"
        ? payload.error
        : "Request failed.";
    if (message.includes("PartnerMcpConnection") || message.includes("does not exist in the current database")) {
      throw new Error("MCP storage is not ready yet. Apply the Partners Prisma migration, then refresh this page.");
    }
    throw new Error(message);
  }
  return payload;
}

function formatDate(value?: number) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function McpConnectionsClient({ initialConnections }: { initialConnections: Connection[] }) {
  const [connections, setConnections] = useState(initialConnections);
  const [name, setName] = useState("Partner app operator");
  const [instructions, setInstructions] = useState("Help me manage my Qentrah partner apps safely.");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState(permissionOptions.map((permission) => permission.id));
  const [oneTimeUrl, setOneTimeUrl] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const activeCount = useMemo(() => connections.filter((connection) => connection.status === "active").length, [connections]);
  const selectedPermissions = useMemo(() => {
    const grouped = new Map<Permission["resource"], Set<string>>();
    for (const option of permissionOptions) {
      if (!selectedPermissionIds.includes(option.id)) continue;
      const actions = grouped.get(option.permission.resource) ?? new Set<string>();
      for (const action of option.permission.actions) actions.add(action);
      grouped.set(option.permission.resource, actions);
    }
    return Array.from(grouped.entries()).map(([resource, actions]) => ({
      resource,
      actions: Array.from(actions),
    }));
  }, [selectedPermissionIds]);

  function refresh() {
    startTransition(async () => {
      setError("");
      try {
        const payload = await readJson(await fetch("/api/v1/mcp-connections", { cache: "no-store" }));
        setConnections(payload.connections ?? []);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Could not refresh MCP links.");
      }
    });
  }

  function createConnection() {
    startTransition(async () => {
      setError("");
      setOneTimeUrl("");
      try {
        const payload = await readJson(await fetch("/api/v1/mcp-connections", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name,
            instructions,
            permissions: selectedPermissions,
          }),
        }));
        setOneTimeUrl(payload.mcpUrl);
        setConnections((current) => [payload.connection, ...current]);
        setShowCreate(false);
      } catch (createError) {
        setError(createError instanceof Error ? createError.message : "Could not create MCP link.");
      }
    });
  }

  function togglePermission(permissionId: string) {
    setSelectedPermissionIds((current) =>
      current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId],
    );
  }

  function rotateConnection(connectionId: string) {
    startTransition(async () => {
      setError("");
      setOneTimeUrl("");
      try {
        const payload = await readJson(await fetch(`/api/v1/mcp-connections/${encodeURIComponent(connectionId)}/rotate`, { method: "POST" }));
        setOneTimeUrl(payload.mcpUrl);
        setConnections((current) => current.map((connection) => connection.id === connectionId ? payload.connection : connection));
      } catch (rotateError) {
        setError(rotateError instanceof Error ? rotateError.message : "Could not rotate MCP link.");
      }
    });
  }

  function revokeConnection(connectionId: string) {
    startTransition(async () => {
      setError("");
      try {
        await readJson(await fetch(`/api/v1/mcp-connections/${encodeURIComponent(connectionId)}`, { method: "DELETE" }));
        setConnections((current) => current.map((connection) => connection.id === connectionId ? { ...connection, status: "revoked" } : connection));
      } catch (revokeError) {
        setError(revokeError instanceof Error ? revokeError.message : "Could not revoke MCP link.");
      }
    });
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(oneTimeUrl);
  }

  return (
    <div className="space-y-4">
      <section className="command-panel overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase text-primary">AI operator links</p>
            <h2 className="mt-1 text-xl font-bold text-foreground">MCP connections</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-[6px] border border-border bg-muted px-2.5 py-1 font-mono text-xs font-bold text-muted-foreground sm:inline-flex">
              {activeCount} active
            </span>
            <Button type="button" onClick={() => setShowCreate((value) => !value)} className="gap-2 rounded-[6px]">
              {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showCreate ? "Close" : "Create MCP link"}
            </Button>
          </div>
        </div>

        {showCreate ? (
          <div className="border-b border-border bg-muted/35 p-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground" htmlFor="mcpName">Name</label>
                <input id="mcpName" value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-10 w-full rounded-[6px] border border-border bg-background px-3 text-sm text-foreground" />
                <label className="mt-4 block text-xs font-bold uppercase text-muted-foreground" htmlFor="mcpInstructions">Instructions</label>
                <textarea id="mcpInstructions" value={instructions} onChange={(event) => setInstructions(event.target.value)} className="mt-2 min-h-24 w-full rounded-[6px] border border-border bg-background px-3 py-2 text-sm text-foreground" />
              </div>
              <div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground">Permissions</p>
                    <p className="mt-1 text-sm text-muted-foreground">Choose what this MCP link should be allowed to do.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedPermissionIds(
                      selectedPermissionIds.length === permissionOptions.length ? [] : permissionOptions.map((permission) => permission.id),
                    )}
                    className="h-8 rounded-[6px] text-xs"
                  >
                    {selectedPermissionIds.length === permissionOptions.length ? "Clear all" : "Select all"}
                  </Button>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {permissionOptions.map((option) => (
                    <label key={option.id} className="flex cursor-pointer gap-3 rounded-[6px] border border-border bg-background p-3 transition-colors hover:bg-accent">
                      <input
                        type="checkbox"
                        checked={selectedPermissionIds.includes(option.id)}
                        onChange={() => togglePermission(option.id)}
                        className="mt-1 h-4 w-4 accent-[var(--primary)]"
                      />
                      <span>
                        <span className="block text-sm font-bold text-foreground">{option.label}</span>
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{option.helper}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <Button
                  type="button"
                  disabled={isPending || !name.trim() || selectedPermissions.length === 0}
                  onClick={createConnection}
                  className="mt-4 w-full gap-2 rounded-[6px] sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Create MCP URL
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {oneTimeUrl ? (
          <div className="border-b border-border bg-primary/10 p-4">
            <p className="text-sm font-bold text-foreground">Copy this MCP URL now. It will not be shown again.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <code className="min-w-0 flex-1 overflow-x-auto rounded-[6px] border border-border bg-background p-3 font-mono text-xs text-foreground">
                {oneTimeUrl}
              </code>
              <Button type="button" onClick={copyUrl} className="gap-2 rounded-[6px]">
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
          </div>
        ) : null}

        {error ? <p className="border-b border-border px-5 py-3 text-sm font-semibold text-destructive">{error}</p> : null}

        <div className="divide-y divide-border">
          {connections.length === 0 ? (
            <div className="p-6 text-sm leading-6 text-muted-foreground">
              No MCP links yet. Create one to connect ChatGPT, Claude, Cursor, Codex, or another MCP client to your Partners operator.
            </div>
          ) : connections.map((connection) => (
            <div key={connection.id} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">{connection.name}</h3>
                  <span className="rounded-[6px] border border-border bg-muted px-2 py-0.5 text-xs font-bold uppercase text-muted-foreground">{connection.status}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{connection.instructions || "No instructions provided."}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-[6px] border border-border bg-muted px-2 py-1 font-mono">secret ...{connection.keyLast4}</span>
                  <span className="rounded-[6px] border border-border bg-muted px-2 py-1">{connection.usageCount} calls</span>
                  <span className="rounded-[6px] border border-border bg-muted px-2 py-1">last used {formatDate(connection.lastUsedAt)}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                <Button type="button" variant="outline" disabled={isPending || connection.status === "revoked"} onClick={() => rotateConnection(connection.id)} className="gap-2 rounded-[6px]">
                  <RefreshCcw className="h-4 w-4" />
                  Rotate
                </Button>
                <Button type="button" variant="outline" disabled={isPending || connection.status === "revoked"} onClick={() => revokeConnection(connection.id)} className="gap-2 rounded-[6px]">
                  <Trash2 className="h-4 w-4" />
                  Revoke
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
