"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { McpAction, McpPermission, McpResource } from "@qentrah/mcp-contracts";
import {
  AlertTriangle, Bot, Copy, Ellipsis, ExternalLink, Loader2, Pencil,
  Plus, ShieldCheck, Trash2,
} from "lucide-react";
import { useAuthSession } from "@/domains/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import {
  buildMcpConfigJson, buildMcpSetupPrompt, buildOpenAiMcpToolPrompt, defaultMcpEndpoint,
} from "../mcp-connection-prompts";

const resources: Array<{ id: McpResource; label: string; actions: McpAction[] }> = [
  { id: "organization", label: "Organization", actions: ["read"] },
  { id: "space", label: "Spaces", actions: ["read", "create", "update", "delete"] },
  { id: "project", label: "Projects", actions: ["read", "create", "update", "delete"] },
  { id: "client", label: "Clients", actions: ["read", "create", "update", "delete"] },
  { id: "deal", label: "Deals", actions: ["read", "create", "update", "delete"] },
  { id: "task", label: "Tasks", actions: ["read", "create", "update", "delete"] },
  { id: "calendar", label: "Calendar", actions: ["read", "create", "update", "delete"] },
  { id: "media", label: "Media", actions: ["read", "create", "update", "delete"] },
];
const actions: McpAction[] = ["read", "create", "update", "delete"];

type Profile = NonNullable<ReturnType<typeof useQuery<typeof api.mcp.connectionProfiles.listMine>>>[number];
type ClientId = "codex" | "claude" | "chatgpt" | "grok" | "vscode" | "openai";

const clients: Array<{ id: ClientId; label: string; logo: string }> = [
  { id: "codex", label: "Codex", logo: "/brands/mcp/openai.svg" },
  { id: "claude", label: "Claude", logo: "/brands/mcp/claude.svg" },
  { id: "chatgpt", label: "ChatGPT", logo: "/brands/mcp/chatgpt.svg" },
  { id: "grok", label: "Grok", logo: "/brands/mcp/grok.svg" },
  { id: "vscode", label: "VS Code", logo: "/brands/mcp/vscode.svg" },
  { id: "openai", label: "OpenAI API", logo: "/brands/mcp/openai.svg" },
];

type PermissionPreset = "read" | "editor" | "owner";

function presetPermissions(preset: PermissionPreset): McpPermission[] {
  return resources.map(({ id }) => ({
    resource: id,
    actions: id === "organization"
      ? ["read"]
      : preset === "read"
        ? ["read"]
        : preset === "editor"
          ? ["read", "create", "update"]
          : ["read", "create", "update", "delete"],
  }));
}

function permissionCount(permissions: McpPermission[]) {
  return permissions.reduce((total, permission) => total + permission.actions.length, 0);
}

function permissionText(permissions: McpPermission[]) {
  return permissions
    .filter((permission) => permission.actions.length)
    .map((permission) => `${permission.resource}:${permission.actions.join("+")}`)
    .join(", ");
}

function profileUrl(profile: Pick<Profile, "publicId">) {
  const url = new URL(defaultMcpEndpoint);
  url.searchParams.set("profile", profile.publicId);
  return url.toString();
}

export function PersonalMcpScreen() {
  const session = useAuthSession();
  const { toast } = useToast();
  const organizationId = session.organization.id ?? "";
  const profiles = useQuery(api.mcp.connectionProfiles.listMine, organizationId ? { organizationId } : "skip");
  const removeProfile = useMutation(api.mcp.connectionProfiles.remove);
  const [editing, setEditing] = useState<Profile | "new" | null>(null);
  const [connectProfile, setConnectProfile] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState<Profile | null>(null);

  async function copy(value: string, title = "Copied") {
    await navigator.clipboard.writeText(value);
    toast({ title, description: "Ready to paste into your agent.", type: "success" });
  }

  async function remove() {
    if (!deleting) return;
    try {
      await removeProfile({ profileId: deleting.id });
      setDeleting(null);
      toast({ title: "MCP deleted", description: "The saved profile was removed.", type: "success" });
    } catch (error) {
      toast({ title: "Could not delete MCP", description: error instanceof Error ? error.message : "Try again.", type: "error" });
    }
  }

  return (
    <main className="h-[calc(100dvh-4rem)] min-h-0 overflow-y-auto bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6 pb-10">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">MCP connections</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage the agents that can request access to Qentrah.</p>
          </div>
          <Button onClick={() => setEditing("new")}><Plus className="me-2 h-4 w-4" />New MCP</Button>
        </header>

        <section className="overflow-hidden rounded-lg border border-border bg-card">
          {profiles === undefined ? (
            <div className="flex h-52 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />Loading MCPs
            </div>
          ) : profiles.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-muted/40"><Bot className="h-5 w-5" /></span>
              <h2 className="font-semibold text-foreground">No MCP connections yet</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">Create one, choose its permissions, then connect your AI client with browser OAuth.</p>
              <Button className="mt-5" onClick={() => setEditing("new")}><Plus className="me-2 h-4 w-4" />New MCP</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead><TableHead>Permissions</TableHead><TableHead>Scope</TableHead><TableHead>Updated</TableHead><TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <button type="button" className="flex items-center gap-3 text-start" onClick={() => setConnectProfile(profile)}>
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted"><Bot className="h-4 w-4" /></span>
                          <span><span className="block font-medium text-foreground">{profile.name}</span><span className="block max-w-64 truncate text-xs text-muted-foreground">{profile.description || "Remote OAuth MCP"}</span></span>
                        </button>
                      </TableCell>
                      <TableCell><span className="inline-flex rounded-md bg-muted px-2 py-1 text-xs font-medium">{permissionCount(profile.permissions)} allowed</span></TableCell>
                      <TableCell className="capitalize text-muted-foreground">{profile.scope.type}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(profile.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${profile.name}`} />}><Ellipsis /></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => setConnectProfile(profile)}><ExternalLink />Connect</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditing(profile)}><Pencil />Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => void copy(profileUrl(profile), "MCP URL copied")}><Copy />Copy URL</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={() => setDeleting(profile)}><Trash2 />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>

      <McpEditor
        organizationId={organizationId}
        profile={editing}
        onOpenChange={(open) => { if (!open) setEditing(null); }}
        onSaved={(profile) => { setEditing(null); setConnectProfile(profile); }}
      />
      <ConnectDialog profile={connectProfile} onOpenChange={(open) => { if (!open) setConnectProfile(null); }} onCopy={copy} />
      <Dialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open) setDeleting(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Delete MCP?</DialogTitle><DialogDescription>This removes the saved configuration. Existing OAuth approval can still be revoked separately.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button><Button variant="destructive" onClick={() => void remove()}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function McpEditor({ organizationId, profile, onOpenChange, onSaved }: {
  organizationId: string;
  profile: Profile | "new" | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (profile: Profile) => void;
}) {
  const { toast } = useToast();
  const createProfile = useMutation(api.mcp.connectionProfiles.create);
  const updateProfile = useMutation(api.mcp.connectionProfiles.update);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const spaces = useQuery(api.spaces.read.options, organizationId && profile ? { organizationId, limit: 100 } : "skip");
  const projects = useQuery(api.projects.read.list, organizationId && profile ? { organizationId } : "skip");
  const [permissions, setPermissions] = useState<McpPermission[]>(() => presetPermissions("editor"));
  const [scopeType, setScopeType] = useState<"organization" | "space" | "project">("organization");
  const [selectedSpaceIds, setSelectedSpaceIds] = useState<string[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmingDestructiveSave, setConfirmingDestructiveSave] = useState(false);
  const identity = profile === "new" ? "new" : profile?.id;

  useEffect(() => {
    setName(profile && profile !== "new" ? profile.name : "Qentrah agent");
    setDescription(profile && profile !== "new" ? profile.description ?? "" : "");
    setPermissions(profile && profile !== "new" ? profile.permissions : presetPermissions("editor"));
    setScopeType(profile && profile !== "new" ? profile.scope.type : "organization");
    setSelectedSpaceIds(profile && profile !== "new" ? profile.scope.spaceIds ?? [] : []);
    setSelectedProjectIds(profile && profile !== "new" ? profile.scope.projectIds ?? [] : []);
  }, [identity]);

  const hasDeletePermission = permissions.some((permission) => permission.actions.includes("delete"));
  const scopeIsValid = scopeType === "organization" || (scopeType === "space" ? selectedSpaceIds.length > 0 : selectedProjectIds.length > 0);

  function toggle(resource: McpResource, action: McpAction) {
    setPermissions((current) => current.map((permission) => {
      if (permission.resource !== resource) return permission;
      return {
        ...permission,
        actions: permission.actions.includes(action)
          ? permission.actions.filter((candidate) => candidate !== action)
          : [...permission.actions, action],
      };
    }));
  }

  function toggleScopeId(kind: "space" | "project", id: string) {
    const setter = kind === "space" ? setSelectedSpaceIds : setSelectedProjectIds;
    setter((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function save() {
    if (!profile || !name.trim()) return;
    if (hasDeletePermission) {
      setConfirmingDestructiveSave(true);
      return;
    }
    void persistProfile();
  }

  async function persistProfile() {
    if (!profile || !name.trim()) return;
    setSaving(true);
    try {
      const scope = scopeType === "space"
        ? { type: "space" as const, spaceIds: selectedSpaceIds as Id<"spaces">[] }
        : scopeType === "project"
          ? { type: "project" as const, projectIds: selectedProjectIds as Id<"projects">[] }
          : { type: "organization" as const };
      const input = { name, description: description || undefined, permissions, scope };
      const saved = profile === "new"
        ? await createProfile({ ...input, organizationId })
        : await updateProfile({ ...input, profileId: profile.id });
      onSaved(saved);
      toast({ title: profile === "new" ? "MCP created" : "MCP updated", description: "Choose a client to connect with OAuth.", type: "success" });
    } catch (error) {
      toast({ title: "Could not save MCP", description: error instanceof Error ? error.message : "Try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Dialog open={Boolean(profile)} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80dvh] w-[80dvw] max-w-none flex-col gap-0 overflow-hidden p-0" containerClassName="p-3 md:p-6">
        <DialogHeader className="border-b border-border px-6 py-4">
          <div className="mx-auto w-full max-w-5xl">
            <DialogTitle>{profile === "new" ? "New MCP" : "Edit MCP"}</DialogTitle>
            <DialogDescription className="mt-1">Set the agent identity and the maximum permissions it may request during OAuth approval.</DialogDescription>
          </div>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="mx-auto w-full max-w-5xl space-y-3">
            <section className="space-y-4 rounded-lg border border-border bg-muted/15 p-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Agent configuration</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Name the agent and define where it can operate.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5 text-xs font-medium text-muted-foreground">Agent name<Input value={name} onChange={(event) => setName(event.target.value)} className="bg-background text-sm text-foreground" /></label>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Access scope</label>
                  <Select value={scopeType} onValueChange={(value: string | null) => value && setScopeType(value as typeof scopeType)}>
                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="organization">Entire organization</SelectItem><SelectItem value="space">Selected spaces</SelectItem><SelectItem value="project">Selected projects</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <label className="block space-y-1.5 text-xs font-medium text-muted-foreground">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe what this agent should do" rows={3} className="block w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground" /></label>
              {scopeType === "space" && <ScopeOptions title="Spaces" empty="No spaces are available." items={(spaces ?? []).map((space) => ({ id: space.id, name: space.name }))} selected={selectedSpaceIds} onToggle={(id) => toggleScopeId("space", id)} />}
              {scopeType === "project" && <ScopeOptions title="Projects" empty="No projects are available." items={(projects ?? []).map((project) => ({ id: project._id, name: project.name }))} selected={selectedProjectIds} onToggle={(id) => toggleScopeId("project", id)} />}
            </section>
            <div className="min-w-0">
              <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <h3 className="font-medium text-foreground">Permissions</h3>
                  <p className="text-sm text-muted-foreground">Maximum access the agent may request through OAuth.</p>
                </div>
                <div className="flex gap-2" aria-label="Permission presets">{(["read", "editor", "owner"] as PermissionPreset[]).map((preset) => <Button key={preset} type="button" size="sm" variant="outline" onClick={() => setPermissions(presetPermissions(preset))} className="capitalize">{preset === "read" ? "Read only" : preset}</Button>)}</div>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border">
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-[minmax(180px,1fr)_repeat(4,92px)] border-b border-border bg-muted/40 px-4 py-1.5 text-xs font-medium text-muted-foreground">
                    <span>Resource</span>{actions.map((action) => <span key={action} className="text-center capitalize">{action}</span>)}
                  </div>
                  {resources.map((resource) => {
                    const permission = permissions.find((item) => item.resource === resource.id);
                    return <div key={resource.id} className="grid min-h-10 grid-cols-[minmax(180px,1fr)_repeat(4,92px)] items-center border-b border-border px-4 last:border-0">
                      <span className="text-sm font-medium">{resource.label}</span>
                      {actions.map((action) => <label key={action} className="flex justify-center"><input type="checkbox" className="h-4 w-4 accent-primary" disabled={!resource.actions.includes(action)} checked={permission?.actions.includes(action) ?? false} onChange={() => toggle(resource.id, action)} /></label>)}
                    </div>;
                  })}
                </div>
              </div>
              {hasDeletePermission && <div className="mt-2 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"><AlertTriangle className="h-4 w-4 shrink-0" />Destructive access enabled. The agent can permanently delete selected resource types.</div>}
            </div>
          </div>
        </div>
        <DialogFooter className="m-0 block px-6 py-4">
          <div className="mx-auto flex w-full max-w-5xl justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button disabled={saving || !name.trim() || !scopeIsValid} onClick={save}>{saving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}{profile === "new" ? "Create MCP" : "Save changes"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
      </Dialog>
      <Dialog open={confirmingDestructiveSave} onOpenChange={setConfirmingDestructiveSave}>
        <DialogContent className="max-w-md gap-0 overflow-hidden p-0" overlayClassName="bg-black/45 supports-backdrop-filter:backdrop-blur-sm">
          <div className="flex items-start gap-4 p-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <DialogHeader className="gap-1.5">
              <DialogTitle>Enable destructive access?</DialogTitle>
              <DialogDescription>This agent can permanently delete Qentrah data after you approve its OAuth access. Review the selected delete permissions before continuing.</DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="m-0 px-6 py-4">
            <Button variant="outline" onClick={() => setConfirmingDestructiveSave(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmingDestructiveSave(false);
                void persistProfile();
              }}
            >
              Enable and {profile === "new" ? "create MCP" : "save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ScopeOptions({ title, empty, items, selected, onToggle }: {
  title: string;
  empty: string;
  items: Array<{ id: string; name: string }>;
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div>
          <p className="text-xs font-semibold text-foreground">{title}</p>
          <p className="text-[11px] text-muted-foreground">Choose one or more</p>
        </div>
        <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">{selected.length} selected</span>
      </div>
      {items.length === 0 ? <p className="px-3 py-3 text-xs text-muted-foreground">{empty}</p> : (
        <div className="grid max-h-28 gap-1.5 overflow-y-auto p-2 sm:grid-cols-2">
          {items.map((item) => (
            <label key={item.id} className={`flex items-center gap-2 rounded-md border px-2.5 py-2 text-xs font-medium transition-colors ${selected.includes(item.id) ? "border-foreground bg-muted text-foreground" : "border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}>
              <input type="checkbox" checked={selected.includes(item.id)} onChange={() => onToggle(item.id)} className="h-3.5 w-3.5 accent-primary" />
              {item.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function ConnectDialog({ profile, onOpenChange, onCopy }: {
  profile: Profile | null;
  onOpenChange: (open: boolean) => void;
  onCopy: (value: string, title?: string) => Promise<void>;
}) {
  const [client, setClient] = useState<ClientId>("codex");
  if (!profile) return <Dialog open={false} onOpenChange={onOpenChange} />;
  const url = profileUrl(profile);
  const summary = permissionText(profile.permissions);
  const prompt = buildMcpSetupPrompt({ agentName: profile.name, endpoint: url, permissionSummary: summary });
  const values: Record<ClientId, string> = {
    codex: `codex mcp add qentrah --url ${url}\ncodex mcp login qentrah`,
    claude: `Name: ${profile.name}\nRemote MCP URL: ${url}\n\n${prompt}`,
    chatgpt: `Connector name: ${profile.name}\nConnector URL: ${url}\n\nUse OAuth when prompted.`,
    grok: `Add a remote MCP server named ${profile.name}.\nURL: ${url}\nAuthentication: OAuth`,
    vscode: buildMcpConfigJson(url),
    openai: buildOpenAiMcpToolPrompt({ agentName: profile.name, endpoint: url, preset: "full" }),
  };
  const selectedClient = clients.find((item) => item.id === client) ?? clients[0];
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[84dvh] w-[min(780px,92dvw)] max-w-none gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5">
          <div className="flex items-start gap-3 pe-8">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background"><Image src="/brands/mcp/openai.svg" alt="OpenAI" width={20} height={20} /></span>
            <div><DialogTitle>Connect {profile.name}</DialogTitle><DialogDescription className="mt-1">Choose your AI client and complete browser OAuth when it connects.</DialogDescription></div>
          </div>
        </DialogHeader>
        <div className="min-h-0 space-y-5 overflow-y-auto p-6">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/25 px-3 py-2.5">
            <div className="min-w-0"><p className="text-[11px] font-medium uppercase text-muted-foreground">MCP URL</p><p className="truncate font-mono text-xs text-foreground">{url}</p></div>
            <Button variant="outline" size="icon-sm" aria-label="Copy MCP URL" title="Copy MCP URL" onClick={() => void onCopy(url, "MCP URL copied")}><Copy className="h-3.5 w-3.5" /></Button>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between"><p className="text-xs font-semibold text-foreground">Choose a client</p><span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-primary" />OAuth protected</span></div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {clients.map((item) => <button key={item.id} type="button" onClick={() => setClient(item.id)} className={`flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-medium transition-colors ${client === item.id ? "border-foreground bg-foreground text-background" : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"}`}><span className={`flex h-6 w-6 items-center justify-center rounded-md ${client === item.id ? "bg-white" : "bg-transparent"}`}><Image src={item.logo} alt="" width={18} height={18} /></span>{item.label}</button>)}
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2.5"><div><p className="text-xs font-semibold text-foreground">{selectedClient.label} setup</p><p className="text-[11px] text-muted-foreground">Paste this into {selectedClient.label}</p></div><Button variant="outline" size="sm" onClick={() => void onCopy(values[client], `${selectedClient.label} setup copied`)}><Copy className="me-2 h-3.5 w-3.5" />Copy</Button></div>
            <pre className="max-h-64 min-h-32 overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-5 text-muted-foreground">{values[client]}</pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
