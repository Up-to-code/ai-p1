"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Loader2, Save, Settings2, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useAuthSession } from "@/domains/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { PermissionMatrix, QuickRoleSelector } from "@/components/mcp/permission-matrix";
import { QUICK_ROLES, type QuickRoleId } from "@/components/mcp/constants/quick-roles";
import {
  createOrganizationRole,
  deleteOrganizationRole,
  getOrganizationCapabilities,
  listOrganizationMembers,
  listOrganizationRoles,
  updateOrganizationRole,
  type OrganizationMember,
  type OrganizationRole,
} from "../../api";
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
import { invalidateOrganizationSettings, organizationSettingsKeys } from "../../settings-cache";
import { LoadingRow, NoOrganizationState, OrganizationSettingsSkeleton, RoleRow, WorkRoleGrid } from "../shared";

type RolePanelSurface = "page" | "drawer";
type PermissionTab = "workAreas" | "matrix";

export function RoleManagementPanel({ surface = "page" }: { surface?: RolePanelSurface }) {
  const t = useTranslations("Organization");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const session = useAuthSession();
  const organizationId = session.organization.id ?? "";
  const [roleName, setRoleName] = useState("");
  const [rolePermission, setRolePermission] = useState<Partial<Record<PermissionResource, string[]>>>(emptyPermission);
  const [editingRole, setEditingRole] = useState<OrganizationRole | null>(null);
  const [activePermissionTab, setActivePermissionTab] = useState<PermissionTab>("workAreas");
  const [showAdvancedWork, setShowAdvancedWork] = useState(false);
  const [templateId, setTemplateId] = useState("blank");
  const [selectedQuickRole, setSelectedQuickRole] = useState<QuickRoleId | null>(null);

  const membersQuery = useQuery({
    queryKey: organizationSettingsKeys.members(organizationId),
    queryFn: () => listOrganizationMembers(organizationId),
    enabled: Boolean(organizationId),
  });
  const rolesQuery = useQuery({
    queryKey: organizationSettingsKeys.roles(organizationId),
    queryFn: () => listOrganizationRoles(organizationId),
    enabled: Boolean(organizationId),
  });
  const capabilitiesQuery = useQuery({
    queryKey: organizationSettingsKeys.capabilities(organizationId),
    queryFn: () => getOrganizationCapabilities(organizationId),
    enabled: Boolean(organizationId),
  });

  const members = membersQuery.data ?? [];
  const customRoles = (rolesQuery.data ?? []).filter((role) => !defaultRoleNames.includes(role.role as (typeof defaultRoleNames)[number]));
  const capabilities = capabilitiesQuery.data;
  const canCreateRoles = capabilities?.canCreateRoles ?? false;
  const canUpdateRoles = capabilities?.canUpdateRoles ?? false;
  const canDeleteRoles = capabilities?.canDeleteRoles ?? false;
  const editorDisabled = editingRole ? !canUpdateRoles : !canCreateRoles;
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
      resetEditor();
      void invalidateOrganizationSettings(queryClient, organizationId, ["roles"]);
      toast({ title: t("toasts.roleSavedTitle"), description: t("toasts.roleSavedDesc"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.actionFailed"), description: error.message, type: "error" }),
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (role: OrganizationRole) => deleteOrganizationRole(organizationId, role.id),
    onSuccess: () => {
      void invalidateOrganizationSettings(queryClient, organizationId, ["roles"]);
      toast({ title: t("toasts.roleDeletedTitle"), description: t("toasts.roleDeletedDesc"), type: "success" });
    },
    onError: (error) => toast({ title: t("toasts.actionFailed"), description: error.message, type: "error" }),
  });

  function resetEditor() {
    setRoleName("");
    setRolePermission(emptyPermission());
    setEditingRole(null);
    setTemplateId("blank");
    setSelectedQuickRole(null);
  }

  function beginEditRole(role: OrganizationRole) {
    setEditingRole(role);
    setRoleName(role.role);
    setRolePermission(role.permission);
    setTemplateId("blank");
    setSelectedQuickRole(null);
  }

  function togglePermission(resource: PermissionResource, action: string) {
    setRolePermission((current) => toggleRolePermissionAction(current, resource, action));
    setSelectedQuickRole(null);
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

    const convertedPermissions: Partial<Record<PermissionResource, string[]>> = {};
    Object.entries(quickRole.permissions).forEach(([module, actions]) => {
      convertedPermissions[module as PermissionResource] = actions;
    });
    setRoleName(quickRole.name);
    setRolePermission(convertedPermissions);
    setTemplateId("blank");
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

  const body = (
    <div className={cn(
      "space-y-6",
      surface === "drawer" && "min-h-full pb-[100px]",
      surface === "page" && "mx-auto max-w-7xl px-6 pb-[100px] pt-6",
    )}>
      <RoleList
        canDeleteRoles={canDeleteRoles}
        canUpdateRoles={canUpdateRoles}
        customRoles={customRoles}
        defaultRoleLabels={defaultRoleLabels}
        isLoading={rolesQuery.isLoading}
        members={members}
        labels={{
          builtIn: t("roles.builtIn"),
          custom: t("roles.custom"),
          delete: t("roles.delete"),
          edit: t("roles.edit"),
          listTitle: t("roles.listTitle"),
          loading: t("roles.loading"),
          notAllowed: t("roles.notAllowed"),
          roleInUse: t("roles.roleInUse"),
        }}
        onDelete={(role) => deleteRoleMutation.mutate(role)}
        onEdit={beginEditRole}
        onActionDenied={(description) => toast({ title: t("toasts.actionFailed"), description, type: "error" })}
      />

      <RoleEditor
        activePermissionTab={activePermissionTab}
        canSubmit={Boolean(organizationId) && !editorDisabled}
        disabled={editorDisabled}
        editingRole={editingRole}
        isPending={roleMutation.isPending}
        roleName={roleName}
        rolePermission={rolePermission}
        selectedQuickRole={selectedQuickRole}
        showAdvancedWork={showAdvancedWork}
        templateId={templateId}
        labels={{
          actions: {
            authorize: t("roles.actions.authorize"),
            create: t("roles.actions.create"),
            delete: t("roles.actions.delete"),
            read: t("roles.actions.read"),
            update: t("roles.actions.update"),
          },
          cancelEdit: t("roles.cancelEdit"),
          create: t("roles.create"),
          grid: {
            allowedWork: t("roles.grid.allowedWork"),
            area: t("roles.grid.area"),
            unavailable: t("roles.grid.unavailable"),
          },
          hideAdvanced: t("roles.hideAdvanced"),
          matrix: "Matrix",
          name: t("roles.name"),
          namePlaceholder: t("roles.namePlaceholder"),
          presets: "Presets",
          showAdvanced: t("roles.showAdvanced"),
          templateBlank: t("roles.templateBlank"),
          templateSelect: t("roles.templateSelect"),
          update: t("roles.update"),
          workAreas: "Work areas",
        }}
        onApplyQuickRole={applyQuickRole}
        onApplyTemplate={applyTemplate}
        onCancelEdit={resetEditor}
        onRoleNameChange={setRoleName}
        onShowAdvancedWorkChange={setShowAdvancedWork}
        onSubmit={() => roleMutation.mutate()}
        onTabChange={setActivePermissionTab}
        onTogglePermission={togglePermission}
        getAreaHelp={(key) => t(`roles.workAreaHelp.${key}`)}
        getAreaLabel={(key) => t(`roles.workAreas.${key}`)}
        getTemplateLabel={(key) => t(`roles.templates.${key}`)}
      />
    </div>
  );

  if (surface === "drawer") return body;

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <Link
            href={`/${locale}/organization?tab=members`}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("roles.backToOrganization")}
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("roles.pageTitle")}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{customRoles.length} {t("stats.roles")}</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span>{members.length} {t("stats.members")}</span>
            </div>
          </div>
        </div>
      </div>
      {body}
    </div>
  );
}

function RoleEditor({
  activePermissionTab,
  canSubmit,
  disabled,
  editingRole,
  isPending,
  roleName,
  rolePermission,
  selectedQuickRole,
  showAdvancedWork,
  templateId,
  labels,
  onApplyQuickRole,
  onApplyTemplate,
  onCancelEdit,
  onRoleNameChange,
  onShowAdvancedWorkChange,
  onSubmit,
  onTabChange,
  onTogglePermission,
  getAreaHelp,
  getAreaLabel,
  getTemplateLabel,
}: {
  activePermissionTab: PermissionTab;
  canSubmit: boolean;
  disabled: boolean;
  editingRole: OrganizationRole | null;
  isPending: boolean;
  roleName: string;
  rolePermission: Partial<Record<PermissionResource, string[]>>;
  selectedQuickRole: QuickRoleId | null;
  showAdvancedWork: boolean;
  templateId: string;
  labels: {
    actions: Record<"authorize" | "create" | "delete" | "read" | "update", string>;
    cancelEdit: string;
    create: string;
    grid: { allowedWork: string; area: string; unavailable: string };
    hideAdvanced: string;
    matrix: string;
    name: string;
    namePlaceholder: string;
    presets: string;
    showAdvanced: string;
    templateBlank: string;
    templateSelect: string;
    update: string;
    workAreas: string;
  };
  onApplyQuickRole: (roleId: QuickRoleId) => void;
  onApplyTemplate: (templateId: string) => void;
  onCancelEdit: () => void;
  onRoleNameChange: (value: string) => void;
  onShowAdvancedWorkChange: (value: boolean) => void;
  onSubmit: () => void;
  onTabChange: (tab: PermissionTab) => void;
  onTogglePermission: (resource: PermissionResource, action: string) => void;
  getAreaHelp: (key: string) => string;
  getAreaLabel: (key: string) => string;
  getTemplateLabel: (key: string) => string;
}) {
  const tabs = [
    { id: "workAreas" as const, label: labels.workAreas, icon: Settings2 },
    { id: "matrix" as const, label: labels.matrix, icon: SlidersHorizontal },
  ];

  return (
    <section className="flex min-h-0 flex-col gap-4">
      <div className="shrink-0">
        <div className="flex flex-col gap-2 pb-3 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <Label htmlFor="roleName" className="sr-only">{labels.name}</Label>
          <Input
            id="roleName"
            value={roleName}
            onChange={(event) => onRoleNameChange(event.target.value)}
            placeholder={labels.namePlaceholder}
            disabled={disabled}
            className="h-9 rounded-md border-border bg-background text-sm"
          />
        </div>
        <div className="w-full lg:w-[260px]">
          <Label htmlFor="roleTemplate" className="sr-only">{labels.templateSelect}</Label>
          <Select value={templateId} onValueChange={(value: string | null) => value && onApplyTemplate(value)} disabled={disabled}>
            <SelectTrigger id="roleTemplate" size="sm" className="h-9 rounded-md border-border bg-background px-3 text-sm font-medium text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" sideOffset={8} className="rounded-xl border-border bg-card p-1.5">
              <SelectItem value="blank" className="rounded-lg py-2.5 text-sm font-medium">
                {labels.templateBlank}
              </SelectItem>
              {workRoleTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id} className="rounded-lg py-2.5 text-sm font-medium">
                  {getTemplateLabel(template.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {editingRole && (
            <Button variant="outline" type="button" onClick={onCancelEdit} className="h-9 rounded-md px-3 text-sm">
              {labels.cancelEdit}
            </Button>
          )}
          <Button type="button" onClick={onSubmit} disabled={isPending || !canSubmit} className="h-9 rounded-md px-4 text-sm">
            {isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Save className="me-2 h-4 w-4" />}
            {editingRole ? labels.update : labels.create}
          </Button>
        </div>

        </div>
        <div className="flex items-center gap-1 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                activePermissionTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activePermissionTab === "workAreas" ? (
        <div className="space-y-3">
          <WorkRoleGrid
            permission={rolePermission}
            areas={workAreas}
            actionColumns={workActionColumns}
            onToggle={onTogglePermission}
            disabled={disabled}
            labels={{
              area: labels.grid.area,
              allowedWork: labels.grid.allowedWork,
              read: labels.actions.read,
              create: labels.actions.create,
              update: labels.actions.update,
              delete: labels.actions.delete,
              authorize: labels.actions.authorize,
              unavailable: labels.grid.unavailable,
            }}
            getAreaLabel={getAreaLabel}
            getAreaHelp={getAreaHelp}
          />
          <button
            type="button"
            onClick={() => onShowAdvancedWorkChange(!showAdvancedWork)}
            className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {showAdvancedWork ? labels.hideAdvanced : labels.showAdvanced}
          </button>
          {showAdvancedWork && (
            <WorkRoleGrid
              permission={rolePermission}
              areas={advancedWorkAreas}
              actionColumns={advancedActionColumns}
              onToggle={onTogglePermission}
              disabled={disabled}
              labels={{
                area: labels.grid.area,
                allowedWork: labels.grid.allowedWork,
                read: labels.actions.read,
                create: labels.actions.create,
                update: labels.actions.update,
                delete: labels.actions.delete,
                authorize: labels.actions.authorize,
                unavailable: labels.grid.unavailable,
              }}
              getAreaLabel={getAreaLabel}
              getAreaHelp={getAreaHelp}
            />
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <QuickRoleSelector
            selectedRole={selectedQuickRole}
            onRoleSelect={onApplyQuickRole}
            disabled={disabled}
          />
          <PermissionMatrix
            permissions={rolePermission}
            onPermissionToggle={(module, action) => onTogglePermission(module as PermissionResource, action)}
            disabled={disabled}
            className="min-h-[360px]"
          />
        </div>
      )}
    </section>
  );
}

function RoleList({
  canDeleteRoles,
  canUpdateRoles,
  customRoles,
  defaultRoleLabels,
  isLoading,
  labels,
  members,
  onActionDenied,
  onDelete,
  onEdit,
}: {
  canDeleteRoles: boolean;
  canUpdateRoles: boolean;
  customRoles: OrganizationRole[];
  defaultRoleLabels: Record<(typeof defaultRoleNames)[number], string>;
  isLoading: boolean;
  labels: {
    builtIn: string;
    custom: string;
    delete: string;
    edit: string;
    listTitle: string;
    loading: string;
    notAllowed: string;
    roleInUse: string;
  };
  members: OrganizationMember[];
  onActionDenied: (description: string) => void;
  onDelete: (role: OrganizationRole) => void;
  onEdit: (role: OrganizationRole) => void;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground">{labels.listTitle}</h2>
      <div className="grid gap-2 xl:grid-cols-2">
        {isLoading && <LoadingRow label={labels.loading} rows={2} />}
        {defaultRoleNames.map((role) => (
          <RoleRow
            key={role}
            role={role}
            roleLabels={defaultRoleLabels}
            locked
            labels={{ builtIn: labels.builtIn, edit: labels.edit, delete: labels.delete }}
          />
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
              onEdit={canUpdateRoles ? () => onEdit(role) : undefined}
              onDelete={() => {
                if (!canDeleteRoles) {
                  onActionDenied(labels.notAllowed);
                  return;
                }
                if (roleInUse) {
                  onActionDenied(labels.roleInUse);
                  return;
                }
                onDelete(role);
              }}
              labels={{ builtIn: labels.custom, edit: labels.edit, delete: labels.delete }}
            />
          );
        })}
      </div>
    </section>
  );
}
