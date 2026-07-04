"use client";

import { Link2, Mail, Bot, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { TopbarAssistantButton } from "./components/topbar-assistant-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

/** Right-side topbar actions: share, AI assistant, and profile menu. */
export function TopbarActions() {
  const t = useTranslations("SharePopover");

  return (
    <div className="flex items-center gap-1.5">
      <DropdownMenu>
        <DropdownMenuTrigger
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
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-56 rounded-xl border-border p-1.5"
        >
          <DropdownMenuItem className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer">
            <Link2 className="h-4 w-4" />
            <span className="text-xs font-semibold">Create Invite Link</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer">
            <Mail className="h-4 w-4" />
            <span className="text-xs font-semibold">Invite by Email</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer">
            <Bot className="h-4 w-4" />
            <span className="text-xs font-semibold">Create MCP</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TopbarAssistantButton />
      <div className="ms-2 border-l border-border/50 ps-3">
        <ProfileMenu />
      </div>
    </div>
  );
}
