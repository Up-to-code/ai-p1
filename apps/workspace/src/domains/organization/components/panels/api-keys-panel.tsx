"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Building2, CalendarDays, CheckCircle2, Copy, FileText, KeyRound, Loader2, Plus, RefreshCcw, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { DeleteRecordDialog, StatusPill } from "@/components/shared/crud-ui";
import {
  createOrganizationApiKey,
  listOrganizationApiKeys,
  revokeOrganizationApiKey,
  rotateOrganizationApiKey,
  type OrganizationApiKey,
  type OrganizationApiKeyAction,
  type OrganizationApiKeyExpiry,
  type OrganizationApiKeyPermission,
  type OrganizationApiKeyResource,
} from "../../api/clerk-organization-api";
import { apiKeyExpiryOptions, apiKeyResourceDefinitions } from "../../config/api-key.config";
import { organizationApiBaseUrl, organizationApiStarterRequest } from "../../lib/organization-api-utils";
import {
  apiKeyPermissionActions,
  apiKeyPermissionSummary,
  apiKeyStats,
  clampApiKeyPermissionsToGrantable,
  cloneApiKeyPermissions,
  defaultApiKeyPermissions,
  formatDate,
  toggleApiKeyPermission,
} from "../../settings-view-model";
import { EmptyState, LoadingCardGrid, Section } from "../shared";

export function ApiKeysPanel({
  organizationId,
  canRead,
  canCreate,
  canUpdate,
  canDelete,
  grantablePermissions,
}: {
  organizationId: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  grantablePermissions: OrganizationApiKeyPermission[];
}) {
  const t = useTranslations("Organization.apiKeys");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rotatingKey, setRotatingKey] = useState<OrganizationApiKey | null>(null);
  const [revokingKey, setRevokingKey] = useState<OrganizationApiKey | null>(null);
  const [keyName, setKeyName] = useState("");
  const [expiry, setExpiry] = useState<OrganizationApiKeyExpiry>("30d");
  const [permissions, setPermissions] = useState<OrganizationApiKeyPermission[]>(defaultApiKeyPermissions(grantablePermissions));
  const [oneTimeKey, setOneTimeKey] = useState("");
  const [oneTimePermissions, setOneTimePermissions] = useState<OrganizationApiKeyPermission[]>([]);
  const selectedPermissions = clampApiKeyPermissionsToGrantable(permissions, grantablePermissions);

  const query = useQuery({
    queryKey: ["organization-api-keys", organizationId],
    queryFn: () => listOrganizationApiKeys(organizationId),
    enabled: Boolean(organizationId && canRead),
  });

  const createMutation = useMutation({
    mutationFn: () => createOrganizationApiKey(organizationId, {
      name: keyName,
      expiry,
      permissions: selectedPermissions,
    }),
    onSuccess: async (result) => {
      setOneTimeKey(result.apiKey);
      setOneTimePermissions(cloneApiKeyPermissions(selectedPermissions));
      queryClient.invalidateQueries({ queryKey: ["organization-api-keys", organizationId] });
      await navigator.clipboard?.writeText(result.apiKey).catch(() => undefined);
      toast({ title: t("toasts.readyTitle"), description: t("toasts.readyDescription"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.failedTitle"), description: error.message, type: "error" }),
  });

  const rotateMutation = useMutation({
    mutationFn: () => {
      if (!rotatingKey) throw new Error(t("toasts.failedDescription"));
      return rotateOrganizationApiKey(organizationId, rotatingKey.id, { expiry });
    },
    onSuccess: async (result) => {
      setOneTimeKey(result.apiKey);
      setOneTimePermissions(cloneApiKeyPermissions(result.key.permissions));
      queryClient.invalidateQueries({ queryKey: ["organization-api-keys", organizationId] });
      await navigator.clipboard?.writeText(result.apiKey).catch(() => undefined);
      toast({ title: t("toasts.rotatedTitle"), description: t("toasts.rotatedDescription"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.failedTitle"), description: error.message, type: "error" }),
  });

  const revokeMutation = useMutation({
    mutationFn: (key: OrganizationApiKey) => revokeOrganizationApiKey(organizationId, key.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-api-keys", organizationId] });
      toast({ title: t("toasts.revokedTitle"), description: t("toasts.revokedDescription"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.failedTitle"), description: error.message, type: "error" }),
  });

  function openCreateDialog() {
    setRotatingKey(null);
    setKeyName(t("defaults.name"));
    setExpiry("30d");
    setPermissions(defaultApiKeyPermissions(grantablePermissions));
    setOneTimeKey("");
    setOneTimePermissions([]);
    setDialogOpen(true);
  }

  function openRotateDialog(key: OrganizationApiKey) {
    setRotatingKey(key);
    setKeyName(key.name);
    setExpiry("30d");
    setPermissions(cloneApiKeyPermissions(key.permissions));
    setOneTimeKey("");
    setOneTimePermissions([]);
    setDialogOpen(true);
  }

  function togglePermission(resource: OrganizationApiKeyResource, action: OrganizationApiKeyAction) {
    setPermissions((current) => toggleApiKeyPermission(current, grantablePermissions, resource, action));
  }

  async function copyOneTimeKey() {
    if (!oneTimeKey) return;
    await navigator.clipboard?.writeText(oneTimeKey);
    toast({ title: t("toasts.copiedTitle"), description: t("toasts.copiedDescription"), type: "success" });
  }

  const keys = query.data ?? [];
  const stats = apiKeyStats(keys);
  const canSubmit = rotatingKey ? canUpdate : canCreate && keyName.trim() && selectedPermissions.length > 0;
  const oneTimePermissionSummary = apiKeyPermissionSummary(oneTimePermissions, {
    resource: (resource) => t(`resources.${resource}`),
    action: (action) => t(`actions.${action}`),
  });
  const oneTimeApiBaseUrl = organizationApiBaseUrl(organizationId);
  const oneTimeStarterRequest = organizationApiStarterRequest(oneTimeApiBaseUrl, oneTimeKey);

  return (
    <div className="space-y-6">
      <Section
        title={t("title")}
        description={t("description")}
        actions={(
          <Button
            disabled={!canCreate}
            onClick={openCreateDialog}
            className="h-10 rounded-lg bg-primary px-4 text-[9px] font-black uppercase tracking-widest text-primary-foreground hover:bg-black"
          >
            <Plus className="me-1.5 h-3.5 w-3.5" />
            {t("newButton")}
          </Button>
        )}
      >
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-muted-foreground">
            <span>{t("stats.active")}: <strong className="text-muted-foreground">{stats.active}</strong></span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>{t("stats.quota")}: <strong className="text-muted-foreground">{t("stats.quotaValue")}</strong></span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>{t("stats.calls")}: <strong className="text-muted-foreground">{stats.calls}</strong></span>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {!canRead && <EmptyState title={t("empty.noAccessTitle")} description={t("empty.noAccessDescription")} />}
            {canRead && query.isLoading && <LoadingCardGrid label={t("empty.loading")} />}
            {canRead && !query.isLoading && keys.length === 0 && <EmptyState title={t("empty.noKeysTitle")} description={t("empty.noKeysDescription")} />}
            {keys.map((key) => (
            <div key={key.id} className="rounded-2xl border border-border bg-card p-4.5 transition-all">
              <div className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusPill label={t(`status.${key.status}`)} tone={key.status === "active" ? "success" : key.status === "expired" ? "warning" : "neutral"} />
                      <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[9px] font-bold text-muted-foreground">{t("labels.keyEnding", { last4: key.keyLast4 })}</span>
                    </div>
                    <p className="mt-2.5 truncate text-sm font-black text-foreground">{key.name}</p>
                  </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <KeyRound className="h-4 w-4" />
                  </div>
                </div>
                
                <p className="line-clamp-2 text-[11px] leading-5 text-muted-foreground">
                  {apiKeyPermissionSummary(key.permissions, {
                    resource: (resource) => t(`resources.${resource}`),
                    action: (action) => t(`actions.${action}`),
                  }) || t("labels.noWork")}
                </p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>{t("labels.used", { count: key.usageCount })}</span>
                  <span className="h-0.5 w-0.5 rounded-full bg-border" />
                  <span>{t("labels.quota", { used: key.quotaUsed, limit: key.quotaLimit })}</span>
                  <span className="h-0.5 w-0.5 rounded-full bg-border" />
                  <span>{key.expiresAt ? t("labels.expires", { date: formatDate(key.expiresAt) }) : t("labels.neverExpires")}</span>
                  {key.lastUsedAt && (
                    <>
                      <span className="h-0.5 w-0.5 rounded-full bg-border" />
                      <span>{t("labels.lastUsed", { date: formatDate(key.lastUsedAt) })}</span>
                    </>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap gap-1.5 border-t border-border/60 pt-3">
                  {key.status !== "revoked" && (
                    <Button
                      variant="outline"
                      disabled={!canUpdate || rotateMutation.isPending}
                      onClick={() => openRotateDialog(key)}
                      className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest px-2.5"
                    >
                      <RefreshCcw className="me-1.5 h-3.5 w-3.5" />
                      {t("buttons.rotate")}
                    </Button>
                  )}
                  {key.status !== "revoked" && (
                    <Button
                      variant="outline"
                      disabled={!canDelete || revokeMutation.isPending}
                      onClick={() => setRevokingKey(key)}
                      className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest px-2.5 text-red-600 border-red-100 bg-red-500/5 hover:bg-red-500/10 dark:border-red-500/15"
                    >
                      <Trash2 className="me-1.5 h-3.5 w-3.5" />
                      {t("buttons.revoke")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </Section>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setOneTimeKey("");
          setRotatingKey(null);
        }
      }}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-2xl p-6">
          <DialogHeader className="pe-8 text-start">
            <DialogTitle className="text-lg font-black text-foreground">
              {oneTimeKey ? t("modal.readyTitle") : rotatingKey ? t("modal.rotateTitle") : t("modal.newTitle")}
            </DialogTitle>
          </DialogHeader>

          {oneTimeKey ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                {t("modal.oneTimeWarning")}
              </div>
              <div className="rounded-2xl border border-border bg-muted/80 p-4">
                <p className="text-sm font-black text-foreground">{t("modal.canDoTitle")}</p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground/50">{oneTimePermissionSummary}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKeyBaseUrl" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("modal.apiUrl")}</Label>
                <Input id="apiKeyBaseUrl" readOnly dir="ltr" value={oneTimeApiBaseUrl} className="h-12 rounded-xl font-mono text-xs" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKeyExampleRequest" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("modal.exampleRequest")}</Label>
                <textarea
                  id="apiKeyExampleRequest"
                  readOnly
                  dir="ltr"
                  value={oneTimeStarterRequest}
                  className="min-h-24 w-full resize-none rounded-xl border border-border bg-card px-3 py-3 font-mono text-xs leading-5 text-foreground shadow-sm outline-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKeySecret" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("modal.secret")}</Label>
                <Input id="apiKeySecret" readOnly dir="ltr" value={oneTimeKey} className="h-12 rounded-xl font-mono text-xs" />
              </div>
              <DialogFooter className="justify-start">
                <Button onClick={copyOneTimeKey} className="bg-primary text-primary-foreground hover:bg-black">
                  <Copy className="me-2 h-4 w-4" />
                  {t("buttons.copy")}
                </Button>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>{t("buttons.close")}</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-6">
              {!rotatingKey && (
                <div className="space-y-2">
                  <Label htmlFor="apiKeyName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("modal.name")}</Label>
                  <Input id="apiKeyName" value={keyName} onChange={(event) => setKeyName(event.target.value)} className="h-11 rounded-xl" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="apiKeyExpiry" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("modal.expiry")}</Label>
                <select id="apiKeyExpiry" value={expiry} onChange={(event) => setExpiry(event.target.value as OrganizationApiKeyExpiry)} className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-bold">
                  {apiKeyExpiryOptions.map((option) => <option key={option} value={option}>{t(`expiry.${option}`)}</option>)}
                </select>
              </div>
              {!rotatingKey && (
                <div className="grid gap-3 md:grid-cols-2">
                  {apiKeyResourceDefinitions.map((area) => {
                    const Icon = area.icon;
                    const activeActions = apiKeyPermissionActions(permissions, area.resource);
                    const allowedActions = apiKeyPermissionActions(grantablePermissions, area.resource);
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
                                   : "border-border bg-card text-muted-foreground hover:border-ring hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40",
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
              )}
              <DialogFooter className="justify-start">
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>{t("buttons.cancel")}</Button>
                <Button
                  disabled={!canSubmit || createMutation.isPending || rotateMutation.isPending}
                  onClick={() => rotatingKey ? rotateMutation.mutate() : createMutation.mutate()}
                  className="bg-primary text-primary-foreground hover:bg-black"
                >
                  {createMutation.isPending || rotateMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <KeyRound className="me-2 h-4 w-4" />}
                  {rotatingKey ? t("modal.rotate") : t("modal.make")}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteRecordDialog
        open={Boolean(revokingKey)}
        onOpenChange={(open) => { if (!open) setRevokingKey(null); }}
        title={t("buttons.revoke")}
        description={t("revokeConfirm", { name: revokingKey?.name ?? "..." })}
        isDeleting={revokeMutation.isPending}
        onConfirm={() => {
          if (!revokingKey) return;
          revokeMutation.mutate(revokingKey, {
            onSuccess: () => setRevokingKey(null),
            onError: () => setRevokingKey(null),
          });
        }}
      />
    </div>
  );
}
