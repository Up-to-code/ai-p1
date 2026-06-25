"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, PanelLeft, Settings } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

import { ProfileMenu } from "@/components/layout/profile-menu";
import { WorkspaceGlobalSearch } from "@/components/layout/workspace-global-search";
import { ProjectSwitcher } from "@/components/layout/project-switcher";
import { SpaceSwitcher } from "@/components/layout/space-switcher";
import { useSidebar } from "@/components/layout/sidebar-context";
import { cn } from "@/lib/utils";
import { useLocale } from 'next-intl';
import { useWorkspaceStore } from "@/domains/dashboard/store/dashboard.store";
import { useSearchParams } from "next/navigation";
import { SharePopover } from "@/components/shared/share-popover";
import { useToast } from "@/components/ui/toast";
import { useAccountContext } from "@/domains/auth";
import { useAssistantPanel } from "@/components/layout/use-assistant-panel";
import {
  createOrganizationInvitation,
  createOrganizationInviteLink,
  createOrganizationMcpConnection,
  getOrganizationCapabilities,
  listOrganizationMembers,
  updateOrganizationMemberRole,
  type McpConnectionPermission,
  type OrganizationCapabilities,
} from "@/domains/organization/api/clerk-organization-api";

function roleForSharePermission(permission: string) {
  return permission === "editor" ? "admin" : "member";
}

function readActions(canRead: boolean) {
  return canRead ? ["read" as const] : [];
}

function writeActions(canRead: boolean, canCreate: boolean, canUpdate: boolean) {
  return [
    canRead && "read",
    canCreate && "create",
    canUpdate && "update",
  ].filter(Boolean) as Array<"read" | "create" | "update">;
}

function mcpPermissionsForShare(
  capabilities: OrganizationCapabilities | undefined,
  permission: string,
): McpConnectionPermission[] {
  if (!capabilities) return [];
  const canEdit = permission === "editor";
  const permissions: McpConnectionPermission[] = [
    {
      resource: "organization",
      actions: readActions(capabilities.canReadOrganization),
    },
    {
      resource: "client",
      actions: canEdit
        ? writeActions(capabilities.canReadClients, capabilities.canCreateClients, capabilities.canUpdateClients)
        : readActions(capabilities.canReadClients),
    },
    {
      resource: "project",
      actions: canEdit
        ? writeActions(capabilities.canReadProjects, capabilities.canCreateProjects, capabilities.canUpdateProjects)
        : readActions(capabilities.canReadProjects),
    },
    {
      resource: "deal",
      actions: canEdit
        ? writeActions(capabilities.canReadClients, capabilities.canCreateClients, capabilities.canUpdateClients)
        : readActions(capabilities.canReadClients),
    },
    {
      resource: "calendar",
      actions: canEdit
        ? writeActions(capabilities.canReadCalendarEvents, capabilities.canCreateCalendarEvents, capabilities.canUpdateCalendarEvents)
        : readActions(capabilities.canReadCalendarEvents),
    },
    {
      resource: "task",
      actions: canEdit
        ? writeActions(capabilities.canReadTasks, capabilities.canCreateTasks, capabilities.canUpdateTasks)
        : readActions(capabilities.canReadTasks),
    },
    {
      resource: "media",
      actions: canEdit
        ? writeActions(capabilities.canReadMedia, capabilities.canCreateMedia, capabilities.canUpdateMedia)
        : readActions(capabilities.canReadMedia),
    },
  ];

  return permissions.filter((item) => item.actions.length > 0);
}

export function Topbar() {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const { isOpen, toggleSidebar } = useSidebar();
  const account = useAccountContext();
  const { toast } = useToast();
  const { togglePanel, isOpen: isAiPanelOpen } = useAssistantPanel();
  const setActiveAiThreadId = useWorkspaceStore((state) => state.setActiveAiThreadId);
  const searchParams = useSearchParams();
  const organizationId = account.workspace.status === "ready" ? account.workspace.organizationId ?? undefined : undefined;
  const [currentUrl, setCurrentUrl] = useState("");
  const [shareAccess, setShareAccess] = useState<"invited" | "link">("invited");
  const [sharePermission, setSharePermission] = useState("viewer");
  const [mcpShareUrl, setMcpShareUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, [searchParams]);

  const membersQuery = useQuery({
    queryKey: ["topbar-share-members", organizationId],
    queryFn: () => listOrganizationMembers(organizationId ?? ""),
    enabled: Boolean(organizationId),
  });

  const capabilitiesQuery = useQuery({
    queryKey: ["topbar-share-capabilities", organizationId],
    queryFn: () => getOrganizationCapabilities(organizationId ?? ""),
    enabled: Boolean(organizationId),
  });

  const shareUsers = useMemo(() => {
    return (membersQuery.data ?? []).map((member) => ({
      id: member.id,
      name: member.user?.name || member.user?.email || member.userId,
      email: member.user?.email || member.userId,
      avatar: member.user?.image ?? undefined,
      role: member.role.includes("owner")
        ? "owner" as const
        : member.role.includes("admin")
          ? "editor" as const
          : "viewer" as const,
    }));
  }, [membersQuery.data]);

  const capabilities = capabilitiesQuery.data;
  const canInviteMembers = Boolean(capabilities?.canInviteMembers);
  const canUpdateMembers = Boolean(capabilities?.canUpdateMembers);
  const canCreateMcpLink = Boolean(capabilities?.canReadOrganization);

  const inviteMutation = useMutation({
    mutationFn: ({ email, permission }: { email: string; permission: string }) =>
      createOrganizationInvitation(organizationId ?? "", {
        email,
        role: roleForSharePermission(permission),
      }),
    onSuccess: () => {
      toast({
        title: locale === "ar" ? "تم إرسال الدعوة" : "Invite sent",
        description: locale === "ar" ? "تم إرسال دعوة المؤسسة." : "The organization invitation was sent.",
        type: "success",
      });
    },
    onError: (error) => {
      toast({
        title: locale === "ar" ? "تعذر إرسال الدعوة" : "Invite failed",
        description: error.message,
        type: "error",
      });
    },
  });

  const inviteLinkMutation = useMutation({
    mutationFn: (role: string) => createOrganizationInviteLink(organizationId ?? "", { role, locale }),
    onSuccess: async (result) => {
      setShareAccess("link");
      setMcpShareUrl(result.inviteUrl);
      await navigator.clipboard?.writeText(result.inviteUrl).catch(() => undefined);
      toast({
        title: locale === "ar" ? "تم إنشاء رابط الدعوة" : "Invite link created",
        description: locale === "ar" ? "تم نسخ الرابط." : "The link was copied to your clipboard.",
        type: "success",
      });
    },
    onError: (error) => {
      toast({
        title: locale === "ar" ? "تعذر إنشاء الرابط" : "Link failed",
        description: error.message,
        type: "error",
      });
    },
  });

  const mcpLinkMutation = useMutation({
    mutationFn: (permission: string) => {
      const permissions = mcpPermissionsForShare(capabilities, permission);
      if (permissions.length === 0) {
        throw new Error(locale === "ar" ? "لا توجد صلاحيات يمكن مشاركتها." : "No shareable MCP permissions are available.");
      }
      return createOrganizationMcpConnection(organizationId ?? "", {
        name: locale === "ar" ? "رابط مشاركة" : "Share link",
        instructions: locale === "ar"
          ? "استخدم هذا الرابط للوصول إلى بيانات المؤسسة المسموح بها فقط."
          : "Use this link only for the organization data allowed by this Share action.",
        principalType: "user",
        permissions,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });
    },
    onSuccess: async (result) => {
      setShareAccess("link");
      setMcpShareUrl(result.agentLink);
      await navigator.clipboard?.writeText(result.agentLink).catch(() => undefined);
      toast({
        title: locale === "ar" ? "تم إنشاء رابط MCP" : "MCP link created",
        description: locale === "ar" ? "تم نسخ الرابط." : "The link was copied to your clipboard.",
        type: "success",
      });
    },
    onError: (error) => {
      toast({
        title: locale === "ar" ? "تعذر إنشاء الرابط" : "Link failed",
        description: error.message,
        type: "error",
      });
    },
  });

  const memberPermissionMutation = useMutation({
    mutationFn: ({ memberId, permission }: { memberId: string; permission: string }) =>
      updateOrganizationMemberRole(organizationId ?? "", memberId, roleForSharePermission(permission)),
    onSuccess: () => {
      toast({
        title: locale === "ar" ? "تم تحديث الوصول" : "Access updated",
        description: locale === "ar" ? "تم تحديث صلاحية العضو." : "The member access level was updated.",
        type: "success",
      });
    },
    onError: (error) => {
      toast({
        title: locale === "ar" ? "تعذر تحديث الوصول" : "Access update failed",
        description: error.message,
        type: "error",
      });
    },
  });

  useEffect(() => {
    const threadId = searchParams.get("threadId")?.trim();
    if (threadId) setActiveAiThreadId(threadId);
  }, [searchParams, setActiveAiThreadId]);

  return (
    <header className={cn(
      "flex h-14 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-xl backdrop-saturate-150 px-8 transition-all duration-300 sticky top-0 z-30 shadow-sm shadow-[var(--q-user-bubble)]/5",
      isRtl && "font-cairo"
    )}>

      <div className="flex flex-1 items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-text-muted hover:bg-[var(--color-divider)] hover:text-text-primary"
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <ProjectSwitcher />
        <SpaceSwitcher />
        <WorkspaceGlobalSearch />
        <Link
          href="/settings/organization"
          className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:bg-muted hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </Link>
      </div>

        <div className="flex items-center gap-2">
          <SharePopover
            url={mcpShareUrl || currentUrl}
            users={shareUsers}
            generalAccess={shareAccess}
            locale={locale}
            allowInvite
            showMcpSection
            canCreateMcp={Boolean(canCreateMcpLink)}
            onInvite={(email, permission) => {
              setSharePermission(permission);
              return inviteMutation.mutateAsync({ email, permission }).then(() => undefined);
            }}
            onCreateInviteLink={(permission) => {
              setSharePermission(permission);
              void inviteLinkMutation.mutateAsync(permission).then((result) => {
                if (result?.inviteUrl) {
                  setMcpShareUrl(result.inviteUrl);
                  setShareAccess("link");
                }
              });
            }}
            onCreateMcp={({ name, permission }) => {
              void mcpLinkMutation.mutateAsync(permission).then((result) => {
                if (result?.agentLink) {
                  setMcpShareUrl(result.agentLink);
                  setShareAccess("link");
                }
              });
            }}
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={togglePanel}
            className={cn(
              "h-8 w-8 transition-colors",
              isAiPanelOpen
                ? "bg-[var(--q-user-bubble)]/10 text-[var(--q-user-bubble)] hover:bg-[var(--q-user-bubble)]/20"
                : "text-text-muted hover:bg-[var(--color-divider)] hover:text-text-primary"
            )}
            aria-label={isAiPanelOpen ? "Close AI Assistant" : "Open AI Assistant"}
          >
            <Bot className="h-4 w-4" />
          </Button>

          <div className="ms-2 border-l border-[var(--color-divider)] ps-4">
            <ProfileMenu />
          </div>
        </div>
    </header>
  );
}
