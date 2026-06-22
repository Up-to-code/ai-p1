"use client";

import { useState, useCallback } from "react";
import { Check, ChevronDown, Link2, Shield, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ShareUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "editor" | "viewer" | "commenter";
}

export interface SharePopoverProps {
  /** Current share URL */
  url: string;
  /** Users with access */
  users: ShareUser[];
  /** General access level */
  generalAccess: "invited" | "link";
  /** Callback when invite is sent */
  onInvite?: (email: string, permission: string) => void;
  /** Callback when permission is changed */
  onPermissionChange?: (userId: string, permission: string) => void;
  /** Callback when general access is changed */
  onGeneralAccessChange?: (access: "invited" | "link") => void;
  /** Callback when link is copied */
  onCopyLink?: () => void;
  /** Locale for i18n */
  locale?: string;
}

// ─── Permission Labels ──────────────────────────────────────────────────────

const PERMISSION_LABELS: Record<string, Record<string, string>> = {
  en: {
    owner: "Owner",
    editor: "Can edit",
    viewer: "Can view",
    commenter: "Can comment",
  },
  ar: {
    owner: "المالك",
    editor: "يمكن التحرير",
    viewer: "يمكن المشاهدة",
    commenter: "يمكن التعليق",
  },
};

const GENERAL_ACCESS_LABELS: Record<string, Record<string, string>> = {
  en: {
    invited: "Only those invited",
    link: "Link Access",
  },
  ar: {
    invited: "المدعوون فقط",
    link: "الوصول بالرابط",
  },
};

// ─── Share Popover ──────────────────────────────────────────────────────────

export function SharePopover({
  url,
  users,
  generalAccess,
  onInvite,
  onPermissionChange,
  onGeneralAccessChange,
  onCopyLink,
  locale = "en",
}: SharePopoverProps) {
  const isAr = locale === "ar";
  const t = (key: string) => PERMISSION_LABELS[locale]?.[key] ?? PERMISSION_LABELS.en[key] ?? key;
  const tGeneral = (key: string) => GENERAL_ACCESS_LABELS[locale]?.[key] ?? GENERAL_ACCESS_LABELS.en[key] ?? key;

  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("viewer");
  const [copied, setCopied] = useState(false);

  const handleInvite = useCallback(() => {
    if (email.trim()) {
      onInvite?.(email.trim(), permission);
      setEmail("");
    }
  }, [email, permission, onInvite]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    onCopyLink?.();
    setTimeout(() => setCopied(false), 2000);
  }, [url, onCopyLink]);

  const invitedCount = users.filter((u) => u.role !== "owner").length;

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
          <PopoverTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 rounded-lg px-3 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">{isAr ? "مشاركة" : "Share"}</span>
              </Button>
            }
          />
        </TooltipTrigger>
        <TooltipContent side="bottom">{isAr ? "مشاركة هذا العنصر" : "Share this item"}</TooltipContent>
      </Tooltip>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[420px] p-5 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
      >
        <div className="flex flex-col gap-4">
          {/* ── Section 1: Invite Bar ── */}
          <div className="flex items-center gap-2">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInvite();
              }}
              placeholder={isAr ? "بريد إلكتروني، اسم…" : "Email, name…"}
              className="h-10 flex-1 rounded-lg border-0 bg-muted px-3 text-sm placeholder:text-muted-foreground"
            />
            <Select value={permission} onValueChange={(v) => v && setPermission(v)}>
              <SelectTrigger className="h-10 w-[100px] rounded-lg border-0 bg-muted px-2 text-sm font-semibold">
                <SelectValue>
                  {t(permission)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">{t("viewer")}</SelectItem>
                <SelectItem value="editor">{t("editor")}</SelectItem>
                <SelectItem value="commenter">{t("commenter")}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleInvite}
              disabled={!email.trim()}
              className="h-10 rounded-lg bg-foreground px-4 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-40"
            >
              {isAr ? "دعوة" : "Invite"}
            </Button>
          </div>

          {/* ── Section 2: General Access ── */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {isAr ? "الوصول العام" : "General access"}
            </span>

            <button
              type="button"
              onClick={() => onGeneralAccessChange?.("invited")}
              className={cn(
                "flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted",
                generalAccess === "invited" && "bg-muted"
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-muted">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-semibold text-foreground">{tGeneral("invited")}</span>
                <span className="text-xs text-muted-foreground">
                  {isAr ? `${invitedCount} أشخاص` : `${invitedCount} people`}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onGeneralAccessChange?.("link")}
              className={cn(
                "flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted",
                generalAccess === "link" && "bg-muted"
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-muted">
                <Link2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-semibold text-foreground">{tGeneral("link")}</span>
                <span className="text-xs text-muted-foreground">
                  {isAr ? "فقط المستخدمون בעלי الرابط" : "Only users have link access"}
                </span>
              </div>
            </button>
          </div>

          {/* ── Divider ── */}
          <div className="h-px w-full bg-border" />

          {/* ── Section 3: People with Access ── */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium text-muted-foreground">
              {isAr ? "الأشخاص ذوو الوصول" : "People with access"}
            </span>

            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                {/* Avatar */}
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-muted-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Name & Email */}
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <span className="truncate text-sm font-semibold text-foreground">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>

                {/* Permission */}
                {user.role === "owner" ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-foreground">{t("owner")}</span>
                    <Shield className="h-4 w-4 text-emerald-500" />
                  </div>
                ) : (
                  <Select
                    value={user.role}
                    onValueChange={(v) => v && onPermissionChange?.(user.id, v)}
                  >
                    <SelectTrigger className="h-8 w-auto rounded-lg border-0 bg-transparent px-2 text-xs font-semibold text-muted-foreground hover:bg-muted">
                      <SelectValue>
                        <span className="flex items-center gap-1">
                          {t(user.role)}
                          <ChevronDown className="h-3 w-3" />
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">{t("viewer")}</SelectItem>
                      <SelectItem value="editor">{t("editor")}</SelectItem>
                      <SelectItem value="commenter">{t("commenter")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>

          {/* ── Divider ── */}
          <div className="h-px w-full bg-border" />

          {/* ── Section 4: Copy Link Bar ── */}
          <div className="flex items-center gap-3">
            <span className="flex-1 truncate text-xs text-muted-foreground">{url}</span>
            <Button
              onClick={handleCopyLink}
              className="h-9 rounded-lg bg-foreground px-4 text-xs font-semibold text-background hover:opacity-90"
            >
              {copied ? (
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  {isAr ? "تم النسخ" : "Copied!"}
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" />
                  {isAr ? "نسخ الرابط" : "Copy Link"}
                </span>
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
