"use client";

import { useTransition, useState } from "react";
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
import { useAccountContext } from "@/domains/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProfileMenu() {
  const t = useTranslations("ProfileMenu");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, startLogoutTransition] = useTransition();
  const account = useAccountContext();
  const handleLogout = () => {
    startLogoutTransition(() => {
      const form = document.createElement("form");
      form.method = "post";
      form.action = "/api/auth/workos/logout";
      form.style.display = "none";
      document.body.appendChild(form);
      form.submit();
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="rounded-full">
              {account.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={account.user.image} alt={account.user.name} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-[10px] font-black text-text-secondary">
                  {account.user.initials}
                </span>
              )}
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
            <AlertDialogCancel disabled={isLoggingOut}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isLoggingOut}
              onClick={(event) => {
                event.preventDefault();
                handleLogout();
              }}
            >
              {t("logout")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
