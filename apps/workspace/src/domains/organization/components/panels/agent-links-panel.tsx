"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Bot, Building2, CalendarDays, Check, CheckCircle2, Copy, CreditCard, FileText, KeyRound, Layers, Loader2, Plus, RefreshCcw, ShieldCheck, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { DeleteRecordDialog } from "@/components/shared/crud-ui";
import { expiryTimestamp } from "@/lib/utils/expiry-timestamp";
import {
  createOrganizationMcpConnection,
  listOrganizationMcpConnections,
  revokeOrganizationMcpConnection,
  rotateOrganizationMcpConnection,
  updateOrganizationMcpConnection,
  type McpConnectionPermission,
  type McpPermissionAction,
  type McpPermissionResource,
  type OrganizationApiKeyExpiry,
  type OrganizationMcpConnection,
  type OrganizationMember,
} from "../../api/clerk-organization-api";
import { apiKeyExpiryOptions } from "../../config/api-key.config";
import {
  agentConnectionProjection,
  agentPermissionActions,
  agentPermissionSummary,
  clampAgentPermissionsToGrantable,
  cloneAgentPermissions,
  formatDate,
  hasAgentDeletePermission,
  memberName,
  toggleAgentPermission,
} from "../../settings-view-model";
import { EmptyState, LoadingCardGrid, Section } from "../shared";

const agentPermissionAreas: Array<{
  resource: McpPermissionResource;
  icon: typeof Users;
  actions: McpPermissionAction[];
}> = [
  { resource: "client", icon: Users, actions: ["read", "create", "update", "delete"] },
  { resource: "project", icon: Building2, actions: ["read", "create", "update", "delete"] },
  { resource: "space", icon: Layers, actions: ["read", "create", "update", "delete"] },
  { resource: "deal", icon: CreditCard, actions: ["read", "create", "update", "delete"] },
  { resource: "calendar", icon: CalendarDays, actions: ["read", "create", "update", "delete"] },
  { resource: "task", icon: CheckCircle2, actions: ["read", "create", "update", "delete"] },
  { resource: "media", icon: FileText, actions: ["read", "create"] },
];

type AgentPresetId = "client" | "calendar" | "full";

const agentPresets: Array<{ id: AgentPresetId; permissions: McpConnectionPermission[] }> = [
  {
    id: "client",
    permissions: [
      { resource: "organization", actions: ["read"] },
      { resource: "client", actions: ["read", "create", "update"] },
      { resource: "calendar", actions: ["read", "create", "update"] },
      { resource: "task", actions: ["read", "create", "update"] },
      { resource: "media", actions: ["read", "create"] },
    ],
  },
  {
    id: "calendar",
    permissions: [
      { resource: "organization", actions: ["read"] },
      { resource: "client", actions: ["read"] },
      { resource: "project", actions: ["read"] },
      { resource: "deal", actions: ["read", "update"] },
      { resource: "calendar", actions: ["read", "create", "update"] },
      { resource: "task", actions: ["read", "update"] },
    ],
  },
  {
    id: "full",
    permissions: [
      { resource: "organization", actions: ["read"] },
      { resource: "client", actions: ["read", "create", "update", "delete"] },
      { resource: "project", actions: ["read", "create", "update", "delete"] },
      { resource: "space", actions: ["read", "create", "update", "delete"] },
      { resource: "deal", actions: ["read", "create", "update", "delete"] },
      { resource: "calendar", actions: ["read", "create", "update", "delete"] },
      { resource: "task", actions: ["read", "create", "update", "delete"] },
      { resource: "media", actions: ["read", "create"] },
    ],
  },
];

export function AgentLinksPanel({
  organizationId,
  canRead,
  canCreate,
  canDelete,
  grantablePermissions,
  members,
}: {
  organizationId: string;
  canRead: boolean;
  canCreate: boolean;
  canDelete: boolean;
  grantablePermissions: McpConnectionPermission[];
  members: OrganizationMember[];
}) {
  const t = useTranslations("Organization.agentLinks");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<OrganizationMcpConnection | null>(null);
  const [agentName, setAgentName] = useState(() => t("presets.client"));
  const [instructions, setInstructions] = useState(() => t("defaults.instructions"));
  const [presetId, setPresetId] = useState<AgentPresetId | "custom">("client");
  const [principalType, setPrincipalType] = useState<OrganizationMcpConnection["principalType"]>("user");
  const [agentExpiry, setAgentExpiry] = useState<OrganizationApiKeyExpiry>("30d");
  const [permissions, setPermissions] = useState<McpConnectionPermission[]>(cloneAgentPermissions(agentPresets[0].permissions));
  const [allowDelete, setAllowDelete] = useState(false);
  const [oneTimeLink, setOneTimeLink] = useState("");
  const [oneTimePermissions, setOneTimePermissions] = useState<McpConnectionPermission[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [revokingConnection, setRevokingConnection] = useState<OrganizationMcpConnection | null>(null);
  const selectedGrantablePermissions = clampAgentPermissionsToGrantable(permissions, grantablePermissions);
  const memberByUserId = new Map(members.map((member) => [member.userId, member]));

  const query = useQuery({
    queryKey: ["organization-mcp-connections", organizationId],
    queryFn: () => listOrganizationMcpConnections(organizationId),
    enabled: Boolean(organizationId && canRead),
  });

  const createMutation = useMutation({
    mutationFn: () => createOrganizationMcpConnection(organizationId, {
      name: agentName,
      instructions,
      principalType,
      permissions: selectedGrantablePermissions,
      expiresAt: expiryTimestamp(agentExpiry),
    }),
    onSuccess: async (result) => {
      setOneTimeLink(result.agentLink);
      setOneTimePermissions(cloneAgentPermissions(selectedGrantablePermissions));
      queryClient.invalidateQueries({ queryKey: ["organization-mcp-connections", organizationId] });
      await navigator.clipboard?.writeText(result.agentLink).catch(() => undefined);
      toast({ title: t("toasts.readyTitle"), description: t("toasts.readyDescription"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.failedTitle"), description: error.message, type: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ connection, input }: {
      connection: OrganizationMcpConnection;
      input: Parameters<typeof updateOrganizationMcpConnection>[2];
    }) => updateOrganizationMcpConnection(organizationId, connection.id, input),
    onSuccess: () => {
      setEditingConnection(null);
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["organization-mcp-connections", organizationId] });
      toast({ title: t("toasts.updatedTitle"), description: t("toasts.updatedDescription"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.failedTitle"), description: error.message, type: "error" }),
  });

  const revokeMutation = useMutation({
    mutationFn: (connection: OrganizationMcpConnection) => revokeOrganizationMcpConnection(organizationId, connection.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-mcp-connections", organizationId] });
      toast({ title: t("toasts.revokedTitle"), description: t("toasts.revokedDescription"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.failedTitle"), description: error.message, type: "error" }),
  });

  const rotateMutation = useMutation({
    mutationFn: (connection: OrganizationMcpConnection) => rotateOrganizationMcpConnection(organizationId, connection.id),
    onSuccess: async (result) => {
      setOneTimeLink(result.agentLink);
      setOneTimePermissions(cloneAgentPermissions(result.connection.permissions));
      setDialogOpen(true);
      queryClient.invalidateQueries({ queryKey: ["organization-mcp-connections", organizationId] });
      await navigator.clipboard?.writeText(result.agentLink).catch(() => undefined);
      toast({ title: t("toasts.rotatedTitle"), description: t("toasts.rotatedDescription"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.failedTitle"), description: error.message, type: "error" }),
  });

  function applyPreset(id: string) {
    setPresetId(id as AgentPresetId | "custom");
    const preset = agentPresets.find((item) => item.id === id);
    if (!preset) return;
    setPermissions(clampAgentPermissionsToGrantable(cloneAgentPermissions(preset.permissions), grantablePermissions));
    setAgentName(t(`presets.${preset.id}`));
    setAllowDelete(false);
  }

  function openNewAgentLinkDialog() {
    const defaultPreset = agentPresets[0];
    setEditingConnection(null);
    setPresetId(defaultPreset.id);
    setPrincipalType("user");
    setAgentExpiry("30d");
    setPermissions(clampAgentPermissionsToGrantable(cloneAgentPermissions(defaultPreset.permissions), grantablePermissions));
    setAgentName(t(`presets.${defaultPreset.id}`));
    setInstructions(t("defaults.instructions"));
    setAllowDelete(false);
    setOneTimeLink("");
    setOneTimePermissions([]);
    setDialogOpen(true);
  }

  function openEditAgentLinkDialog(connection: OrganizationMcpConnection) {
    setEditingConnection(connection);
    setPresetId("custom");
    setPrincipalType(connection.principalType);
    setAgentExpiry(connection.expiresAt ? "30d" : "never");
    setPermissions(clampAgentPermissionsToGrantable(cloneAgentPermissions(connection.permissions), grantablePermissions));
    setAgentName(connection.name);
    setInstructions(connection.instructions ?? "");
    setAllowDelete(hasAgentDeletePermission(connection.permissions));
    setOneTimeLink("");
    setOneTimePermissions([]);
    setDialogOpen(true);
  }

  function togglePermission(resource: McpPermissionResource, action: McpPermissionAction) {
    setPresetId("custom");
    setPermissions((current) => toggleAgentPermission(current, grantablePermissions, resource, action));
  }

  async function copyOneTimeLink() {
    if (!oneTimeLink) return;
    await navigator.clipboard?.writeText(oneTimeLink);
    toast({ title: t("toasts.copiedTitle"), description: t("toasts.copiedDescription"), type: "success" });
  }

  const requiresDeleteConfirmation = hasAgentDeletePermission(selectedGrantablePermissions);
  const canSubmit = canCreate && agentName.trim() && selectedGrantablePermissions.length > 0 && (!requiresDeleteConfirmation || allowDelete);
  const isEditing = Boolean(editingConnection);
  const connections = query.data ?? [];
  const {
    draftConnections,
    visibleConnections,
    stats: agentStats,
  } = agentConnectionProjection(connections, showDrafts);
  const oneTimePermissionSummary = agentPermissionSummary(oneTimePermissions, {
    resource: (resource) => t(`resources.${resource}`),
    action: (action) => t(`actions.${action}`),
  });
  const connectionCard = (connection: OrganizationMcpConnection) => {
    const creator = memberByUserId.get(connection.createdByUserId);
    const isDraft = connection.status === "draft";
    const statusLabel = {
      active: connection.usageCount === 0 ? t("status.pending") : t("status.active"),
      paused: t("status.paused"),
      draft: t("status.draft"),
      revoked: t("status.revoked"),
    }[connection.status] ?? connection.status;

    return (
      <div key={connection.id} className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground">
                  {connection.name}
                </p>
                <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
                  {statusLabel}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {t("labels.keyEnding", { last4: connection.keyLast4 })}
                {creator ? <> · {memberName(creator)}</> : null}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {connection.status !== "revoked" && (
              <Button
                variant="ghost"
                size="sm"
                disabled={!canCreate || updateMutation.isPending}
                onClick={() => updateMutation.mutate({ connection, input: { status: connection.status === "active" ? "paused" : "active" } })}
                className="h-7 rounded-lg px-2 text-[11px] font-medium"
              >
                {connection.status === "active" ? t("buttons.pause") : t("buttons.resume")}
              </Button>
            )}
            {connection.status !== "revoked" && (
              <Button
                variant="ghost"
                size="sm"
                disabled={!canCreate || updateMutation.isPending}
                onClick={() => openEditAgentLinkDialog(connection)}
                className="h-7 rounded-lg px-2 text-[11px] font-medium"
              >
                {t("buttons.edit")}
              </Button>
            )}
            {connection.status !== "revoked" && !isDraft && (
              <Button
                variant="ghost"
                size="sm"
                disabled={!canCreate || rotateMutation.isPending}
                onClick={() => rotateMutation.mutate(connection)}
                className="h-7 rounded-lg px-2 text-[11px] font-medium"
              >
                <RefreshCcw className="h-3 w-3" />
              </Button>
            )}
            {connection.status !== "revoked" && !isDraft && (
              <Button
                variant="ghost"
                size="sm"
                disabled={!canDelete || revokeMutation.isPending}
                onClick={() => setRevokingConnection(connection)}
                className="h-7 rounded-lg px-2 text-[11px] font-medium text-muted-foreground hover:text-red-500"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Section
        title={t("title")}
        description={t("description")}
        actions={(
          <Button
            disabled={!canCreate}
            onClick={openNewAgentLinkDialog}
            className="h-10 rounded-lg bg-primary px-4 text-[9px] font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="me-1.5 h-3.5 w-3.5" />
            {t("newButton")}
          </Button>
        )}
      >
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-muted-foreground">
            <span>{t("stats.active")}: <strong className="text-muted-foreground">{agentStats.active}</strong></span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>{t("stats.calls")}: <strong className="text-muted-foreground">{agentStats.calls}</strong></span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>{t("stats.drafts")}: <strong className="text-muted-foreground">{agentStats.drafts}</strong></span>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {!canRead && <EmptyState title={t("empty.noAccessTitle")} description={t("empty.noAccessDescription")} />}
            {canRead && query.isLoading && <LoadingCardGrid label={t("empty.loading")} />}
            {canRead && !query.isLoading && visibleConnections.length === 0 && <EmptyState title={t("empty.noLinksTitle")} description={t("empty.noLinksDescription")} />}
            {visibleConnections.map(connectionCard)}
          </div>
          
          {canRead && draftConnections.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowDrafts((current) => !current)}
                className="h-8.5 rounded-full px-4 text-[9px] font-black uppercase tracking-widest"
              >
                {showDrafts ? t("buttons.hideDrafts") : t("buttons.showDrafts", { count: draftConnections.length })}
              </Button>
            </div>
          )}
        </div>
      </Section>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setEditingConnection(null);
          setOneTimeLink("");
        }
      }}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-2xl p-6">
          <DialogHeader className="pe-8 text-start">
            <DialogTitle className="text-lg font-black text-foreground">
              {oneTimeLink ? t("modal.readyTitle") : isEditing ? t("modal.editTitle") : t("modal.newTitle")}
            </DialogTitle>
          </DialogHeader>

          {oneTimeLink ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                {t("modal.oneTimeWarning")}
              </div>
              <div className="rounded-2xl border border-border bg-muted/80 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card text-emerald-700 shadow-sm dark:text-emerald-300">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-black text-foreground">{t("modal.canDoTitle")}</p>
                    <p className="text-xs leading-6 text-muted-foreground/50">
                      {oneTimePermissionSummary || t("labels.noWork")}
                    </p>
                    <p className="text-[11px] leading-5 text-muted-foreground">{t("modal.canDoDescription")}</p>
                  </div>
                </div>
              </div>
              <Input readOnly dir="ltr" value={oneTimeLink} className="h-12 rounded-xl font-mono text-xs" />
              <DialogFooter className="justify-start">
                <Button onClick={copyOneTimeLink} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Copy className="me-2 h-4 w-4" />
                  {t("buttons.copy")}
                </Button>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>{t("buttons.close")}</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="agentName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("modal.name")}</Label>
                  <Input id="agentName" value={agentName} onChange={(event) => setAgentName(event.target.value)} className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("modal.startWith")}</Label>
                  <Select value={presetId} onValueChange={(value: string | null) => {
                    if (value) applyPreset(value);
                  }}>
                    <SelectTrigger className="h-11 rounded-xl border-border bg-card text-sm font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl">
                      {agentPresets.map((preset) => (
                        <SelectItem key={preset.id} value={preset.id}>
                          {t(`presets.${preset.id}`)}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">{t("presets.custom")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("modal.expiry")}</Label>
                  <Select value={agentExpiry} onValueChange={(value: string | null) => {
                    if (value) setAgentExpiry(value as OrganizationApiKeyExpiry);
                  }}>
                    <SelectTrigger className="h-11 rounded-xl border-border bg-card text-sm font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl">
                      {apiKeyExpiryOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {t(`expiry.${option}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="agentInstructions" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("modal.instructions")}</Label>
                <textarea
                  id="agentInstructions"
                  value={instructions}
                  onChange={(event) => setInstructions(event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium outline-none transition-colors focus:border-ring"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {agentPermissionAreas.map((area) => {
                  const Icon = area.icon;
                  const activeActions = agentPermissionActions(permissions, area.resource);
                  const allowedActions = agentPermissionActions(grantablePermissions, area.resource);
                  return (
                    <div key={area.resource} className="rounded-2xl border border-border bg-muted/60 p-4">
                      <div className="flex items-start gap-3">
                         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card text-foreground shadow-sm">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-foreground">{t(`resources.${area.resource}`)}</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">{t(`resourceHelp.${area.resource}`)}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {area.actions.map((action) => (
                          <button
                            key={action}
                            type="button"
                            disabled={!allowedActions.includes(action)}
                            onClick={() => togglePermission(area.resource, action)}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors",
                              activeActions.includes(action) && allowedActions.includes(action)
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-card text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40",
                            )}
                          >
                            {t(`actions.${action}`)}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              {requiresDeleteConfirmation && (
                <label className="flex cursor-pointer select-none items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-900 transition-colors hover:border-red-300 hover:bg-red-100/70 dark:border-red-400/40 dark:bg-red-950/40 dark:text-red-100">
                  <input
                    type="checkbox"
                    checked={allowDelete}
                    onChange={(event) => setAllowDelete(event.target.checked)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 bg-card shadow-sm transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-red-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-red-50 dark:peer-focus-visible:ring-offset-red-950",
                      allowDelete
                        ? "border-red-600 bg-red-600 text-white dark:border-red-400 dark:bg-red-500"
                        : "border-red-400 text-transparent dark:border-red-300",
                    )}
                  >
                    <Check className="h-3.5 w-3.5 stroke-[4]" />
                  </span>
                  <span className="leading-6">{t("modal.deleteConfirmation")}</span>
                </label>
              )}
              <DialogFooter className="justify-start">
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>{t("buttons.cancel")}</Button>
                <Button
                  disabled={!canSubmit || createMutation.isPending || updateMutation.isPending}
                  onClick={() => {
                    if (editingConnection) {
                      updateMutation.mutate({
                        connection: editingConnection,
                        input: {
                          name: agentName,
                          instructions,
                          permissions: selectedGrantablePermissions,
                          expiresAt: agentExpiry === "never" ? null : expiryTimestamp(agentExpiry),
                        },
                      });
                      return;
                    }
                    createMutation.mutate();
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {createMutation.isPending || updateMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <KeyRound className="me-2 h-4 w-4" />}
                  {isEditing ? t("modal.save") : t("modal.make")}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteRecordDialog
        open={Boolean(revokingConnection)}
        onOpenChange={(open) => { if (!open) setRevokingConnection(null); }}
        title={t("buttons.moveToDraft")}
        description={t("revokeConfirm", { name: revokingConnection?.name ?? "..." })}
        isDeleting={revokeMutation.isPending}
        onConfirm={() => {
          if (!revokingConnection) return;
          revokeMutation.mutate(revokingConnection, {
            onSuccess: () => setRevokingConnection(null),
            onError: () => setRevokingConnection(null),
          });
        }}
      />
    </div>
  );
}
