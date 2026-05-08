"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { CircleUser, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProfileMenu() {
  const t = useTranslations("ProfileMenu");
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5 text-text-muted" />
              <span className="sr-only">{t("open")}</span>
            </Button>
          }
        />
        <DropdownMenuContent
          align="end"
          collisionPadding={12}
          sideOffset={8}
          className="w-44 max-w-[calc(100vw-24px)]"
        >
          <DropdownMenuItem render={<Link href="/profile/settings" />}>
            <CircleUser className="h-4 w-4" />
            {t("viewProfile")}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setLogoutOpen(true)}
          >
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("logoutTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("logoutDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => setLogoutOpen(false)}
            >
              {t("logout")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
