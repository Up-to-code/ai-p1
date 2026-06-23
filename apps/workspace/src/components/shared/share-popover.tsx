"use client";

import { useState, useCallback, useEffect } from "react";
import { Check, ChevronDown, Link2, Mail, Plus, Settings2, UserPlus, Users, X, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  /** Callback when email invite is sent */
  onInvite?: (email: string, permission: string) => void | Promise<void>;
  /** Callback when general access is changed (link generated) */
  onGeneralAccessChange?: (access: "invited" | "link") => void | Promise<void>;
  /** Callback when link is copied */
  onCopyLink?: () => void | Promise<void>;
  /** Callback when invite link is created */
  onCreateInviteLink?: (role: string) => void | Promise<void>;
  /** Callback when MCP connection is created */
  onCreateMcp?: (input: { name: string; permission: string }) => void | Promise<void>;
  /** Disables invite controls */
  inviteDisabled?: boolean;
  /** Disables link access controls */
  linkAccessDisabled?: boolean;
  /** True while an invite request is in flight */
  inviting?: boolean;
  /** True while a link access request is in flight */
  updatingLinkAccess?: boolean;
  /** Locale for i18n */
  locale?: string;
  /** If true, shows invite options */
  allowInvite?: boolean;
  /** If true, shows MCP section */
  showMcpSection?: boolean;
  /** If true, user can create MCP */
  canCreateMcp?: boolean;
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

const MCP_PRESETS = [
  { id: "client", labelEn: "Client", labelAr: "العملاء" },
  { id: "calendar", labelEn: "Calendar", labelAr: "التقويم" },
  { id: "full", labelEn: "Full Access", labelAr: "وصول كامل" },
];

// ─── Share Menu ─────────────────────────────────────────────────────────────

export function SharePopover({
  url,
  users,
  generalAccess,
  onInvite,
  onGeneralAccessChange,
  onCopyLink,
  onCreateInviteLink,
  onCreateMcp,
  inviteDisabled = false,
  linkAccessDisabled = false,
  inviting = false,
  updatingLinkAccess = false,
  locale = "en",
  allowInvite = true,
  showMcpSection = true,
  canCreateMcp = true,
}: SharePopoverProps) {
  const isAr = locale === "ar";
  const t = (key: string) => PERMISSION_LABELS[locale]?.[key] ?? PERMISSION_LABELS.en[key] ?? key;
  const tGeneral = (key: string) => GENERAL_ACCESS_LABELS[locale]?.[key] ?? GENERAL_ACCESS_LABELS.en[key] ?? key;
  const { toast } = useToast();

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("viewer");

  const [mcpDialogOpen, setMcpDialogOpen] = useState(false);
  const [mcpName, setMcpName] = useState("");
  const [mcpPreset, setMcpPreset] = useState("client");
  const [creatingMcp, setCreatingMcp] = useState(false);

  const [copied, setCopied] = useState(false);

  const handleOpenInviteDialog = () => {
    setEmail("");
    setPermission("viewer");
    setInviteDialogOpen(true);
  };

  const handleSendInvite = useCallback(async () => {
    const nextEmail = email.trim();
    if (!nextEmail || inviteDisabled || inviting) return;
    await onInvite?.(nextEmail, permission);
    setInviteDialogOpen(false);
    setEmail("");
  }, [email, permission, onInvite, inviteDisabled, inviting]);

  const handleCreateInviteLink = useCallback(async () => {
    if (!onCreateInviteLink) return;
    await onCreateInviteLink(permission);
  }, [onCreateInviteLink, permission]);

  const handleCopyLink = useCallback(async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url).catch(() => undefined);
    setCopied(true);
    await onCopyLink?.();
    setTimeout(() => setCopied(false), 2000);
  }, [url, onCopyLink]);

  const handleCreateMcp = useCallback(async () => {
    if (!onCreateMcp || !mcpName.trim()) return;
    setCreatingMcp(true);
    try {
      await onCreateMcp({ name: mcpName.trim(), permission: mcpPreset });
      setMcpDialogOpen(false);
      setMcpName("");
      toast({
        title: isAr ? "تم إنشاء رابط MCP" : "MCP link created",
        description: isAr ? "تم نسخ الرابط." : "The link was copied to your clipboard.",
        type: "success",
      });
    } catch (error) {
      toast({
        title: isAr ? "تعذر إنشاء الرابط" : "Link failed",
        description: error instanceof Error ? error.message : "Unknown error",
        type: "error",
      });
    } finally {
      setCreatingMcp(false);
    }
  }, [onCreateMcp, mcpName, mcpPreset, isAr, toast]);

  const displayUrl = users.length > 0 ? url : "";

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
        className="w-[260px] rounded-xl shadow-lg border-border bg-popover p-1"
      >
        <div className="flex flex-col gap-0.5">
          {/* Invite */}
          {allowInvite && (
            <Button
              variant="ghost"
              onClick={handleOpenInviteDialog}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Mail className="h-4 w-4" />
              <span className="flex-1">{isAr ? "دعوة" : "Invite"}</span>
            </Button>
          )}

          {/* Create Custom Invite Link */}
          {allowInvite && (
            <Button
              variant="ghost"
              onClick={handleCreateInviteLink}
              disabled={linkAccessDisabled || updatingLinkAccess}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Link2 className="h-4 w-4" />
              <span className="flex-1">{isAr ? "رابط دعوة" : "Invite Link"}</span>
            </Button>
          )}

          {/* Copy Invite Link */}
          {displayUrl && (
            <Button
              variant="ghost"
              onClick={handleCopyLink}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              <span className="flex-1">{isAr ? "نسخ الرابط" : "Copy Link"}</span>
            </Button>
          )}

          {/* MCP */}
          {showMcpSection && canCreateMcp && (
            <>
              <div className="h-px bg-border mx-2 my-1" />
              <Button
                variant="ghost"
                onClick={() => setMcpDialogOpen(true)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Bot className="h-4 w-4" />
                <span className="flex-1">{isAr ? "إنشاء MCP" : "Create MCP"}</span>
                <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-muted-foreground" />
              </Button>
            </>
          )}
        </div>
      </PopoverContent>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="max-w-lg rounded-2xl p-6">
          <DialogHeader className="pe-8 text-start">
            <DialogTitle className="text-base font-black text-foreground">
              {isAr ? "إرسال دعوة" : "Send Invite"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {isAr ? "البريد الإلكتروني" : "Email"}
              </Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAr ? "بريد إلكتروني..." : "Email..."}
                className="h-10 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {isAr ? "الصلاحية" : "Permission"}
              </Label>
              <Select value={permission} onValueChange={(v) => v && setPermission(v)}>
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">{t("viewer")}</SelectItem>
                  <SelectItem value="editor">{t("editor")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="justify-start gap-2">
            <Button
              variant="ghost"
              onClick={() => setInviteDialogOpen(false)}
              className="rounded-lg"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={handleSendInvite}
              disabled={!email.trim() || inviteDisabled || inviting}
              className="h-10 rounded-lg bg-primary px-5 text-[10px] font-black uppercase tracking-widest text-primary-foreground hover:bg-black"
            >
              {isAr ? "إرسال" : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MCP Creation Dialog */}
      <Dialog open={mcpDialogOpen} onOpenChange={setMcpDialogOpen}>
        <DialogContent className="max-w-lg rounded-2xl p-6">
          <DialogHeader className="pe-8 text-start">
            <DialogTitle className="text-base font-black text-foreground">
              {isAr ? "إنشاء رابط MCP" : "Create MCP Link"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {isAr ? "الاسم" : "Name"}
              </Label>
              <Input
                value={mcpName}
                onChange={(e) => setMcpName(e.target.value)}
                placeholder={isAr ? "مثال: وكيل المبيعات" : "e.g. Sales Agent"}
                className="h-10 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {isAr ? "النموذج" : "Preset"}
              </Label>
              <Select value={mcpPreset} onValueChange={(v) => v && setMcpPreset(v)}>
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MCP_PRESETS.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {isAr ? preset.labelAr : preset.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="justify-start gap-2">
            <Button
              variant="ghost"
              onClick={() => setMcpDialogOpen(false)}
              className="rounded-lg"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={handleCreateMcp}
              disabled={!mcpName.trim() || creatingMcp}
              className="h-10 rounded-lg bg-primary px-5 text-[10px] font-black uppercase tracking-widest text-primary-foreground hover:bg-black"
            >
              {creatingMcp ? (
                <span className="flex items-center gap-2">
                  <Settings2 className="h-3.5 w-3.5 animate-spin" />
                  {isAr ? "جاري الإنشاء..." : "Creating..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="h-3.5 w-3.5" />
                  {isAr ? "إنشاء" : "Create"}
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Popover>
  );
}