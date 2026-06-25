"use client";

import { useCallback, useState } from "react";
import { Bot, Check, ChevronDown, Link2, Mail, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { shareMcpDefaultPreset } from "./config/mcp-presets.config";
import { ShareInviteDialog } from "./components/share-invite-dialog";
import { ShareMcpDialog } from "./components/share-mcp-dialog";
import type { SharePopoverProps } from "./types";

export function SharePopover({
  url,
  users,
  onInvite,
  onCreateInviteLink,
  onCreateMcp,
  onCopyLink,
  inviteDisabled = false,
  linkAccessDisabled = false,
  inviting = false,
  updatingLinkAccess = false,
  allowInvite = true,
  showMcpSection = true,
  canCreateMcp = true,
}: SharePopoverProps) {
  const t = useTranslations("SharePopover");

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("viewer");
  const [mcpDialogOpen, setMcpDialogOpen] = useState(false);
  const [mcpName, setMcpName] = useState("");
  const [mcpPreset, setMcpPreset] = useState(shareMcpDefaultPreset);
  const [creatingMcp, setCreatingMcp] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayUrl = users.length > 0 ? url : "";

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
  }, [email, inviteDisabled, inviting, onInvite, permission]);

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
  }, [onCopyLink, url]);

  const handleCreateMcp = useCallback(async () => {
    if (!onCreateMcp || !mcpName.trim()) return;
    setCreatingMcp(true);
    try {
      await onCreateMcp({ name: mcpName.trim(), permission: mcpPreset });
      setMcpDialogOpen(false);
      setMcpName("");
    } finally {
      setCreatingMcp(false);
    }
  }, [mcpName, mcpPreset, onCreateMcp]);

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
                <span className="hidden sm:inline">{t("trigger")}</span>
              </Button>
            }
          />
        </TooltipTrigger>
        <TooltipContent side="bottom">{t("tooltip")}</TooltipContent>
      </Tooltip>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[260px] rounded-xl border-border bg-popover p-1 shadow-lg"
      >
        <div className="flex flex-col gap-0.5">
          {allowInvite && (
            <Button
              variant="ghost"
              onClick={handleOpenInviteDialog}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Mail className="h-4 w-4" />
              <span className="flex-1">{t("invite")}</span>
            </Button>
          )}

          {allowInvite && (
            <Button
              variant="ghost"
              onClick={handleCreateInviteLink}
              disabled={linkAccessDisabled || updatingLinkAccess}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Link2 className="h-4 w-4" />
              <span className="flex-1">{t("inviteLink")}</span>
            </Button>
          )}

          {displayUrl && (
            <Button
              variant="ghost"
              onClick={handleCopyLink}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              <span className="flex-1">{t("copyLink")}</span>
            </Button>
          )}

          {showMcpSection && canCreateMcp && (
            <>
              <div className="mx-2 my-1 h-px bg-border" />
              <Button
                variant="ghost"
                onClick={() => setMcpDialogOpen(true)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Bot className="h-4 w-4" />
                <span className="flex-1">{t("createMcp")}</span>
                <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-muted-foreground" />
              </Button>
            </>
          )}
        </div>
      </PopoverContent>

      <ShareInviteDialog
        open={inviteDialogOpen}
        email={email}
        permission={permission}
        inviting={inviting}
        inviteDisabled={inviteDisabled}
        onOpenChange={setInviteDialogOpen}
        onEmailChange={setEmail}
        onPermissionChange={setPermission}
        onSend={handleSendInvite}
      />

      <ShareMcpDialog
        open={mcpDialogOpen}
        name={mcpName}
        preset={mcpPreset}
        creating={creatingMcp}
        onOpenChange={setMcpDialogOpen}
        onNameChange={setMcpName}
        onPresetChange={setMcpPreset}
        onCreate={handleCreateMcp}
      />
    </Popover>
  );
}
