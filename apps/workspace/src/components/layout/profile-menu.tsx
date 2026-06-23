"use client";

import { useTransition, useState } from "react";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { CircleUser, LogOut, Building, Settings, MoreHorizontal, Moon, Sun, Globe } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "@/components/providers/theme-provider";
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
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function ProfileMenu() {
  const t = useTranslations("ProfileMenu");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { isDark, setTheme } = useTheme();
  
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, startLogoutTransition] = useTransition();
  const account = useAccountContext();

  const handleLogout = () => {
    startLogoutTransition(async () => {
      await authClient.signOut();
      setLogoutOpen(false);
      router.replace("/sign-in");
      router.refresh();
    });
  };

  const nextLocale = locale === "ar" ? "en" : "ar";
  const languageLabel = locale === "ar" ? "English" : "العربية";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="rounded-full outline-none focus-visible:ring-0 focus-visible:ring-offset-0">
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
          className="w-[260px] max-w-[calc(100vw-24px)] rounded-xl shadow-sm border-border p-2 bg-popover"
        >
          {/* User Info Header */}
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            {account.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={account.user.image} alt={account.user.name} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-black text-text-secondary shrink-0">
                {account.user.initials}
              </span>
            )}
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="font-semibold text-[13px] truncate text-foreground">{account.user.name}</span>
              <span className="text-xs text-muted-foreground truncate">{account.user.email}</span>
            </div>
          </div>
          
          <DropdownMenuSeparator />

          <DropdownMenuItem render={<Link href="/settings/workspace" />} className="py-2">
            <Building className="h-4 w-4 mr-2" />
            Organization
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/settings" />} className="py-2">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem className="py-2 text-muted-foreground">
            <MoreHorizontal className="h-4 w-4 mr-2" />
            More Options
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />

          <DropdownMenuItem 
            className="py-2 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              setTheme(isDark ? "light" : "dark");
            }}
          >
            {isDark ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </DropdownMenuItem>

          <DropdownMenuItem 
            render={<Link href={pathname} locale={nextLocale} />} 
            className="py-2"
          >
            <Globe className="h-4 w-4 mr-2" />
            {languageLabel}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            variant="destructive"
            className="py-2"
            onClick={() => setLogoutOpen(true)}
          >
            <LogOut className="h-4 w-4 mr-2" />
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
