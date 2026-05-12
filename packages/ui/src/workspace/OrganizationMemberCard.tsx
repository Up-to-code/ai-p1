import { memo } from "react";
import { Mail } from "lucide-react";
import { cn } from "@anan/platform-core/classnames";
import type {
  WorkspaceOrganizationMemberDisplay,
  WorkspaceOrganizationMemberRole,
  WorkspaceOrganizationType,
} from "./types";

type OrganizationMemberVisualTheme = {
  borderClassName: string;
  avatarClassName: string;
  roleClassName: string;
  accentDotClassName: string;
  accentLabel: string;
};

export function getOrganizationMemberRoleLabel(role: WorkspaceOrganizationMemberRole): string {
  if (role === "manager") return "مدير";
  if (role === "viewer") return "مشاهد";
  return "عضو";
}

export function getOrganizationMemberInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "؟";
  return [...trimmed].slice(0, 1).join("").toUpperCase();
}

export function getOrganizationMemberTheme(
  organizationType: WorkspaceOrganizationType | null | undefined,
): OrganizationMemberVisualTheme {
  if (organizationType === "red") {
    return {
      borderClassName: "border-l-indigo-500 hover:border-indigo-200 dark:hover:border-indigo-500/40",
      avatarClassName:
        "bg-gradient-to-br from-indigo-50 to-slate-100 text-slate-500 dark:from-indigo-500/20 dark:to-slate-800 dark:text-slate-200",
      roleClassName:
        "border-indigo-100 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300",
      accentDotClassName: "bg-indigo-500",
      accentLabel: "فريق التطوير",
    };
  }

  return {
    borderClassName: "border-l-blue-500 hover:border-blue-200 dark:hover:border-blue-500/40",
    avatarClassName:
      "bg-gradient-to-br from-blue-50 to-slate-100 text-slate-500 dark:from-blue-500/20 dark:to-slate-800 dark:text-slate-200",
    roleClassName:
      "border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
    accentDotClassName: "bg-blue-500",
    accentLabel: "فريق الوساطة",
  };
}

const OrganizationMemberCardComponent = function OrganizationMemberCard({
  member,
  organizationType,
  footer,
  className,
}: {
  member: WorkspaceOrganizationMemberDisplay;
  organizationType: WorkspaceOrganizationType | null | undefined;
  footer?: React.ReactNode;
  className?: string;
}) {
  const theme = getOrganizationMemberTheme(organizationType);
  const roleLabel = getOrganizationMemberRoleLabel(member.role);
  const avatarLabel = getOrganizationMemberInitials(member.name);
  const isActive = member.statusLabel === "نشط";
  const usernameLabel = member.username ? `@${member.username}` : null;

  return (
    <article
      dir="rtl"
      className={cn(
        "rounded-2xl border border-border bg-card p-4 transition-all hover:bg-muted/30",
        theme.borderClassName,
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black",
            theme.avatarClassName,
          )}
        >
          {avatarLabel}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black",
                theme.roleClassName,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", theme.accentDotClassName)} aria-hidden="true" />
              {theme.accentLabel}
            </span>
            {usernameLabel ? (
              <span className="text-[11px] font-semibold text-muted-foreground">{usernameLabel}</span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[14px] font-bold text-foreground">{member.name}</h3>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                isActive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {member.statusLabel}
            </span>
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted-foreground" dir="ltr">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{member.email}</span>
          </p>
        </div>

        <span className="shrink-0 rounded-lg border border-border px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
          {roleLabel}
        </span>
      </div>

      {footer ? <div className="mt-3 border-t border-border pt-3">{footer}</div> : null}
    </article>
  );
};

export default memo(OrganizationMemberCardComponent);
