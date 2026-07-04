"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { HelpCircle, Loader2, Save } from "lucide-react";
import { useAuthSession } from "@/domains/auth";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  createOrganizationRole,
  deleteOrganizationRole,
  getOrganizationCapabilities,
  listOrganizationMembers,
  listOrganizationRoles,
  updateOrganizationRole,
  type OrganizationRole,
} from "../../api/clerk-organization-api";
import {
  advancedActionColumns,
  advancedWorkAreas,
  defaultRoleNames,
  emptyPermission,
  memberRoleCount,
  normalizeRole,
  toggleRolePermissionAction,
  workActionColumns,
  workAreas,
  workRoleTemplates,
  type PermissionResource,
} from "../../settings-view-model";
import { LoadingRow, NoOrganizationState, OrganizationSettingsSkeleton, RoleRow, Section, WorkRoleGrid } from "../shared";
import { PermissionMatrix, QuickRoleSelector } from "@/components/mcp/permission-matrix";
import type { QuickRoleId } from "@/components/mcp/constants/quick-roles";
import { QUICK_ROLES } from "@/components/mcp/constants/quick-roles";

export function RoleManagementPanel({ surface = "page" }: { surface?: "page" | "drawer" }) {
  const t = useTranslations("Organization");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const session = useAuthSession();
  const organizationId = session.organization.id ?? "";
  const [roleName, setRoleName] = useState("");
  const [rolePermission, setRolePermission] = useState<Partial<Record<PermissionResource, string[]>>>(emptyPermission);
  const [editingRole, setEditingRole] = useState<OrganizationRole | null>(null);
  const [showAdvancedWork, setShowAdvancedWork] = useState(false);
  const [templateId, setTemplateId] = useState("blank");
  const [selectedQuickRole, setSelectedQuickRole] = useState<QuickRoleId | null>(null);
  const [useMcpPermissions, setUseMcpPermissions] = useState(false);

  const membersQuery = useQuery({
    queryKey: ["organization-members", organizationId],
    queryFn: () => listOrganizationMembers(organizationId),
    enabled: Boolean(organizationId),
  });
  const rolesQuery = useQuery({
    queryKey: ["organization-roles", organizationId],
    queryFn: () => listOrganizationRoles(organizationId),
    enabled: Boolean(organizationId),
  });
  const capabilitiesQuery = useQuery({
    queryKey: ["organization-capabilities", organizationId],
    queryFn: () => getOrganizationCapabilities(organizationId),
    enabled: Boolean(organizationId),
  });

  const members = membersQuery.data ?? [];
  const customRoles = rolesQuery.data ?? [];
  const capabilities = capabilitiesQuery.data;
  const canCreateRoles = capabilities?.canCreateRoles ?? false;
  const canUpdateRoles = capabilities?.canUpdateRoles ?? false;
  const canDeleteRoles = capabilities?.canDeleteRoles ?? false;
  const defaultRoleLabels = {
    owner: t("roles.defaultLabels.owner"),
    admin: t("roles.defaultLabels.admin"),
    member: t("roles.defaultLabels.member"),
  };

  const roleMutation = useMutation({
    mutationFn: async () => {
      const nextName = normalizeRole(roleName);
      if (!nextName) throw new Error(t("roles.nameRequired"));
      if (editingRole) {
        return updateOrganizationRole(organizationId, editingRole.id, { roleName: nextName, permission: rolePermission });
      }
      return createOrganizationRole(organizationId, nextName, rolePermission);
    },
    onSuccess: () => {
      setRoleName("");
      setRolePermission(emptyPermission());
      setEditingRole(null);
      setTemplateId("blank");
      queryClient.invalidateQueries({ queryKey: ["organization-roles", organizationId] });
      toast({ title: t("toasts.roleSavedTitle"), description: t("toasts.roleSavedDesc"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.actionFailed"), description: error.message, type: "error" }),
  });
  const deleteRoleMutation = useMutation({
    mutationFn: (role: OrganizationRole) => deleteOrganizationRole(organizationId, role.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-roles", organizationId] });
      toast({ title: t("toasts.roleDeletedTitle"), description: t("toasts.roleDeletedDesc"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.actionFailed"), description: error.message, type: "error" }),
  });

  function beginEditRole(role: OrganizationRole) {
    setEditingRole(role);
    setRoleName(role.role);
    setRolePermission(role.permission);
    setTemplateId("blank");
  }

  function togglePermission(resource: PermissionResource, action: string) {
    setRolePermission((current) => toggleRolePermissionAction(current, resource, action));
  }

  function applyTemplate(nextTemplateId: string) {
    setTemplateId(nextTemplateId);
    setEditingRole(null);
    setSelectedQuickRole(null);
    if (nextTemplateId === "blank") {
      setRoleName("");
      setRolePermission(emptyPermission());
      return;
    }

    const template = workRoleTemplates.find((item) => item.id === nextTemplateId);
    if (!template) return;
    setRoleName(template.suggestedName);
    setRolePermission(template.permission);
  }

  function applyQuickRole(roleId: QuickRoleId) {
    setSelectedQuickRole(roleId);
    const quickRole = QUICK_ROLES[roleId];
    if (!quickRole) return;
    
    setRoleName(quickRole.name);
    // Convert MCP permissions to organization permission format
    const convertedPermissions: Partial<Record<PermissionResource, string[]>> = {};
    Object.entries(quickRole.permissions).forEach(([module, actions]) => {
      convertedPermissions[module as PermissionResource] = actions;
    });
    setRolePermission(convertedPermissions);
    setTemplateId("blank");
  }

  function handleMcpPermissionToggle(module: string, action: string) {
    setRolePermission((current) => {
      const currentActions = current[module as PermissionResource] || [];
      const newActions = currentActions.includes(action)
        ? currentActions.filter((a) => a !== action)
        : [...currentActions, action];
      
      return {
        ...current,
        [module]: newActions,
      };
    });
    setSelectedQuickRole(null); // Clear quick role selection when manually editing
  }

  if (session.isPending) {
    return <OrganizationSettingsSkeleton label={t("noOrganization.loading")} compact />;
  }

  if (!organizationId) {
    return (
      <NoOrganizationState
        title={t("noOrganization.title")}
        description={t("noOrganization.description")}
        action={t("noOrganization.action")}
        href={`/${locale}/choose-org`}
      />
    );
  }

  const content = (
    <div className={surface === "drawer" ? "space-y-6" : "mx-auto max-w-5xl space-y-6 px-6 py-8"}>
      <Section title={editingRole ? t("roles.editTitle") : t("roles.createTitle")} description={t("roles.createDesc")}>
        <div className="space-y-4 rounded-xl border border-border bg-card p-4">
          <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-end">
            <div className="space-y-2">
              <Label htmlFor="roleName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("roles.name")}</Label>
              <Input id="roleName" value={roleName} onChange={(event) => setRoleName(event.target.value)} placeholder={t("roles.namePlaceholder")} className="h-9 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleTemplate" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("roles.templateSelect")}</Label>
              <Select value={templateId} onValueChange={(value: string | null) => value && applyTemplate(value)}>
                <SelectTrigger
                  id="roleTemplate"
                  size="sm"
                  className="h-9 rounded-lg border-border bg-card px-3 text-sm font-extrabold text-foreground hover:bg-muted focus:bg-card"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  align="start"
                  sideOffset={8}
                  className="rounded-xl border-border bg-card p-1.5"
                >
                  <SelectItem value="blank" className="rounded-lg py-2.5 text-sm font-bold">
                    {t("roles.templateBlank")}
                  </SelectItem>
                  {workRoleTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id} className="rounded-lg py-2.5 text-sm font-bold">
                      {t(`roles.templates.${template.labelKey}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              {editingRole && (
                <Button variant="outline" type="button" onClick={() => { setEditingRole(null); setRoleName(""); setRolePermission(emptyPermission()); setTemplateId("blank"); }} className="h-9 rounded-lg">
                  {t("roles.cancelEdit")}
                </Button>
              )}
              <Button type="button" onClick={() => roleMutation.mutate()} disabled={roleMutation.isPending || !organizationId || (editingRole ? !canUpdateRoles : !canCreateRoles)} className="h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {roleMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Save className="me-2 h-4 w-4" />}
                {editingRole ? t("roles.update") : t("roles.create")}
              </Button>
            </div>
          </div>

          {/* Permission Mode Toggle */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-1.5">
            <button
              type="button"
              onClick={() => setUseMcpPermissions(false)}
              className={cn(
                "flex-1 rounded-md px-2.5 py-1.5 text-xs font-bold transition-all",
                !useMcpPermissions
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              )}
            >
              Classic Grid
            </button>
            <button
              type="button"
              onClick={() => setUseMcpPermissions(true)}
              className={cn(
                "flex-1 rounded-md px-2.5 py-1.5 text-xs font-bold transition-all",
                useMcpPermissions
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              )}
            >
              MCP Matrix
            </button>
          </div>

          {!useMcpPermissions ? (
            <div className="space-y-3">
              <WorkRoleGrid
                permission={rolePermission}
                areas={workAreas}
                actionColumns={workActionColumns}
                onToggle={togglePermission}
                labels={{
                  area: t("roles.grid.area"),
                  allowedWork: t("roles.grid.allowedWork"),
                  read: t("roles.actions.read"),
                  create: t("roles.actions.create"),
                  update: t("roles.actions.update"),
                  delete: t("roles.actions.delete"),
                  authorize: t("roles.actions.authorize"),
                  unavailable: t("roles.grid.unavailable"),
                }}
                getAreaLabel={(key) => t(`roles.workAreas.${key}`)}
                getAreaHelp={(key) => t(`roles.workAreaHelp.${key}`)}
              />

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowAdvancedWork((current) => !current)}
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground underline-offset-4 hover:text-foreground hover:underline dark:hover:text-white"
                >
                  {showAdvancedWork ? t("roles.hideAdvanced") : t("roles.showAdvanced")}
                </button>
                {showAdvancedWork && (
                  <WorkRoleGrid
                    permission={rolePermission}
                    areas={advancedWorkAreas}
                    actionColumns={advancedActionColumns}
                    onToggle={togglePermission}
                    labels={{
                      area: t("roles.grid.area"),
                      allowedWork: t("roles.grid.allowedWork"),
                      read: t("roles.actions.read"),
                      create: t("roles.actions.create"),
                      update: t("roles.actions.update"),
                      delete: t("roles.actions.delete"),
                      authorize: t("roles.actions.authorize"),
                      unavailable: t("roles.grid.unavailable"),
                    }}
                    getAreaLabel={(key) => t(`roles.workAreas.${key}`)}
                    getAreaHelp={(key) => t(`roles.workAreaHelp.${key}`)}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Quick Role Selector */}
              <div>
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Quick Roles
                </p>
                <QuickRoleSelector
                  selectedRole={selectedQuickRole}
                  onRoleSelect={applyQuickRole}
                  disabled={!canCreateRoles}
                />
              </div>

              {/* MCP Permission Matrix */}
              <div>
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Custom Permissions
                </p>
                <PermissionMatrix
                  permissions={rolePermission}
                  onPermissionToggle={handleMcpPermissionToggle}
                  disabled={!canCreateRoles}
                />
              </div>
            </div>
          )}
        </div>
      </Section>

      <Section title={t("roles.listTitle")} description={t("roles.listDesc")}>
        <div className="space-y-2">
          {rolesQuery.isLoading && <LoadingRow label={t("roles.loading")} rows={2} />}
          {defaultRoleNames.map((role) => (
            <RoleRow key={role} role={role} roleLabels={defaultRoleLabels} locked labels={{ builtIn: t("roles.builtIn"), edit: t("roles.edit"), delete: t("roles.delete") }} />
          ))}
          {customRoles.map((role) => {
            const roleInUse = members.some((member) => member.role === role.role);
            return (
              <RoleRow
                key={role.id}
                role={role.role}
                roleLabels={defaultRoleLabels}
                memberCount={memberRoleCount(members, role.role)}
                editDisabled={!canUpdateRoles}
                deleteDisabled={!canDeleteRoles}
                onEdit={canUpdateRoles ? () => beginEditRole(role) : undefined}
                onDelete={() => {
                  if (!canDeleteRoles) {
                    toast({ title: t("toasts.actionFailed"), description: t("roles.notAllowed"), type: "error" });
                    return;
                  }
                  if (roleInUse) {
                    toast({ title: t("toasts.actionFailed"), description: t("roles.roleInUse"), type: "error" });
                    return;
                  }
                  deleteRoleMutation.mutate(role);
                }}
                labels={{ builtIn: t("roles.custom"), edit: t("roles.edit"), delete: t("roles.delete") }}
              />
            );
          })}
        </div>
      </Section>
    </div>
  );

  if (surface === "drawer") {
    return content;
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <Link href={`/${locale}/settings/organization?tab=members`} className={cn(buttonVariants({ variant: "ghost" }), "mb-5 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest")}>
            {t("roles.backToOrganization")}
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">{t("roles.pageEyebrow")}</p>
              <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-foreground">{t("roles.pageTitle")}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{t("roles.pageDesc")}</p>
            </div>
            <div className="rounded-2xl border border-border bg-muted px-4 py-3">
              <p className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <HelpCircle className="h-4 w-4" />
                {t("roles.lessIsMoreHint")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {content}
    </div>
  );
}
